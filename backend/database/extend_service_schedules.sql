ALTER TABLE fleet_management.service_schedules
ADD COLUMN garage_id INT NULL AFTER vehicle_id,
ADD COLUMN maintenance_id INT NULL AFTER estimated_cost,
MODIFY COLUMN status
    ENUM('UPCOMING', 'OVERDUE', 'COMPLETED', 'CANCELLED')
    NOT NULL DEFAULT 'UPCOMING',
ADD UNIQUE KEY uq_schedule_maintenance (maintenance_id),
ADD CONSTRAINT fk_schedule_garage
    FOREIGN KEY (garage_id)
    REFERENCES fleet_management.garages (id)
    ON DELETE RESTRICT,
ADD CONSTRAINT fk_schedule_maintenance
    FOREIGN KEY (maintenance_id)
    REFERENCES fleet_management.maintenance_logs (id)
    ON DELETE RESTRICT;