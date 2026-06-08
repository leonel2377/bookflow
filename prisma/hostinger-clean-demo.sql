-- Nettoie les données démo avant réimport (erreur #1062 studio-eclat)
-- phpMyAdmin → SQL → Exécuter → puis réimporter hostinger-demo-seed.sql

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM `Appointment` WHERE `establishmentId` IN (
  SELECT `id` FROM (SELECT `id` FROM `Establishment` WHERE `slug` = 'studio-eclat' OR `id` = 'demo-establish-001') AS `e`
);
DELETE FROM `StaffSchedule` WHERE `staffId` IN (
  SELECT `id` FROM (SELECT `id` FROM `StaffMember` WHERE `establishmentId` IN (
    SELECT `id` FROM (SELECT `id` FROM `Establishment` WHERE `slug` = 'studio-eclat' OR `id` = 'demo-establish-001') AS `e2`
  )) AS `s`
);
DELETE FROM `Service` WHERE `establishmentId` IN (
  SELECT `id` FROM (SELECT `id` FROM `Establishment` WHERE `slug` = 'studio-eclat' OR `id` = 'demo-establish-001') AS `e`
);
DELETE FROM `OpeningHours` WHERE `establishmentId` IN (
  SELECT `id` FROM (SELECT `id` FROM `Establishment` WHERE `slug` = 'studio-eclat' OR `id` = 'demo-establish-001') AS `e`
);
DELETE FROM `StaffMember` WHERE `establishmentId` IN (
  SELECT `id` FROM (SELECT `id` FROM `Establishment` WHERE `slug` = 'studio-eclat' OR `id` = 'demo-establish-001') AS `e`
);
DELETE FROM `EstablishmentPhoto` WHERE `establishmentId` IN (
  SELECT `id` FROM (SELECT `id` FROM `Establishment` WHERE `slug` = 'studio-eclat' OR `id` = 'demo-establish-001') AS `e`
);
DELETE FROM `Establishment` WHERE `slug` = 'studio-eclat' OR `id` = 'demo-establish-001';
DELETE FROM `Client` WHERE `email` = 'client@demo.com' OR `id` = 'demo-client-001';
DELETE FROM `User` WHERE `email` IN ('pro@studio-eclat.demo', 'client@demo.com');

SET FOREIGN_KEY_CHECKS = 1;
