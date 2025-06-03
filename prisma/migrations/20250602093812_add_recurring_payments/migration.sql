-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMIANNUALLY', 'ANNUALLY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CashflowType" ADD VALUE 'RECURRING_INFLOW';
ALTER TYPE "CashflowType" ADD VALUE 'RECURRING_OUTFLOW';

-- AlterTable
ALTER TABLE "CashflowProjection" ADD COLUMN     "recurringPaymentId" INTEGER;

-- DropEnum
DROP TYPE "SessionStatus";

-- CreateTable
CREATE TABLE "RecurringPayment" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "type" "CashflowType" NOT NULL,
    "frequency" "RecurrenceFrequency" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "nextDueDate" TIMESTAMP(3) NOT NULL,
    "dayOfMonth" INTEGER,
    "dayOfWeek" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "category" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "RecurringPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecurringPayment_isActive_nextDueDate_idx" ON "RecurringPayment"("isActive", "nextDueDate");

-- CreateIndex
CREATE INDEX "RecurringPayment_type_isActive_idx" ON "RecurringPayment"("type", "isActive");

-- CreateIndex
CREATE INDEX "CashflowProjection_recurringPaymentId_idx" ON "CashflowProjection"("recurringPaymentId");

-- AddForeignKey
ALTER TABLE "CashflowProjection" ADD CONSTRAINT "CashflowProjection_recurringPaymentId_fkey" FOREIGN KEY ("recurringPaymentId") REFERENCES "RecurringPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
