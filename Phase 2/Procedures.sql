# Procedures, Make sure to run the functions first before the procedures.

DELIMITER $$
CREATE PROCEDURE CreateUniversity(
    IN p_name VARCHAR(100)
)
BEGIN
    DECLARE new_univ_id INT;

    -- Check if a university with the same name already exists
    IF EXISTS (SELECT 1 FROM university WHERE name = p_name) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: University with that name already exists.';
    END IF;

    -- Insert the new university
    INSERT INTO university (name)
    VALUES (p_name);

    -- Get the inserted id
    SET new_univ_id = LAST_INSERT_ID();

    -- Return the new id
    SELECT new_univ_id AS university_id;
END$$
DELIMITER ;

-- This Procedure doesn't account for universities with the same name if they exist in the database
DELIMITER $$
CREATE PROCEDURE RemoveUniversity(IN p_university_name VARCHAR(100))
BEGIN
    DECLARE v_university_id INT;

    -- Try to find the university by name (case-insensitive)
    SELECT university_id
    INTO v_university_id
    FROM university
    WHERE LOWER(name) = LOWER(p_university_name)
    LIMIT 1;

    -- If no record found
    IF v_university_id IS NULL THEN
        SELECT CONCAT('No university found with name "', p_university_name, '".') AS message;
    ELSE
        -- Delete the university record
        DELETE FROM university WHERE university_id = v_university_id;

        SELECT CONCAT('University "', p_university_name, '" has been removed successfully.') AS message;
    END IF;
END $$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE CreateUser(
    IN p_username VARCHAR(50),
    IN p_password VARCHAR(255),
    IN p_role VARCHAR(10),
    IN p_university_name VARCHAR(100)
)
BEGIN
    DECLARE new_uid INT;
    DECLARE univ_id INT;

    -- Step 1: Find the university_id by name
    SELECT university_id
    INTO univ_id
    FROM university
    WHERE name = p_university_name
    LIMIT 1;

    -- Step 2: Handle missing university
    IF univ_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Specified university does not exist.';
    END IF;

    -- Step 3: Check for duplicate username
    IF EXISTS (SELECT 1 FROM users WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Username already exists.';
    END IF;

    -- Step 4: Validate role
    IF p_role NOT IN ('Student', 'Faculty', 'Visitor') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Invalid role. Must be Student, Faculty, or Visitor.';
    END IF;

    -- Step 5: Insert the user record
    INSERT INTO users (username, password, university_id, role)
    VALUES (p_username, p_password, univ_id, p_role);

    -- Step 6: Retrieve the new UID
    SET new_uid = LAST_INSERT_ID();

    -- Step 7: Return the UID
    SELECT new_uid AS user_id;
END$$
DELIMITER ;


