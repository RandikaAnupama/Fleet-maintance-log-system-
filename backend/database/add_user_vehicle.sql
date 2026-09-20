ALTER TABLE fleet_management.users
ADD COLUMN assigned_vehicle_id INT NULL AFTER status,
ADD CONSTRAINT fk_user_assigned_vehicle
FOREIGN KEY (assigned_vehicle_id)
REFERENCES fleet_management.vehicles (id)
ON DELETE SET NULL;