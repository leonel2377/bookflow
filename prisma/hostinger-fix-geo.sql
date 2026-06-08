-- À exécuter dans phpMyAdmin si l'import demo échoue avec :
-- #1054 - Champ 'latitude' inconnu dans INSERT INTO
--
-- Puis réimporter : prisma/hostinger-demo-seed.sql

ALTER TABLE `Establishment`
  ADD COLUMN `latitude` DOUBLE NULL,
  ADD COLUMN `longitude` DOUBLE NULL;
