import express from "express";
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

const app = express();

app.use(express.json());

app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
  const userId = req.params.userId;
  const zapId = req.params.zapId;
  const body = req.body;

  // store new trigger in db
  await client.$transaction(async (tx) => {
    const run = await tx.zapRun.create({
      data: {
        zapId,
        metadata: body,
      },
    });

    await tx.zapRunOutBox.create({
      data: {
        zapRunId: run.id,
      },
    });
  });

  res.json({ message: "Webhook Trigger received" });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
