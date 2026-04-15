/*
  Warnings:

  - You are about to drop the column `yearEstablished` on the `business` table. All the data in the column will be lost.
  - You are about to drop the column `timeOfEstablishment` on the `skill` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `business` DROP COLUMN `yearEstablished`;

-- AlterTable
ALTER TABLE `skill` DROP COLUMN `timeOfEstablishment`;
