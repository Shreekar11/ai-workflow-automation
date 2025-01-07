import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";

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
    const pendingRows = await client.zapRunOutBox.findMany({
      where: {},
      take: 10,
    });

    // the producer sends the zapRunId to the kafka queue
    producer.send({
      topic: "zap-events",
      messages: pendingRows.map((item) => ({ value: item.zapRunId })),
    });

    // after the pending rows are sent to the kafka queue, they are deleted from the outbox table
    await client.zapRunOutBox.deleteMany({
      where: {
        id: {
          in: pendingRows.map((item) => item.id),
        },
      },
    });
  }
}

main();
