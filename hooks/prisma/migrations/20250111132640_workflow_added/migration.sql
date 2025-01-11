/*
  Warnings:

  - You are about to drop the column `zapId` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `zapId` on the `Trigger` table. All the data in the column will be lost.
  - You are about to drop the `Zap` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ZapRun` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ZapRunOutBox` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[workflowId]` on the table `Trigger` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `workflowId` to the `Action` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workflowId` to the `Trigger` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Action" DROP CONSTRAINT "Action_zapId_fkey";

-- DropForeignKey
ALTER TABLE "Trigger" DROP CONSTRAINT "Trigger_zapId_fkey";

-- DropForeignKey
ALTER TABLE "ZapRun" DROP CONSTRAINT "ZapRun_zapId_fkey";

-- DropForeignKey
ALTER TABLE "ZapRunOutBox" DROP CONSTRAINT "ZapRunOutBox_zapRunId_fkey";

-- DropIndex
DROP INDEX "Trigger_zapId_key";

-- AlterTable
ALTER TABLE "Action" DROP COLUMN "zapId",
ADD COLUMN     "workflowId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Trigger" DROP COLUMN "zapId",
ADD COLUMN     "workflowId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Zap";

-- DropTable
DROP TABLE "ZapRun";

-- DropTable
DROP TABLE "ZapRunOutBox";

-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL,
    "triggerId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowRun" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowRunOutbox" (
    "id" TEXT NOT NULL,
    "workflowRunId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowRunOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowRunOutbox_workflowRunId_key" ON "WorkflowRunOutbox"("workflowRunId");

-- CreateIndex
CREATE UNIQUE INDEX "Trigger_workflowId_key" ON "Trigger"("workflowId");

-- AddForeignKey
ALTER TABLE "Trigger" ADD CONSTRAINT "Trigger_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRunOutbox" ADD CONSTRAINT "WorkflowRunOutbox_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
