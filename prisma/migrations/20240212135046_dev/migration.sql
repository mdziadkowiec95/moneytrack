-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_financeSourceId_fkey";

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_financeSourceId_fkey" FOREIGN KEY ("financeSourceId") REFERENCES "FinanceSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
