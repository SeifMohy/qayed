/*
  Warnings:

  - Added the required column `bankId` to the `BankStatement` table without a default value. This is not possible if the table is not empty.

*/

-- CreateTable
CREATE TABLE "Bank" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bank_name_key" ON "Bank"("name");

-- Insert existing bank names into Bank table
INSERT INTO "Bank" ("name", "createdAt", "updatedAt")
SELECT DISTINCT "bankName", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "BankStatement"
WHERE "bankName" IS NOT NULL AND "bankName" != '';

-- Add bankId column with default value first
ALTER TABLE "BankStatement" ADD COLUMN "bankId" INTEGER;

-- Update bankId for existing records
UPDATE "BankStatement" 
SET "bankId" = "Bank"."id"
FROM "Bank"
WHERE "BankStatement"."bankName" = "Bank"."name";

-- Make bankId NOT NULL after populating it
ALTER TABLE "BankStatement" ALTER COLUMN "bankId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "BankStatement" ADD CONSTRAINT "BankStatement_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
