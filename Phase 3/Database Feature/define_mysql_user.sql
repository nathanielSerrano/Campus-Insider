use campus_insider;
CREATE USER IF NOT EXISTS 'app_rw'@'%' IDENTIFIED BY 'somepassword';

GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE
ON campus_insider.*
TO 'app_rw'@'%';
