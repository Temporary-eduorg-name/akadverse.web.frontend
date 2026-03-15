-- Add reusable Paystack recipient code for businesses
ALTER TABLE `business`
  ADD COLUMN `paystackRecipientCode` VARCHAR(191) NULL;

-- Add escrow tracking fields to orders
ALTER TABLE `order`
  ADD COLUMN `escrowReleaseAt` DATETIME(3) NULL,
  ADD COLUMN `escrowReleased` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `escrowReleasedAt` DATETIME(3) NULL,
  ADD COLUMN `escrowTransferReference` VARCHAR(191) NULL,
  ADD COLUMN `escrowTransferCode` VARCHAR(191) NULL,
  ADD COLUMN `escrowReleaseStatus` VARCHAR(191) NOT NULL DEFAULT 'pending',
  ADD COLUMN `escrowFailureReason` TEXT NULL;

CREATE INDEX `order_escrowReleased_escrowReleaseAt_idx` ON `order`(`escrowReleased`, `escrowReleaseAt`);
