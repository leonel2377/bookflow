-- Migration : annonces pro avec photos (BOOKFLOW)
-- Exécuter dans phpMyAdmin si les tables n'existent pas encore.

CREATE TABLE IF NOT EXISTS `Announcement` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NULL,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `publishedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `establishmentId` VARCHAR(191) NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `Announcement_establishmentId_publishedAt_idx` (`establishmentId`, `publishedAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AnnouncementPhoto` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `caption` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `announcementId` VARCHAR(191) NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Announcement`
    ADD CONSTRAINT `Announcement_establishmentId_fkey`
    FOREIGN KEY (`establishmentId`) REFERENCES `Establishment`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `AnnouncementPhoto`
    ADD CONSTRAINT `AnnouncementPhoto_announcementId_fkey`
    FOREIGN KEY (`announcementId`) REFERENCES `Announcement`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
