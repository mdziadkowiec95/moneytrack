/*
  Warnings:

  - Added the required column `financeSourceId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "financeSourceId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_financeSourceId_fkey" FOREIGN KEY ("financeSourceId") REFERENCES "FinanceSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
