ALTER TABLE fleet_management.repair_logs
ADD COLUMN garage_id INT NULL AFTER garage_name,
ADD CONSTRAINT fk_repair_garage
FOREIGN KEY (garage_id)
REFERENCES fleet_management.garages (id)
ON DELETE RESTRICT;
