/*
  Warnings:

  - Added the required column `categoryId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "categoryId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL UNIQUE,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- InsertRecords
INSERT INTO "Category" ("id", "name", "displayName", "description", "createdAt", "updatedAt")
VALUES (DEFAULT, 'other', 'Other', null, DEFAULT, CURRENT_TIMESTAMP),
     (DEFAULT, 'car', 'Car', null, DEFAULT, CURRENT_TIMESTAMP),
     (DEFAULT, 'electronics', 'Electronics', null, DEFAULT, CURRENT_TIMESTAMP),
     (DEFAULT, 'financialOutlays', 'Financial Outlays', null, DEFAULT, CURRENT_TIMESTAMP),
     (DEFAULT, 'health', 'Health', null, DEFAULT, CURRENT_TIMESTAMP),
     (DEFAULT, 'income', 'Income', null, DEFAULT, CURRENT_TIMESTAMP),
     (DEFAULT, 'investments', 'Investments', null, DEFAULT, CURRENT_TIMESTAMP),
     (DEFAULT, 'rest', 'Rest', null, DEFAULT, CURRENT_TIMESTAMP),
     (DEFAULT, 'shopping', 'Shopping', null, DEFAULT, CURRENT_TIMESTAMP),
     (DEFAULT, 'home', 'Home', null, DEFAULT, CURRENT_TIMESTAMP),
     (DEFAULT, 'transport', 'Transport', null, DEFAULT, CURRENT_TIMESTAMP);


-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
