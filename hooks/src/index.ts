import express from "express";
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

const app = express();

app.use(express.json());

app.post("/hooks/:workflowId", async (req, res) => {
  const workflowId = req.params.workflowId;
  const body = req.body;

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
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
