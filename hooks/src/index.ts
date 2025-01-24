import cors from "cors";
import express from "express";
import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";
import { QUEUE_NAME } from "./config";
import cron from "node-cron";
import axios from "axios";
import dotenv from "dotenv";

const client = new PrismaClient();
const app = express();

dotenv.config();

const corsOptions = {
  origin: [
    "*",
    "https://workflows-flax.vercel.app",
    "https://clerk.com",
    "http://localhost:3000",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "clerk-user-id",
    "Authorization",
    "clerk-session-id",
    "x-csrf-token",
  ],
  credentials: true,
  maxAge: 600,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  next();
});

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error:", err));

const BATCH_SIZE = 10;
const PROCESSING_INTERVAL = 5000;

app.options("*", cors(corsOptions));

function initHealthCheck() {
  const healthCheckUrl = process.env.WEBHOOK_URL;
  if (!healthCheckUrl) {
    console.error("WEBHOOK_URL not configured for health check");
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

app.post("/hooks/:workflowId", async (req, res) => {
  const workflowId = req.params.workflowId;
  const body = req.body.data;

  try {
    await client.$transaction(async (tx) => {
      const run = await tx.workflowRun.create({
        data: {
          workflowId,
          metadata: body,
        },
      });

      await tx.workflowRunOutbox.create({
        data: {
          workflowRunId: run.id,
        },
      });
    });

    res.status(200).json({ status: true, message: "Webhook Trigger received" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
});

async function processOutboxMessages() {
  try {
    const pendingRows = await client.workflowRunOutbox.findMany({
      where: {},
      take: BATCH_SIZE,
    });

    if (pendingRows.length > 0) {
      const pipeline = redisClient.multi();

      pendingRows.forEach((item) => {
        const message = JSON.stringify({
          workflowRunId: item.workflowRunId,
          stage: 0,
        });
        pipeline.lPush(QUEUE_NAME, message);
      });

      await pipeline.exec();

      await client.workflowRunOutbox.deleteMany({
        where: {
          id: {
            in: pendingRows.map((item) => item.id),
          },
        },
      });

      console.log(`Processed ${pendingRows.length} messages`);
    }
  } catch (error) {
    console.error("Error processing outbox messages:", error);
  }
}

async function startServer() {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");

    initHealthCheck();
    setInterval(processOutboxMessages, PROCESSING_INTERVAL);

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });

    redisClient.on("disconnect", () => {
      console.error("Redis connection lost. Attempting to reconnect...");
    });

    process.on("SIGTERM", async () => {
      console.log("Shutting down server...");
      await redisClient.quit();
      await client.$disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

startServer().catch(console.error);
