import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";
import { TOPIC_NAME } from "./config";

const client = new PrismaClient();
const app = express();

// CORS configuration
const corsOptions = {
  origin: ["*", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "clerk-user-id", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

const BATCH_SIZE = 10;
const PROCESSING_INTERVAL = 5000;

app.options("*", cors(corsOptions));

app.post("/hooks/:workflowId", async (req, res) => {
  const workflowId = req.params.workflowId;
  const body = req.body.data;

  console.log(body);

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
      await producer.send({
        topic: TOPIC_NAME,
        messages: pendingRows.map((item) => {
          return {
            value: JSON.stringify({
              workflowRunId: item.workflowRunId,
              stage: 0,
            }),
          };
        }),
      });

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
    await producer.connect();
    console.log("Connected to Kafka");

    // start the background processor
    setInterval(processOutboxMessages, PROCESSING_INTERVAL);

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });

    // force shutdown
    process.on("SIGTERM", async () => {
      console.log("Shutting down server...");
      await producer.disconnect();
      await client.$disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer().catch(console.error);
