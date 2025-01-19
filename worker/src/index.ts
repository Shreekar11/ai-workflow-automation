import { Kafka } from "kafkajs";
import {
  availableEmailId,
  availableGoogleSheetsId,
  TOPIC_NAME,
} from "./config";
import { PrismaClient } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
import { parser } from "./utils/parser";
import dotenv from "dotenv";
import { EmailService } from "./services/mail.service";
import { GoogleSheetsService } from "./services/sheets.service";

dotenv.config();

const client = new PrismaClient();

const kafka = new Kafka({
  clientId: "outbox-worker",
  brokers: ["localhost:9092"],
});

async function main() {
  const consumer = kafka.consumer({ groupId: "outbox-worker" });
  await consumer.connect();

  const producer = kafka.producer();
  await producer.connect();

  await consumer.subscribe({
    topic: TOPIC_NAME,
    fromBeginning: true,
  });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        partition,
        offset: message.offset,
        value: message.value?.toString(),
      });

      if (!message.value?.toString()) {
        return;
      }

      const parsedValue = JSON.parse(message.value?.toString());
      const workflowRunId = parsedValue.workflowRunId;
      const stage = parsedValue.stage;

      const workflowRunDetails = await client.workflowRun.findFirst({
        where: {
          id: workflowRunId,
        },
        include: {
          workflow: {
            include: {
              actions: {
                include: {
                  type: true,
                },
              },
            },
          },
        },
      });
      
      const currentAction = workflowRunDetails?.workflow.actions.find(
        (action) => action.sortingOrder === stage
      );
      
      if (!currentAction) {
        console.log("Current action not found");
        return;
      }

      // email action
      if (currentAction.type.id === availableEmailId) {
        const workflowRunMetadata = workflowRunDetails?.metadata;
        const to = parser(
          (currentAction.metadata as JsonObject)?.to as string,
          workflowRunMetadata
        );
        const from = parser(
          (currentAction.metadata as JsonObject)?.from as string,
          workflowRunMetadata
        );
        const subject = parser(
          (currentAction.metadata as JsonObject)?.subject as string,
          workflowRunMetadata
        );
        const body = parser(
          (currentAction.metadata as JsonObject)?.body as string,
          workflowRunMetadata
        );

        const emailService = new EmailService(to, from, subject, body);
        await emailService.sendEmailFunction();
        console.log(`Sending out Email to ${to}, body is ${body}`);
      }

      // google sheets action
      if (currentAction.type.id === availableGoogleSheetsId) {
        const workflowRunMetadata = workflowRunDetails?.metadata;
        const sheetId = parser(
          (currentAction.metadata as JsonObject)?.sheetId as string,
          workflowRunMetadata
        );
        const range = parser(
          (currentAction.metadata as JsonObject)?.range as string,
          workflowRunMetadata
        );
        const values = parser(
          (currentAction.metadata as JsonObject)?.values as string,
          workflowRunMetadata
        );

        const sheetsService = new GoogleSheetsService(
          sheetId,
          range,
          JSON.parse(values)
        );
        await sheetsService.appendToSheet();
        console.log(`Added row to Google Sheet ${sheetId} in range ${range}`);
      }

      const lastStage = (workflowRunDetails?.workflow.actions.length || 1) - 1;
      if (lastStage !== stage) {
        await producer.send({
          topic: TOPIC_NAME,
          messages: [
            {
              value: JSON.stringify({
                stage: stage + 1,
                workflowRunId,
              }),
            },
          ],
        });
      }

      console.log("Processing completed");

      await consumer.commitOffsets([
        {
          topic: TOPIC_NAME,
          partition,
          offset: (parseInt(message.offset) + 1).toString(),
        },
      ]);
    },
  });
}

main();
