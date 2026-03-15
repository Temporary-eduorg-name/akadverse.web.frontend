/*
  Warnings:

  - You are about to drop the column `negotiatedPrice` on the `skilloffer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `skilloffer` DROP COLUMN `negotiatedPrice`,
    ADD COLUMN `buyerAcceptedPrice` DOUBLE NULL,
    ADD COLUMN `completedAt` DATETIME(3) NULL,
    ADD COLUMN `currentPrice` DOUBLE NULL,
    ADD COLUMN `ignoredAt` DATETIME(3) NULL,
    ADD COLUMN `rejectedAt` DATETIME(3) NULL,
    ADD COLUMN `skillOwnerAcceptedPrice` DOUBLE NULL;

-- CreateIndex
CREATE INDEX `Business_industry_idx` ON `Business`(`industry`);

-- CreateIndex
CREATE INDEX `SkillOffer_createdAt_idx` ON `SkillOffer`(`createdAt`);
