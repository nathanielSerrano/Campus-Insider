-- Procedures, Make sure to run the functions first before the procedures.

-- ===========================================
-- START OF ADMIN PROCEDURES
-- ===========================================

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


DELIMITER $$
CREATE PROCEDURE DeleteUniversity(
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
CREATE PROCEDURE DeleteCampus(
    IN p_campus_name VARCHAR(100),
    IN p_university_name VARCHAR(100),
    IN p_state VARCHAR(50)
)
BEGIN
    DECLARE v_university_id INT;

    -- Step 1: Get the university ID
    SET v_university_id = GetUniversityIDByNameAndState(p_university_name, p_state);

    -- Step 2: If the university does not exist, throw an error
    IF v_university_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: University with the given name and state does not exist.';
    END IF;

    -- Step 3: Check if the campus exists for this university
    IF NOT EXISTS (
        SELECT 1 FROM campus
        WHERE campus_name = p_campus_name
          AND university_id = v_university_id
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Campus not found for the specified university.';
    END IF;

    -- Step 4: Delete the campus
    DELETE FROM campus
    WHERE campus_name = p_campus_name
      AND university_id = v_university_id;

    -- Step 5: Confirm
    SELECT CONCAT(
        'Campus "', p_campus_name,
        '" at university "', p_university_name,
        '" (', p_state, ') has been deleted.'
    ) AS message;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE CreateNonBuildingLocation(
    IN p_name VARCHAR(100),
    IN p_campus_name VARCHAR(100),
    IN p_university_name VARCHAR(100),
    IN p_state VARCHAR(50),
    IN p_image LONGBLOB,      -- pass NULL if no image
    IN p_description TEXT     -- pass NULL if no description
)
BEGIN
    DECLARE v_univ_id INT;
    DECLARE v_LID INT;

    -- 1) Get university id
    SET v_univ_id = GetUniversityIDByNameAndState(p_university_name, p_state);

    IF v_univ_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: University not found for the given name and state.';
    END IF;

    -- 2) Ensure campus exists for this university
    IF NOT EXISTS (
        SELECT 1 FROM campus
        WHERE campus_name = p_campus_name
          AND university_id = v_univ_id
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Campus not found for the specified university.';
    END IF;

    -- 3) Prevent duplicate location (same name + campus + university)
    IF EXISTS (
        SELECT 1 FROM location
        WHERE name = p_name
          AND campus_name = p_campus_name
          AND university_id = v_univ_id
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: A location with that name already exists on the specified campus.';
    END IF;

    -- 4) Insert into location
    INSERT INTO location (name, image, campus_name, university_id)
    VALUES (p_name, p_image, p_campus_name, v_univ_id);

    SET v_LID = LAST_INSERT_ID();

    -- 5) Insert into nonbuildings
    INSERT INTO nonbuildings (LID, description)
    VALUES (v_LID, p_description);

    -- 6) Return the new LID
    SELECT v_LID AS LID;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE CreateBuildingLocation(
    IN p_name VARCHAR(100),
    IN p_campus_name VARCHAR(100),
    IN p_university_name VARCHAR(100),
    IN p_state VARCHAR(50),
    IN p_image LONGBLOB      -- pass NULL if no image
)
BEGIN
    DECLARE v_univ_id INT;
    DECLARE v_LID INT;

    -- 1) Get university id
    SET v_univ_id = GetUniversityIDByNameAndState(p_university_name, p_state);

    IF v_univ_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: University not found for the given name and state.';
    END IF;

    -- 2) Ensure campus exists for this university
    IF NOT EXISTS (
        SELECT 1 FROM campus
        WHERE campus_name = p_campus_name
          AND university_id = v_univ_id
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Campus not found for the specified university.';
    END IF;

    -- 3) Prevent duplicate location (same name + campus + university)
    IF EXISTS (
        SELECT 1 FROM location
        WHERE name = p_name
          AND campus_name = p_campus_name
          AND university_id = v_univ_id
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: A location with that name already exists on the specified campus.';
    END IF;

    -- 4) Insert into location
    INSERT INTO location (name, image, campus_name, university_id)
    VALUES (p_name, p_image, p_campus_name, v_univ_id);

    SET v_LID = LAST_INSERT_ID();

    -- 5) Insert into buildings
    INSERT INTO buildings (LID)
    VALUES (v_LID);

    -- 6) Return the new LID
    SELECT v_LID AS LID;
END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE CreateRoom(
    IN p_room_name VARCHAR(100),
    IN p_building_name VARCHAR(100),
    IN p_campus_name VARCHAR(100),
    IN p_university_name VARCHAR(100),
    IN p_state VARCHAR(50),
    IN p_room_number VARCHAR(10),
    IN p_room_type ENUM('study room', 'computer room', 'science lab', 'classroom', 'facility', 'meeting room', 'store', 'venue'),
    IN p_room_size ENUM('small', 'medium', 'large'),
    IN p_image LONGBLOB     -- pass NULL if no image
)
BEGIN
    DECLARE v_univ_id INT;
    DECLARE v_building_LID INT;
    DECLARE v_LID INT;

    -- 1) Get university id
    SET v_univ_id = GetUniversityIDByNameAndState(p_university_name, p_state);

    IF v_univ_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: University not found for the given name and state.';
    END IF;

    -- 2) Ensure campus exists
    IF NOT EXISTS (
        SELECT 1
        FROM campus
        WHERE campus_name = p_campus_name
          AND university_id = v_univ_id
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Campus not found for the specified university.';
    END IF;

    -- 3) Find the building LID
    SELECT LID INTO v_building_LID
    FROM location
    WHERE name = p_building_name
      AND campus_name = p_campus_name
      AND university_id = v_univ_id
      AND LID IN (SELECT LID FROM buildings)   -- must be an actual building
    LIMIT 1;

    IF v_building_LID IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Specified building does not exist.';
    END IF;

    -- 4) Duplicate room check (same name OR same number within the same building)
    IF EXISTS (
        SELECT 1 FROM rooms
        WHERE building_LID = v_building_LID
          AND (
               LID IN (SELECT LID FROM location WHERE name = p_room_name)
               OR (p_room_number IS NOT NULL AND room_number = p_room_number)
          )
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: A room with that name or number already exists in this building.';
    END IF;

    -- 5) Insert into location
    INSERT INTO location (name, image, campus_name, university_id)
    VALUES (p_room_name, p_image, p_campus_name, v_univ_id);

    SET v_LID = LAST_INSERT_ID();

    -- 6) Insert into rooms
    INSERT INTO rooms (LID, building_LID, room_number, room_type, room_size)
    VALUES (v_LID, v_building_LID, p_room_number, p_room_type, p_room_size);

    -- 7) Return LID
    SELECT v_LID AS LID;
END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE DeleteLocation(
    IN p_location_name VARCHAR(100),
    IN p_campus_name VARCHAR(100),
    IN p_university_name VARCHAR(100),
    IN p_state VARCHAR(50)
)
BEGIN
    DECLARE v_univ_id INT;
    DECLARE v_LID INT;

    -- 1) Get the university ID
    SET v_univ_id = GetUniversityIDByNameAndState(p_university_name, p_state);

    IF v_univ_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: University not found for the specified name and state.';
    END IF;

    -- 2) Lookup the location LID (must match name + campus + university)
    SELECT LID INTO v_LID
    FROM location
    WHERE name = p_location_name
      AND campus_name = p_campus_name
      AND university_id = v_univ_id
    LIMIT 1;

    IF v_LID IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Location not found for the specified campus and university.';
    END IF;

    -- 3) Delete the location (CASCADE removes building/nonbuilding/rooms automatically)
    DELETE FROM location WHERE LID = v_LID;

    -- 4) Return success
    SELECT CONCAT('Location "', p_location_name, '" was successfully deleted.') AS message;

END$$
DELIMITER ;

-- ===========================================
-- END OF ADMIN PROCEDURES
-- ===========================================

-- ===========================================
-- START OF USER PROCEDURES
-- ===========================================

DELIMITER $$
CREATE PROCEDURE CreateUser(
    IN p_username VARCHAR(50),
    IN p_password VARCHAR(255),
    IN p_role VARCHAR(10),
    IN p_university_name VARCHAR(100),
    IN p_state VARCHAR(50)
)
BEGIN
    DECLARE univ_id INT;
    DECLARE new_uid INT;

    -- Step 1: Get university ID using your function
    SET univ_id = GetUniversityIDByNameAndState(p_university_name, p_state);

    -- Step 2: Handle missing university
    IF univ_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: The specified university and state do not exist.';
    END IF;

    -- Step 3: Check for duplicate username
    IF EXISTS (SELECT 1 FROM users WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Username already exists.';
    END IF;

    -- Step 4: Validate role input
    IF p_role NOT IN ('Student', 'Faculty', 'Visitor') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Invalid role. Must be Student, Faculty, or Visitor.';
    END IF;

    -- Step 5: Insert user
    INSERT INTO users (username, password, university_id, role)
    VALUES (p_username, p_password, univ_id, p_role);

    -- Step 6: Return new user_id
    SET new_uid = LAST_INSERT_ID();
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


