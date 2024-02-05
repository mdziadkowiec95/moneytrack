/*
  Warnings:

  - Added the required column `financeSourceId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FinanceSourceType" AS ENUM ('CASH', 'BANK_ACCOUNT', 'INVESTMENT');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "financeSourceId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "FinanceSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "FinanceSourceType" NOT NULL DEFAULT 'CASH',
    "currency" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceSource_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_financeSourceId_fkey" FOREIGN KEY ("financeSourceId") REFERENCES "FinanceSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceSource" ADD CONSTRAINT "FinanceSource_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
