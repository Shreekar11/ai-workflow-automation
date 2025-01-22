import http from "http";
import { createClient } from "redis";
import {
  availableEmailId,
  availableGoogleSheetsId,
  QUEUE_NAME,
} from "./config";
import { PrismaClient } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
import { parser } from "./utils/parser";
import dotenv from "dotenv";
import { EmailService } from "./services/mail.service";
import { GoogleSheetsService } from "./services/sheets.service";
import cron from 'node-cron'
import axios from "axios";

dotenv.config();

const client = new PrismaClient();
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error:", err));

// cron job
function initHealthCheck() {
  const healthCheckUrl = process.env.WORKER_URL;
  if (!healthCheckUrl) {
    console.error("BACKEND_URL not configured for health check");
    return;
  }

  cron.schedule("*/5 * * * *", async () => {
    try {
      const response = await axios.get(healthCheckUrl);
      console.log(`Health check succeeded: ${response.status}`);
    } catch (error: any) {
      console.error(`Health check failed: ${error.message}`);
    }
  });
  console.log("Health check cron job initialized");
}

async function processMessage(message: string) {
  try {
    const parsedValue = JSON.parse(message);
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
    }

    const lastStage = (workflowRunDetails?.workflow.actions.length || 1) - 1;
    if (lastStage !== stage) {
      const nextMessage = JSON.stringify({
        stage: stage + 1,
        workflowRunId,
      });
      await redisClient.lPush(QUEUE_NAME, nextMessage);
    }

    console.log("Processing completed");
  } catch (error) {
    console.error("Error processing message:", error);
  }
}

async function main() {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");

    initHealthCheck()

    // start processing messages
    while (true) {
      try {
        const result = await redisClient.brPop(QUEUE_NAME, 0);
        if (result) {
          const message = result.element;
          await processMessage(message);
        }
      } catch (error) {
        console.error("Error processing queue message:", error);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  } catch (error) {
    console.error("Failed to start worker:", error);
    process.exit(1);
  }
}

const server = http.createServer((req, res) => {
  if (req.url === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "Worker is running" }));
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not Found" }));
  }
});

server.listen(8000, () => {
  console.log("Worker HTTP server listening on port 8080");
});

// force shutdown
process.on("SIGTERM", async () => {
  console.log("Shutting down worker...");
  await redisClient.quit();
  await client.$disconnect();
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

main().catch(console.error);
