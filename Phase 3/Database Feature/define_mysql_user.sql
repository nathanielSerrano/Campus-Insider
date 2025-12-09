USE campus_insider;

CREATE USER IF NOT EXISTS 'app_rw'@'%' IDENTIFIED BY '${APP_RW_PASSWORD}';

GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE
ON campus_insider.*
TO 'app_rw'@'%';