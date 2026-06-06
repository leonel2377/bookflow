-- Migration : géolocalisation des salons (à exécuter si la table existe déjà)
ALTER TABLE `Establishment`
  ADD COLUMN `latitude` DOUBLE NULL,
  ADD COLUMN `longitude` DOUBLE NULL;
