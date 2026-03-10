-- AlterTable: Add new columns for rich content support
ALTER TABLE `projects` ADD COLUMN `slug` VARCHAR(300) NOT NULL DEFAULT '',
    ADD COLUMN `content` LONGTEXT NOT NULL,
    ADD COLUMN `excerptKa` VARCHAR(1000) NOT NULL DEFAULT '',
    ADD COLUMN `excerptRu` VARCHAR(1000) NOT NULL DEFAULT '',
    ADD COLUMN `excerptEn` VARCHAR(1000) NOT NULL DEFAULT '';

-- Backfill slugs for existing rows using their id
UPDATE `projects` SET `slug` = `id` WHERE `slug` = '';

-- Now add the unique constraint and index
CREATE UNIQUE INDEX `projects_slug_key` ON `projects`(`slug`);
CREATE INDEX `projects_slug_idx` ON `projects`(`slug`);
