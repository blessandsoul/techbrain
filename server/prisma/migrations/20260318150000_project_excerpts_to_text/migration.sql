-- AlterTable: Change project excerpt columns from VARCHAR(1000) to TEXT
ALTER TABLE `projects` MODIFY COLUMN `excerptKa` TEXT NOT NULL;
ALTER TABLE `projects` MODIFY COLUMN `excerptRu` TEXT NOT NULL;
ALTER TABLE `projects` MODIFY COLUMN `excerptEn` TEXT NOT NULL;
