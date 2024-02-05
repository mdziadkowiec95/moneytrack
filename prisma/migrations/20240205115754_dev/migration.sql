-- CreateTable
CREATE TABLE "FinanceSourceHistory" (
    "id" TEXT NOT NULL,
    "financeSourceId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceSourceHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FinanceSourceHistory" ADD CONSTRAINT "FinanceSourceHistory_financeSourceId_fkey" FOREIGN KEY ("financeSourceId") REFERENCES "FinanceSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
