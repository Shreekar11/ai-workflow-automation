import { PrismaClient } from "@prisma/client";
import { RedisClientType } from "redis";
import { JsonObject } from "@prisma/client/runtime/library";
import { parser } from "../utils/parser";
import {
  availableEmailId,
  availableGoogleSheetsId,
  QUEUE_NAME,
} from "../config";
import { EmailService } from "../services/mail.service";
import { GoogleSheetsService } from "../services/sheets.service";

export async function processWorkflowMessage(
  client: PrismaClient,
  redisClient: RedisClientType,
  workflowRunId: string,
  stage: number
) {
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

  try {
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

      await client.workflowRun.update({
        where: { id: workflowRunDetails?.id },
        data: { status: "completed" },
      });
    }

    // google sheets action
    if (currentAction.type.id === availableGoogleSheetsId) {
      const workflowRunMetadata = workflowRunDetails?.metadata;
      const sheetId = parser(
        (currentAction.metadata as JsonObject)?.sheetId as string,
        workflowRunMetadata
      );

      let range = parser(
        (currentAction.metadata as JsonObject)?.range as string,
        workflowRunMetadata
      );

      if (range.startsWith("Sheet!")) {
        range = range.replace("Sheet!", "Sheet1!");
      } else {
        range = `Sheet1!${range}`;
      }

      const valuesStr = parser(
        (currentAction.metadata as JsonObject)?.values as string,
        workflowRunMetadata
      );

      const values = valuesStr.split(",");

      const sheetsService = new GoogleSheetsService(sheetId, range, values);

      await sheetsService.appendToSheet();
      console.log(`Added row to Google Sheet ${sheetId} in range ${range}`);

      await client.workflowRun.update({
        where: { id: workflowRunDetails?.id },
        data: { status: "completed" },
      });
    }
  } catch (error: any) {
    await client.workflowRun.update({
      where: { id: workflowRunDetails?.id },
      data: {
        status: "failed",
      },
    });

    throw error;
  }

  const lastStage = (workflowRunDetails?.workflow.actions.length || 1) - 1;
  if (lastStage !== stage) {
    const nextMessage = JSON.stringify({
      stage: stage + 1,
      workflowRunId,
    });
    await redisClient.lPush(QUEUE_NAME, nextMessage);
  }
} 