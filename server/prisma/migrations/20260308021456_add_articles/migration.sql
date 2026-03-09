-- CreateTable
CREATE TABLE `articles` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(300) NOT NULL,
    `title` VARCHAR(500) NOT NULL,
    `excerpt` TEXT NOT NULL,
    `content` LONGTEXT NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `coverImage` VARCHAR(500) NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `readMin` INTEGER NOT NULL DEFAULT 5,
    `authorId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `articles_slug_key`(`slug`),
    INDEX `articles_isPublished_createdAt_idx`(`isPublished`, `createdAt`),
    INDEX `articles_slug_idx`(`slug`),
    INDEX `articles_category_idx`(`category`),
    INDEX `articles_authorId_idx`(`authorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `articles` ADD CONSTRAINT `articles_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
