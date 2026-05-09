-- CreateTable
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL,
    "templateId" VARCHAR(80) NOT NULL,
    "category" VARCHAR(40) NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "evidence" JSONB NOT NULL DEFAULT '[]',
    "effort" VARCHAR(1) NOT NULL,
    "impact" VARCHAR(1) NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "funnelStage" VARCHAR(20),
    "status" VARCHAR(20) NOT NULL DEFAULT 'sent',
    "telegramMsgId" INTEGER,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actedAt" TIMESTAMP(3),

    CONSTRAINT "Insight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Insight_templateId_sentAt_idx" ON "Insight"("templateId", "sentAt");

-- CreateIndex
CREATE INDEX "Insight_category_sentAt_idx" ON "Insight"("category", "sentAt");

-- CreateIndex
CREATE INDEX "Insight_status_idx" ON "Insight"("status");
