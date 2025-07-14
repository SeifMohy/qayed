/*
  Warnings:

  - You are about to drop the column `customerId` on the `BankStatement` table. All the data in the column will be lost.
  - You are about to drop the column `supplierId` on the `BankStatement` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DISPUTED', 'REQUIRES_REVIEW');

-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('AUTOMATIC', 'SUGGESTED', 'POTENTIAL', 'MANUAL');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'PENDING_REVIEW', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransactionCategory" AS ENUM ('CUSTOMER_PAYMENT', 'SUPPLIER_PAYMENT', 'INTERNAL_TRANSFER', 'BANK_CHARGES', 'BANK_PAYMENTS', 'UNKNOWN', 'OTHER');

-- DropForeignKey
ALTER TABLE "BankStatement" DROP CONSTRAINT "BankStatement_customerId_fkey";

-- DropForeignKey
ALTER TABLE "BankStatement" DROP CONSTRAINT "BankStatement_supplierId_fkey";

-- AlterTable
ALTER TABLE "BankStatement" DROP COLUMN "customerId",
DROP COLUMN "supplierId";

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "paymentTermsData" JSONB;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "exactMatchingRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "matchingKeywords" TEXT[];

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "paymentTermsData" JSONB;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "alternativeCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "category" "TransactionCategory",
ADD COLUMN     "classificationId" INTEGER,
ADD COLUMN     "classificationMethod" TEXT,
ADD COLUMN     "classificationNotes" TEXT,
ADD COLUMN     "classificationReason" TEXT,
ADD COLUMN     "classifiedAt" TIMESTAMP(3),
ADD COLUMN     "confidence" DOUBLE PRECISION,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "extractedEntities" TEXT[],
ADD COLUMN     "extractedReferences" TEXT[],
ADD COLUMN     "isEligible" BOOLEAN,
ADD COLUMN     "llmModel" TEXT,
ADD COLUMN     "llmPromptVersion" TEXT,
ADD COLUMN     "manualClassification" "TransactionCategory",
ADD COLUMN     "manualNotes" TEXT,
ADD COLUMN     "manuallyClassifiedAt" TIMESTAMP(3),
ADD COLUMN     "manuallyClassifiedBy" TEXT,
ADD COLUMN     "manuallyOverridden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "processingTime" INTEGER,
ADD COLUMN     "requiresManualReview" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "TransactionMatch" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "transactionId" INTEGER NOT NULL,
    "invoiceId" INTEGER,
    "matchType" "MatchType" NOT NULL,
    "matchScore" DOUBLE PRECISION NOT NULL,
    "matchReason" TEXT[],
    "passedStrictCriteria" BOOLEAN NOT NULL,
    "strictCriteriaDetails" JSONB,
    "status" "MatchStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "verificationNotes" TEXT,
    "isEligible" BOOLEAN NOT NULL,
    "transactionCategory" "TransactionCategory" NOT NULL,
    "classificationReason" TEXT,
    "classificationConfidence" DOUBLE PRECISION,

    CONSTRAINT "TransactionMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TransactionMatch_transactionId_invoiceId_key" ON "TransactionMatch"("transactionId", "invoiceId");

-- AddForeignKey
ALTER TABLE "TransactionMatch" ADD CONSTRAINT "TransactionMatch_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionMatch" ADD CONSTRAINT "TransactionMatch_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
