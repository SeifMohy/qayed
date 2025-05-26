-- AlterTable
ALTER TABLE "BankStatement" ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "locked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parsed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "validated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "validatedAt" TIMESTAMP(3),
ADD COLUMN     "validatedBy" TEXT,
ADD COLUMN     "validationNotes" TEXT,
ADD COLUMN     "validationStatus" TEXT NOT NULL DEFAULT 'pending';
