-- CreateEnum
CREATE TYPE "CashflowType" AS ENUM ('CUSTOMER_RECEIVABLE', 'SUPPLIER_PAYABLE');

-- CreateEnum
CREATE TYPE "CashflowStatus" AS ENUM ('PROJECTED', 'CONFIRMED', 'PARTIAL', 'COMPLETED', 'OVERDUE', 'CANCELLED');

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "expectedPaymentDates" JSONB;

-- CreateTable
CREATE TABLE "CashflowProjection" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectionDate" TIMESTAMP(3) NOT NULL,
    "projectedAmount" DECIMAL(65,30) NOT NULL,
    "actualAmount" DECIMAL(65,30),
    "type" "CashflowType" NOT NULL,
    "status" "CashflowStatus" NOT NULL DEFAULT 'PROJECTED',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "description" TEXT,
    "invoiceId" INTEGER,

    CONSTRAINT "CashflowProjection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CashflowProjection_projectionDate_idx" ON "CashflowProjection"("projectionDate");

-- CreateIndex
CREATE INDEX "CashflowProjection_type_status_idx" ON "CashflowProjection"("type", "status");

-- CreateIndex
CREATE INDEX "CashflowProjection_invoiceId_idx" ON "CashflowProjection"("invoiceId");

-- AddForeignKey
ALTER TABLE "CashflowProjection" ADD CONSTRAINT "CashflowProjection_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
