CREATE USER 'app_rw'@'%' IDENTIFIED BY '[your password here]';

GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE
ON campus_insider.*
TO 'app_rw'@'%';
