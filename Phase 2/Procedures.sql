# Procedures, Make sure to run the functions first before the procedures.

DELIMITER $$
CREATE PROCEDURE CreateUniversity(
    IN p_name VARCHAR(100),
    IN p_state VARCHAR(50),
    IN p_wiki_url VARCHAR(255)
)
BEGIN
    DECLARE new_univ_id INT;

    -- Check if a university with the same name and state already exists
    SELECT university_id INTO new_univ_id
    FROM university
    WHERE name = p_name AND state = p_state
    LIMIT 1;

    -- If found, signal an error
    IF new_univ_id IS NOT NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: University with that name and state already exists.';
    ELSE
        -- Insert the new university (wiki_url can be NULL)
        INSERT INTO university (name, state, wiki_url)
        VALUES (p_name, p_state, p_wiki_url);

        -- Get the newly inserted university_id
        SET new_univ_id = LAST_INSERT_ID();
    END IF;

    -- Return the new id
    SELECT new_univ_id AS university_id;
END$$
DELIMITER ;

-- This Procedure doesn't account for universities with the same name if they exist in the database
DELIMITER $$
CREATE PROCEDURE RemoveUniversity(
    IN p_name VARCHAR(100),
    IN p_state VARCHAR(50)
)
BEGIN
    DECLARE univ_id INT;

    -- Get the university ID using the existing function
    SET univ_id = GetUniversityIDByNameAndState(p_name, p_state);

    -- If the university doesn't exist, raise an error
    IF univ_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: University not found for the given name and state.';
    ELSE
        -- Delete the university (cascade will handle related records)
        DELETE FROM university WHERE university_id = univ_id;

        -- Confirm deletion
        SELECT CONCAT('University "', p_name, '" in ', p_state, ' has been removed.') AS message;
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE AddCampus(
    IN p_campus_name VARCHAR(100),
    IN p_university_name VARCHAR(100),
    IN p_state VARCHAR(50)
)
BEGIN
    DECLARE v_university_id INT;

    -- Step 1: Lookup university_id using the existing function
    SET v_university_id = GetUniversityIDByNameAndState(p_university_name, p_state);

    -- Step 2: Check if university exists
    IF v_university_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Specified university does not exist for the given name and state.';
    END IF;

    -- Step 3: Check if campus already exists for this university
    IF EXISTS (
        SELECT 1 FROM campus 
        WHERE campus_name = p_campus_name 
          AND university_id = v_university_id
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Campus already exists for this university.';
    END IF;

    -- Step 4: Insert the new campus
    INSERT INTO campus (campus_name, university_id)
    VALUES (p_campus_name, v_university_id);

    -- Step 5: Return success message
    SELECT CONCAT('Campus "', p_campus_name, '" added to university "', p_university_name, '" (', p_state, ').') AS message;
END$$
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


-- ===========================================
-- Procedure: SearchRoomsByType
-- ===========================================
DELIMITER $$
CREATE PROCEDURE SearchRoomsByType(IN p_room_type ENUM('study room', 'computer room', 'science lab', 'classroom', 'facility', 'meeting room', 'store', 'venue'))
BEGIN
    IF p_room_type NOT IN ('study room', 'computer room', 'science lab', 'classroom', 'facility', 'meeting room', 'store', 'venue') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Invalid room type.';
    END IF;

    SELECT 
        r.LID AS room_id,
        r.room_number,
        r.room_type,
        r.room_size,
        rl.name AS room_name,
        bl.LID AS building_id,
        bl.name AS building_name,
        rl.campus_name,
        rl.university_id
    FROM rooms r
    JOIN location rl ON r.LID = rl.LID
    JOIN location bl ON r.building_LID = bl.LID
    WHERE r.room_type = p_room_type;
END$$
DELIMITER ;

-- ===========================================
-- Procedure: SearchRoomsBySize
-- ===========================================
DELIMITER $$
CREATE PROCEDURE SearchRoomsBySize(IN p_room_size ENUM('small', 'medium', 'large'))
BEGIN
    IF p_room_size NOT IN ('small', 'medium', 'large') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Invalid room size.';
    END IF;

    SELECT 
        r.LID AS room_id,
        r.room_number,
        r.room_type,
        r.room_size,
        rl.name AS room_name,
        bl.LID AS building_id,
        bl.name AS building_name,
        rl.campus_name,
        rl.university_id
    FROM rooms r
    JOIN location rl ON r.LID = rl.LID
    JOIN location bl ON r.building_LID = bl.LID
    WHERE r.room_size = p_room_size;
END$$
DELIMITER ;

-- ===========================================
-- Procedure: SearchRoomsByNumber
-- ===========================================
DELIMITER $$
CREATE PROCEDURE SearchRoomsByNumber(IN p_room_number VARCHAR(10))
BEGIN
    IF p_room_number IS NULL OR p_room_number = '' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Room number cannot be empty.';
    END IF;

    SELECT 
        r.LID AS room_id,
        r.room_number,
        r.room_type,
        r.room_size,
        rl.name AS room_name,
        bl.LID AS building_id,
        bl.name AS building_name,
        rl.campus_name,
        rl.university_id
    FROM rooms r
    JOIN location rl ON r.LID = rl.LID
    JOIN location bl ON r.building_LID = bl.LID
    WHERE LOWER(r.room_number) = LOWER(p_room_number);
END$$
DELIMITER ;


