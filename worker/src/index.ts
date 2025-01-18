import { Kafka } from "kafkajs";
import { availableEmailId, availableSolanaId, TOPIC_NAME } from "./config";
import { PrismaClient } from "@prisma/client";

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

      const workflowDetails = await client.workflowRun.findFirst({
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

      const currentAction = workflowDetails?.workflow.actions.find(
        (action) => action.sortingOrder === stage
      );

      if (!currentAction) {
        console.log("Current action not found");
        return;
      }
      
      // email action
      if (currentAction.type.id === availableEmailId) {
        console.log("Sending out Email");
      }

      // solana action
      if (currentAction.type.id === availableSolanaId) {
        console.log("Sending out Solana");
      }

      const lastStage = (workflowDetails?.workflow.actions.length || 1) - 1;
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
