/*
  Warnings:

  - Added the required column `status` to the `WorkflowRun` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkflowRun" ADD COLUMN     "status" TEXT NOT NULL;
