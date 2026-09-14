ALTER TABLE fleet_management.issues
ADD COLUMN reported_by_user_id INT NULL AFTER reported_by,
ADD CONSTRAINT fk_issue_reporter
FOREIGN KEY (reported_by_user_id)
REFERENCES fleet_management.users (id)
ON DELETE SET NULL;