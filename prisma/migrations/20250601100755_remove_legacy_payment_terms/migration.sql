/*
  Warnings:

  - You are about to drop the column `paymentTerms` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `paymentTerms` on the `Supplier` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "paymentTerms";

-- AlterTable
ALTER TABLE "Supplier" DROP COLUMN "paymentTerms";
