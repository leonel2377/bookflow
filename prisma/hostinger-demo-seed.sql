-- Comptes démo BOOKFLOW — import phpMyAdmin (base u835607784_bookflow)
-- Mot de passe des deux comptes : demo1234
-- Réimportable : supprime d'abord les données démo existantes

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM `Appointment` WHERE `id` = 'demo-appointment-1';
DELETE FROM `StaffSchedule` WHERE `id` LIKE 'schedule-demo-staff-%';
DELETE FROM `Service` WHERE `establishmentId` = 'demo-establish-001';
DELETE FROM `OpeningHours` WHERE `establishmentId` = 'demo-establish-001';
DELETE FROM `StaffMember` WHERE `establishmentId` = 'demo-establish-001';
DELETE FROM `EstablishmentPhoto` WHERE `establishmentId` = 'demo-establish-001';
DELETE FROM `Establishment` WHERE `id` = 'demo-establish-001';
DELETE FROM `Client` WHERE `id` = 'demo-client-001';
DELETE FROM `User` WHERE `email` IN ('pro@studio-eclat.demo', 'client@demo.com');

SET FOREIGN_KEY_CHECKS = 1;

-- Utilisateurs (bcrypt demo1234, rounds=12)
INSERT INTO `User` (`id`, `email`, `passwordHash`, `role`, `firstName`, `lastName`, `createdAt`, `updatedAt`) VALUES
('demo-pro-user-001', 'pro@studio-eclat.demo', '$2b$12$dEpPyAnK0gJKh01LYP3FvespsdTDJlnuiWP.fxBHDD8FTGkJOjo/m', 'PROVIDER', 'Marie', 'Bernard', NOW(3), NOW(3)),
('demo-client-user1', 'client@demo.com', '$2b$12$dEpPyAnK0gJKh01LYP3FvespsdTDJlnuiWP.fxBHDD8FTGkJOjo/m', 'CLIENT', 'Julie', 'Dupont', NOW(3), NOW(3));

INSERT INTO `Establishment` (`id`, `slug`, `name`, `description`, `address`, `city`, `latitude`, `longitude`, `phone`, `email`, `plan`, `addons`, `ownerId`, `createdAt`, `updatedAt`) VALUES
('demo-establish-001', 'studio-eclat', 'Studio Éclat', 'Salon de coiffure et soins bien-être au centre-ville.', '12 rue des Lilas', 'Lyon', 45.764, 4.8357, '04 00 00 00 00', 'contact@studio-eclat.demo', 'PREMIUM', '["BOUTIQUE_EN_LIGNE"]', 'demo-pro-user-001', NOW(3), NOW(3));

INSERT INTO `EstablishmentPhoto` (`id`, `url`, `sortOrder`, `establishmentId`) VALUES
('demo-photo-001', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80', 0, 'demo-establish-001');

INSERT INTO `OpeningHours` (`id`, `establishmentId`, `dayOfWeek`, `openTime`, `closeTime`, `closed`) VALUES
('demo-open-001', 'demo-establish-001', 1, '09:00', '19:00', 0),
('demo-open-002', 'demo-establish-001', 2, '09:00', '19:00', 0),
('demo-open-003', 'demo-establish-001', 3, '09:00', '19:00', 0),
('demo-open-004', 'demo-establish-001', 4, '09:00', '19:00', 0),
('demo-open-005', 'demo-establish-001', 5, '09:00', '19:00', 0),
('demo-open-006', 'demo-establish-001', 6, '09:00', '17:00', 0),
('demo-open-007', 'demo-establish-001', 0, '00:00', '00:00', 1);

INSERT INTO `StaffMember` (`id`, `firstName`, `lastName`, `role`, `color`, `active`, `establishmentId`) VALUES
('demo-staff-001', 'Léa', 'Martin', 'Coiffeuse', '#8b5a6b', 1, 'demo-establish-001'),
('demo-staff-002', 'Noémie', 'Dupont', 'Esthéticienne', '#2d4a3e', 1, 'demo-establish-001');

INSERT INTO `StaffSchedule` (`id`, `staffId`, `dayOfWeek`, `startTime`, `endTime`) VALUES
('schedule-demo-staff-001-1', 'demo-staff-001', 1, '09:00', '19:00'),
('schedule-demo-staff-001-2', 'demo-staff-001', 2, '09:00', '19:00'),
('schedule-demo-staff-001-3', 'demo-staff-001', 3, '09:00', '19:00'),
('schedule-demo-staff-001-4', 'demo-staff-001', 4, '09:00', '19:00'),
('schedule-demo-staff-001-5', 'demo-staff-001', 5, '09:00', '19:00'),
('schedule-demo-staff-001-6', 'demo-staff-001', 6, '09:00', '17:00'),
('schedule-demo-staff-002-1', 'demo-staff-002', 1, '09:00', '19:00'),
('schedule-demo-staff-002-2', 'demo-staff-002', 2, '09:00', '19:00'),
('schedule-demo-staff-002-3', 'demo-staff-002', 3, '09:00', '19:00'),
('schedule-demo-staff-002-4', 'demo-staff-002', 4, '09:00', '19:00'),
('schedule-demo-staff-002-5', 'demo-staff-002', 5, '09:00', '19:00'),
('schedule-demo-staff-002-6', 'demo-staff-002', 6, '09:00', '17:00');

INSERT INTO `Service` (`id`, `name`, `durationMinutes`, `priceCents`, `category`, `active`, `establishmentId`) VALUES
('demo-service-001', 'Coupe femme', 45, 4500, 'Coiffure', 1, 'demo-establish-001'),
('demo-service-002', 'Coloration', 120, 8500, 'Coiffure', 1, 'demo-establish-001'),
('demo-service-003', 'Soin visage', 60, 6500, 'Soins', 1, 'demo-establish-001');

INSERT INTO `Client` (`id`, `email`, `phone`, `firstName`, `lastName`, `smsReminders`, `userId`, `createdAt`, `updatedAt`) VALUES
('demo-client-001', 'client@demo.com', '06 00 00 00 00', 'Julie', 'Dupont', 1, 'demo-client-user1', NOW(3), NOW(3));

INSERT INTO `Appointment` (`id`, `startAt`, `endAt`, `status`, `clientId`, `establishmentId`, `serviceId`, `staffId`, `createdAt`, `updatedAt`) VALUES
('demo-appointment-1',
 DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL 630 MINUTE),
 DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL 675 MINUTE),
 'CONFIRMED', 'demo-client-001', 'demo-establish-001', 'demo-service-001', 'demo-staff-001', NOW(3), NOW(3));
