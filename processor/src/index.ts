import { Kafka } from "kafkajs";
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: ["localhost:9092"],
});

async function main() {
  // connects to the kafka broker
  const producer = kafka.producer();
  await producer.connect();

  while (1) {
    // fetches the pending rows from the outbox table
    const pendingRows = await client.workflowRunOutbox.findMany({
      where: {},
      take: 10,
    });

    // the producer sends the workflowRunId to the kafka queue
    producer.send({
      topic: "zap-events",
      messages: pendingRows.map((item) => ({ value: item.workflowRunId })),
    });

    // after the pending rows are sent to the kafka queue, they are deleted from the outbox table
    await client.workflowRunOutbox.deleteMany({
      where: {
        id: {
          in: pendingRows.map((item) => item.id),
        },
      },
    });
  }
}

main();
