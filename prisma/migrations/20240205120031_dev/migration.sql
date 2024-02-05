/*
  Warnings:

  - Added the required column `userId` to the `FinanceSourceHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FinanceSourceHistory" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "FinanceSourceHistory" ADD CONSTRAINT "FinanceSourceHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
