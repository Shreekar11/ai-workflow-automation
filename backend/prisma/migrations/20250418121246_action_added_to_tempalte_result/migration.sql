-- AlterTable
ALTER TABLE "TemplateAction" ADD COLUMN     "templateResultId" TEXT;

-- AddForeignKey
ALTER TABLE "TemplateAction" ADD CONSTRAINT "TemplateAction_templateResultId_fkey" FOREIGN KEY ("templateResultId") REFERENCES "TemplateResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;
