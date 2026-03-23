-- AlterTable
ALTER TABLE `products` ADD COLUMN `inStock` BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX `products_inStock_idx` ON `products`(`inStock`);

-- CreateIndex
CREATE INDEX `products_isActive_inStock_idx` ON `products`(`isActive`, `inStock`);
