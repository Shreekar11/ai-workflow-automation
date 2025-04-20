/*
  Warnings:

  - You are about to drop the column `templateResultId` on the `TemplateAction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TemplateAction" DROP CONSTRAINT "TemplateAction_templateResultId_fkey";

-- AlterTable
ALTER TABLE "TemplateAction" DROP COLUMN "templateResultId";
