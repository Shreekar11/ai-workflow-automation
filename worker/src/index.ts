import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import cron from "node-cron";
import axios from "axios";
import { processWorkflowMessage } from "./processors/workflow.processor";
import { RedisQueue } from "./queue/redis.queue";
import { Server } from "./server";
import { processTemplateMessage } from "./processors/template.processor";

dotenv.config();

const client = new PrismaClient();
const redisQueue = new RedisQueue();
const server = new Server(8000);

// cron job
function initHealthCheck() {
  const healthCheckUrl = process.env.WORKER_URL;
  if (!healthCheckUrl) {
    console.error("WORKER_URL not configured for health check");
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
    const templateId = parsedValue.templateId;
    const stage = parsedValue.stage;

    if (workflowRunId) {
      await processWorkflowMessage(
        client,
        redisQueue.getClient(),
        workflowRunId,
        stage
      );
    }

    if (templateId) {
      await processTemplateMessage(
        client,
        redisQueue.getClient(),
        templateId,
        stage
      );
    }

    console.log("Processing completed");
  } catch (error) {
    console.error("Error processing message:", error);
  }
}

async function main() {
  try {
    await redisQueue.connect();
    server.start();
    initHealthCheck();

    // start processing messages
    while (true) {
      try {
        const message = await redisQueue.popMessage();
        if (message) {
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

// force shutdown
process.on("SIGTERM", async () => {
  console.log("Shutting down worker...");
  await redisQueue.disconnect();
  await client.$disconnect();
  await server.shutdown();
  process.exit(0);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

main().catch(console.error);
