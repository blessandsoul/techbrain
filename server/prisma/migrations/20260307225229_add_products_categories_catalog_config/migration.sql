-- CreateTable
CREATE TABLE `categories` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `nameKa` VARCHAR(200) NOT NULL,
    `nameRu` VARCHAR(200) NOT NULL DEFAULT '',
    `nameEn` VARCHAR(200) NOT NULL DEFAULT '',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `categories_slug_key`(`slug`),
    INDEX `categories_isActive_idx`(`isActive`),
    INDEX `categories_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL DEFAULT 0,
    `originalPrice` DOUBLE NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'GEL',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `images` JSON NOT NULL,
    `nameKa` VARCHAR(500) NOT NULL,
    `nameRu` VARCHAR(500) NOT NULL DEFAULT '',
    `nameEn` VARCHAR(500) NOT NULL DEFAULT '',
    `descriptionKa` TEXT NULL,
    `descriptionRu` TEXT NULL,
    `descriptionEn` TEXT NULL,
    `content` LONGTEXT NULL,
    `relatedProducts` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `products_slug_key`(`slug`),
    INDEX `products_isActive_idx`(`isActive`),
    INDEX `products_isFeatured_idx`(`isFeatured`),
    INDEX `products_isActive_isFeatured_idx`(`isActive`, `isFeatured`),
    INDEX `products_price_idx`(`price`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_categories` (
    `productId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,

    INDEX `product_categories_categoryId_idx`(`categoryId`),
    INDEX `product_categories_productId_idx`(`productId`),
    PRIMARY KEY (`productId`, `categoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_specs` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `keyKa` VARCHAR(200) NOT NULL,
    `keyRu` VARCHAR(200) NOT NULL DEFAULT '',
    `keyEn` VARCHAR(200) NOT NULL DEFAULT '',
    `value` VARCHAR(500) NOT NULL,

    INDEX `product_specs_productId_idx`(`productId`),
    INDEX `product_specs_keyKa_value_idx`(`keyKa`, `value`),
    INDEX `product_specs_productId_keyKa_idx`(`productId`, `keyKa`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `catalog_config` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'singleton',
    `categories` JSON NOT NULL,
    `filters` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `product_categories` ADD CONSTRAINT `product_categories_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_categories` ADD CONSTRAINT `product_categories_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_specs` ADD CONSTRAINT `product_specs_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
