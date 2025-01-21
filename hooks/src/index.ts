import cors from "cors";
import express from "express";
import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";
import { QUEUE_NAME } from "./config";

const client = new PrismaClient();
const app = express();

// cors configuration
const corsOptions = {
  origin: ["*", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "clerk-user-id", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

const redisClient = createClient({
  url: "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error:", err));

const BATCH_SIZE = 10;
const PROCESSING_INTERVAL = 5000;

app.options("*", cors(corsOptions));

app.post("/hooks/:workflowId", async (req, res) => {
  const workflowId = req.params.workflowId;
  const body = req.body.data;

  try {
    // store new trigger in db
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

// processor function
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

    setInterval(processOutboxMessages, PROCESSING_INTERVAL);

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });

    // redis disconnection
    redisClient.on("disconnect", () => {
      console.error("Redis connection lost. Attempting to reconnect...");
    });

    // force shutdown
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
