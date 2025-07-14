-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CashflowType" ADD VALUE 'BANK_OBLIGATION';
ALTER TYPE "CashflowType" ADD VALUE 'LOAN_PAYMENT';

-- AlterTable
ALTER TABLE "CashflowProjection" ADD COLUMN     "bankStatementId" INTEGER;

-- CreateIndex
CREATE INDEX "CashflowProjection_bankStatementId_idx" ON "CashflowProjection"("bankStatementId");

-- AddForeignKey
ALTER TABLE "CashflowProjection" ADD CONSTRAINT "CashflowProjection_bankStatementId_fkey" FOREIGN KEY ("bankStatementId") REFERENCES "BankStatement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
