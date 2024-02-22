/*
  Warnings:

  - Changed the type of `currency` on the `FinanceSource` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'PLN', 'GBP', 'EUR');

-- AlterTable
ALTER TABLE "FinanceSource" DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL;
