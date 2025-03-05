-- CreateTable
CREATE TABLE "WebhookKey" (
    "id" TEXT NOT NULL,
    "secretKey" TEXT NOT NULL,
    "triggerId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebhookKey_secretKey_key" ON "WebhookKey"("secretKey");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookKey_triggerId_key" ON "WebhookKey"("triggerId");

-- AddForeignKey
ALTER TABLE "WebhookKey" ADD CONSTRAINT "WebhookKey_triggerId_fkey" FOREIGN KEY ("triggerId") REFERENCES "Trigger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
