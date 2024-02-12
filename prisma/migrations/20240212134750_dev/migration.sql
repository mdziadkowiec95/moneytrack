-- DropForeignKey
ALTER TABLE "FinanceSourceHistory" DROP CONSTRAINT "FinanceSourceHistory_transactionId_fkey";

-- AddForeignKey
ALTER TABLE "FinanceSourceHistory" ADD CONSTRAINT "FinanceSourceHistory_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
