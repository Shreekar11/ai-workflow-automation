import http from "http";
import { createClient } from "redis";
import {
  availableEmailId,
  availableGoogleDocsId,
  availableGoogleSheetsId,
  availableModelId,
  availableScraperId,
  QUEUE_NAME,
} from "./config";
import { PrismaClient } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
import { parser } from "./utils/parser";
import dotenv from "dotenv";
import { EmailService } from "./services/mail.service";
import { GoogleSheetsService } from "./services/sheets.service";
import cron from "node-cron";
import axios from "axios";
import ScraperService from "./services/scraper.service";
import ModelService from "./services/model.service";

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

    if (templateId) {
      const templateResultData = await client.templateResult.findFirst({
        where: {
          templateId,
        },
        include: {
          template: {
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

      const currentAction = templateResultData?.template.actions.find(
        (action) => {
          action.sortingOrder === stage;
        }
      );

      const metadata = templateResultData?.metadata || {};

      // actions implementation :- (scraper, llm model, google doc)
      try {
        // scraper action
        if (currentAction?.type.id === availableScraperId) {
          const templateMetadata = templateResultData?.metadata;
          const url = parser(
            (currentAction.metadata as JsonObject)?.url as string,
            templateMetadata
          );
          const scraperService = new ScraperService(url);
          const actionResult = await scraperService.scraperAction();
          if (actionResult) {
            await client.templateResult.update({
              where: {
                id: templateResultData?.id,
              },
              data: {
                metadata: {
                  ...(metadata as object),
                  [`${currentAction.type.name.toLowerCase().trim()}_result`]:
                    actionResult,
                },
                status:
                  stage ===
                  (templateResultData?.template.actions.length || 1) - 1
                    ? "completed"
                    : "running",
              },
            });
          }
        }

        // llm model action
        if (currentAction?.type.id === availableModelId) {
          const templateMetadata = templateResultData?.metadata;
          const scraperResult = (currentAction.metadata as JsonObject)
            ?.scraper_result as JsonObject;
          const url = parser(scraperResult?.url as string, templateMetadata);
          const title = parser(
            scraperResult?.title as string,
            templateMetadata
          );
          const content = parser(
            scraperResult?.content as string,
            templateMetadata
          );
          const system = parser(
            (currentAction.metadata as JsonObject).system as string,
            templateMetadata
          );
          const model = parser(
            (currentAction.metadata as JsonObject).model as string,
            templateMetadata
          );
          const modelService = new ModelService(
            url,
            title,
            content,
            system,
            model
          );

          const actionResult = await modelService.llmAction();
          if (actionResult) {
            await client.templateResult.update({
              where: {
                id: templateResultData?.id,
              },
              data: {
                metadata: {
                  ...(metadata as object),
                  [`${currentAction.type.name.toLowerCase().trim()}_result`]:
                    actionResult,
                },
                status:
                  stage ===
                  (templateResultData?.template.actions.length || 1) - 1
                    ? "completed"
                    : "running",
              },
            });
          }
        }

        // google docs action
        if (currentAction?.type.id === availableGoogleDocsId) {
        }
      } catch (error) {}

      const lastStage = (templateResultData?.template.actions.length || 1) - 1;
      if (lastStage !== stage) {
        const nextMessage = JSON.stringify({
          stage: stage + 1,
          workflowRunId,
        });
        await redisClient.lPush(QUEUE_NAME, nextMessage);
      }

      console.log("Template actions processing completed");
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

    initHealthCheck();

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
    res.end(JSON.stringify({ message: "Worker is running" }));
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not Found" }));
  }
});

server.listen(8000, () => {
  console.log("Worker HTTP server listening on port 8000");
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
