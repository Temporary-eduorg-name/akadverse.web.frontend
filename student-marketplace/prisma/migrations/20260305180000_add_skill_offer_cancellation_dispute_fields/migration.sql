-- AlterTable
ALTER TABLE `SkillOffer`
    ADD COLUMN `cancelledAt` DATETIME(3) NULL,
    ADD COLUMN `cancelledBy` VARCHAR(191) NULL,
    ADD COLUMN `cancellationReason` TEXT NULL,
    ADD COLUMN `rejectedBy` VARCHAR(191) NULL,
    ADD COLUMN `disputedAt` DATETIME(3) NULL,
    ADD COLUMN `disputedBy` VARCHAR(191) NULL,
    ADD COLUMN `disputeReason` TEXT NULL;

-- AlterTable
ALTER TABLE `SkillCounterOffer`
    ADD COLUMN `madeBy` VARCHAR(191) NOT NULL DEFAULT 'buyer';
