-- AlterTable
ALTER TABLE "BankStatement" ADD COLUMN     "availableLimit" DECIMAL(65,30),
ADD COLUMN     "interestRate" TEXT,
ADD COLUMN     "tenor" TEXT;
