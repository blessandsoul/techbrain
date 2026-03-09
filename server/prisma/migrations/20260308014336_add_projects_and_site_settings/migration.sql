-- CreateTable
CREATE TABLE `projects` (
    `id` VARCHAR(191) NOT NULL,
    `titleKa` VARCHAR(500) NOT NULL,
    `titleRu` VARCHAR(500) NOT NULL DEFAULT '',
    `titleEn` VARCHAR(500) NOT NULL DEFAULT '',
    `locationKa` VARCHAR(500) NOT NULL,
    `locationRu` VARCHAR(500) NOT NULL DEFAULT '',
    `locationEn` VARCHAR(500) NOT NULL DEFAULT '',
    `type` VARCHAR(50) NOT NULL,
    `cameras` INTEGER NOT NULL DEFAULT 0,
    `image` VARCHAR(500) NULL,
    `year` VARCHAR(10) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `projects_isActive_sortOrder_idx`(`isActive`, `sortOrder`),
    INDEX `projects_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `site_settings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'singleton',
    `data` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
