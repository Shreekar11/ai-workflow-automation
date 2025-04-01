-- CreateTable
CREATE TABLE "PreTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "PreTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailableTemplateAction" (
    "id" TEXT NOT NULL,
    "preTemplateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "AvailableTemplateAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateAction" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "sortingOrder" INTEGER NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "preTemplateId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Untitled template',

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TemplateAction_actionId_key" ON "TemplateAction"("actionId");

-- CreateIndex
CREATE UNIQUE INDEX "Template_preTemplateId_key" ON "Template"("preTemplateId");

-- AddForeignKey
ALTER TABLE "AvailableTemplateAction" ADD CONSTRAINT "AvailableTemplateAction_preTemplateId_fkey" FOREIGN KEY ("preTemplateId") REFERENCES "PreTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateAction" ADD CONSTRAINT "TemplateAction_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateAction" ADD CONSTRAINT "TemplateAction_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "AvailableTemplateAction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_preTemplateId_fkey" FOREIGN KEY ("preTemplateId") REFERENCES "PreTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
