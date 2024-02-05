/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `FinanceSourceHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "FinanceSourceHistory" ADD COLUMN     "transactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "FinanceSourceHistory_transactionId_key" ON "FinanceSourceHistory"("transactionId");

-- AddForeignKey
ALTER TABLE "FinanceSourceHistory" ADD CONSTRAINT "FinanceSourceHistory_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
