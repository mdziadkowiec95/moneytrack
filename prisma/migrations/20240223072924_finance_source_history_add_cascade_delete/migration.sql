-- DropForeignKey
ALTER TABLE "FinanceSourceHistory" DROP CONSTRAINT "FinanceSourceHistory_financeSourceId_fkey";

-- AddForeignKey
ALTER TABLE "FinanceSourceHistory" ADD CONSTRAINT "FinanceSourceHistory_financeSourceId_fkey" FOREIGN KEY ("financeSourceId") REFERENCES "FinanceSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
