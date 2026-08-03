-- AlterTable
ALTER TABLE `orders`
    ADD COLUMN `customerAddress` VARCHAR(300) NOT NULL DEFAULT '';
