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

DELIMITER $$
CREATE PROCEDURE DeleteUser(
    IN p_username VARCHAR(50),
    IN p_password VARCHAR(255)
)
BEGIN
    DECLARE v_uid INT;

    -- Step 1: Validate that the username/password pair exists
    SELECT uid
    INTO v_uid
    FROM users
    WHERE username = p_username
      AND password = p_password
    LIMIT 1;

    -- Step 2: If no match, error out
    IF v_uid IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Invalid username or password.';
    END IF;

    -- Step 3: Delete the user
    DELETE FROM users
    WHERE uid = v_uid;

    -- Step 4: Return the deleted uid
    SELECT v_uid AS deleted_user_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE AddRating(
    IN p_username VARCHAR(50),
    IN p_university_name VARCHAR(100),
    IN p_state VARCHAR(50),
    IN p_campus_name VARCHAR(100),
    IN p_location_name VARCHAR(100),
    IN p_score INT,
    IN p_noise INT,
    IN p_cleanliness INT,
    IN p_equipment_quality INT,
    IN p_wifi_strength INT,
    IN p_extra_comments VARCHAR(2000)
)
BEGIN
    DECLARE v_uid INT;
    DECLARE v_univ_id INT;
    DECLARE v_LID INT;

    -- Step 1: Get university ID
    SET v_univ_id = GetUniversityIDByNameAndState(p_university_name, p_state);
    IF v_univ_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: University not found.';
    END IF;

    -- Step 2: Get user ID
    SELECT uid INTO v_uid
    FROM users
    WHERE username = p_username
      AND university_id = v_univ_id
    LIMIT 1;

    IF v_uid IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: User not found for this university.';
    END IF;

    -- Step 3: Get location ID
    SELECT LID INTO v_LID
    FROM location
    WHERE name = p_location_name
      AND campus_name = p_campus_name
      AND university_id = v_univ_id
    LIMIT 1;

    IF v_LID IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Location not found.';
    END IF;

    -- Step 4: Validate score values
    IF p_score < 1 OR p_score > 10 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Score must be between 1 and 10.';
    END IF;

    IF p_noise < 1 OR p_noise > 5 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Noise must be between 1 and 5.';
    END IF;

    IF p_cleanliness < 1 OR p_cleanliness > 5 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Cleanliness must be between 1 and 5.';
    END IF;

    IF p_equipment_quality < 1 OR p_equipment_quality > 3 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Equipment quality must be between 1 and 3.';
    END IF;

    IF p_wifi_strength < 1 OR p_wifi_strength > 3 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: WiFi strength must be between 1 and 3.';
    END IF;

    -- Step 5: Insert the rating
    INSERT INTO ratings (
        score, noise, cleanliness, equipment_quality, wifi_strength,
        extra_comments, UID, LID
    )
    VALUES (
        p_score, p_noise, p_cleanliness, p_equipment_quality, p_wifi_strength,
        p_extra_comments, v_uid, v_LID
    );

    -- Step 6: Return the new rating ID
    SELECT LAST_INSERT_ID() AS rating_id;

END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE DeleteRating(
    IN p_username VARCHAR(50),
    IN p_university_name VARCHAR(100),
    IN p_state VARCHAR(50),
    IN p_location_name VARCHAR(100),
    IN p_campus_name VARCHAR(100)
)
BEGIN
    DECLARE v_uid INT;
    DECLARE v_univ_id INT;
    DECLARE v_LID INT;

    -- Step 1: Get university ID
    SET v_univ_id = GetUniversityIDByNameAndState(p_university_name, p_state);
    IF v_univ_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: University not found.';
    END IF;

    -- Step 2: Get user ID
    SELECT uid INTO v_uid
    FROM users
    WHERE username = p_username
      AND university_id = v_univ_id
    LIMIT 1;

    IF v_uid IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: User not found for this university.';
    END IF;

    -- Step 3: Get location ID
    SELECT LID INTO v_LID
    FROM location
    WHERE name = p_location_name
      AND campus_name = p_campus_name
      AND university_id = v_univ_id
    LIMIT 1;

    IF v_LID IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Location not found.';
    END IF;

    -- Step 4: Check if rating exists
    IF NOT EXISTS (
        SELECT 1 FROM ratings
        WHERE UID = v_uid
          AND LID = v_LID
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Rating does not exist.';
    END IF;

    -- Step 5: Delete the rating
    DELETE FROM ratings
    WHERE UID = v_uid
      AND LID = v_LID;

    -- Step 6: Return success message
    SELECT CONCAT('Rating by user "', p_username, '" for location "', p_location_name, '" has been deleted.') AS message;

END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE ShowUniversity(
    IN p_university_name VARCHAR(100),
    IN p_state VARCHAR(50)
)
BEGIN
    DECLARE v_univ_id INT;

    -- Step 1: Get university ID
    SET v_univ_id = GetUniversityIDByNameAndState(p_university_name, p_state);

    IF v_univ_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: University not found.';
    END IF;

    -- Step 2: Show university info
    SELECT university_id, name, state, wiki_url
    FROM university
    WHERE university_id = v_univ_id;

    -- Step 3: Show campuses
    SELECT campus_name
    FROM campus
    WHERE university_id = v_univ_id;

    -- Step 4: Show all locations and rooms with ratings
    SELECT 
        L.name AS location_name,
        CASE 
            WHEN B.LID IS NOT NULL THEN 'Building'
            WHEN NB.LID IS NOT NULL THEN 'Non-building'
            ELSE 'Unknown'
        END AS location_type,
        NULL AS room_number,
        NULL AS room_type,
        NULL AS room_size,
        U.username AS rated_by,
        R.score,
        R.noise,
        R.cleanliness,
        R.equipment_quality,
        R.wifi_strength,
        R.extra_comments,
        R.date
    FROM location L
    LEFT JOIN buildings B ON L.LID = B.LID
    LEFT JOIN nonbuildings NB ON L.LID = NB.LID
    LEFT JOIN ratings R ON L.LID = R.LID
    LEFT JOIN users U ON R.UID = U.uid
    WHERE L.university_id = v_univ_id

    UNION ALL

    SELECT 
        Bld.name AS location_name,
        'Room' AS location_type,
        Rm.room_number,
        Rm.room_type,
        Rm.room_size,
        U.username AS rated_by,
        Rt.score,
        Rt.noise,
        Rt.cleanliness,
        Rt.equipment_quality,
        Rt.wifi_strength,
        Rt.extra_comments,
        Rt.date
    FROM rooms Rm
    JOIN buildings Bl ON Rm.building_LID = Bl.LID
    JOIN location Bld ON Bl.LID = Bld.LID
    LEFT JOIN ratings Rt ON Rm.LID = Rt.LID
    LEFT JOIN users U ON Rt.UID = U.uid
    WHERE Bld.university_id = v_univ_id

    ORDER BY location_name, location_type, room_number;

END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE SearchWithEquipment(
    IN p_university_name VARCHAR(100),
    IN p_state VARCHAR(50),
    IN p_location_name VARCHAR(100),
    IN p_equipment_tag ENUM(
      'whiteboard','chalkboard','smartboard','projector','projector_screen',
      'document_camera','television_display','hdmi_input_available','vga_input_available',
      'wireless_display_adapter','lecture_capture_system','video_conferencing_system',
      'webcam','microphone','ceiling_speakers','audio_amplifier','soundbar',
      'podium_with_controls','lighting_controls','adjustable_lighting','desktop_computers',
      'laptop_checkout_station','charging_station','usb_power_outlets','ethernet_ports',
      'printer','scanner','3d_printer','plotter_printer','photocopier','microscope',
      'centrifuge','spectrophotometer','fume_hood','lab_sink','chemical_storage_cabinet',
      'safety_shower','eye_wash_station','biosafety_cabinet','incubator','balance_scale',
      'pipette_set','autoclave','cnc_machine','laser_cutter','vinyl_cutter','soldering_station',
      'oscilloscope','power_supply_unit','multimeter','workbench','tool_storage','art_easels',
      'light_table','ceramics_kiln','printing_press','photo_darkroom','camera_equipment',
      'tripod','lighting_kit','audio_recorder','green_screen','editing_workstation','piano',
      'music_stands','amplifier','mixing_console','studio_monitors','recording_booth',
      'lab_benches','movable_furniture','height_adjustable_desks','accessible_workstation',
      'soundproofing_panels','climate_control','air_filtration_system','refrigerator','freezer',
      'storage_lockers','safety_signage','fire_extinguisher','first_aid_kit','emergency_phone',
      'recycling_bin','trash_bin','water_fountain','bottle_filler','vending_machine',
      'coffee_machine','microwave','refrigerator_access','public_computer_terminal','kiosk',
      'digital_signage','interactive_map','project_material_storage','lockable_drawers',
      'equipment_checkout','supplies_cabinet','outdoor_seating','picnic_table','bike_rack',
      'charging_lockers','solar_charger')
)
BEGIN
    DECLARE v_univ_id INT;

    -- Step 1: Get the university ID
    SET v_univ_id = GetUniversityIDByNameAndState(p_university_name, p_state);

    IF v_univ_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: University not found.';
    END IF;

    -- Step 2: Select locations matching input and having the equipment tag
    SELECT 
        L.name AS location_name,
        U.username AS rated_by,
        R.score,
        R.noise,
        R.cleanliness,
        R.equipment_quality,
        R.wifi_strength,
        R.extra_comments,
        REt.equipment_tag
    FROM location L
    JOIN ratings R ON L.LID = R.LID
    JOIN rating_equipment REt ON R.RID = REt.RID
    JOIN users U ON R.UID = U.uid
    WHERE L.university_id = v_univ_id
      AND L.name LIKE CONCAT('%', p_location_name, '%')
      AND REt.equipment_tag = p_equipment_tag
    ORDER BY L.name, R.date;

END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE SearchWithAccessTag(
    IN p_university_name VARCHAR(100),
    IN p_state VARCHAR(50),
    IN p_location_name VARCHAR(100),
    IN p_accessibility_tag ENUM(
      'wheelchair_accessible','automatic_doors','ramps_available','elevator_access',
      'ground_level_entry','accessible_parking_nearby','curb_cuts_present','wide_doorways',
      'level_flooring','accessible_restroom','low_counter_service','braille_signage',
      'tactile_floor_markings','non_slip_surface','assistive_listening_devices','captioned_displays',
      'intercom_with_visual_alert','quiet_space_available','low_noise_environment',
      'sign_language_interpreter_available','captioned_media','sound_system_quality_good',
      'high_contrast_signage','braille_labels','tactile_maps','good_lighting','clear_wayfinding_signs',
      'large_print_materials','screen_reader_friendly_displays','accessible_electronic_kiosks',
      'clear_navigation_layout','consistent_signage','reduced_clutter_environment','quiet_study_space',
      'sensory_friendly_area','visual_distraction_minimized','step_by_step_directions_available',
      'predictable_noise_levels','allergen_friendly_area','scent_free_zone','service_animal_friendly',
      'emergency_exits_accessible','evacuation_plan_posted','accessible_first_aid_station',
      'accessible_pathways','rest_areas_with_seating','shaded_areas','smooth_pavement',
      'accessible_crosswalk_signals','clear_snow_removal_in_winter','bike_path_separation',
      'accessible_bus_stop','accessible_wifi_portal','accessible_digital_signage','accessible_website_info',
      'qr_codes_with_alt_text','virtual_tour_available','accessible_scheduling_system',
      'accessibility_office_nearby','staff_trained_in_accessibility','wheelchair_rental_available',
      'orientation_services_for_visually_impaired','accessibility_assistance_on_request',
      'mobility_scooter_charging_station')
)
BEGIN
    DECLARE v_univ_id INT;

    -- Step 1: Get the university ID
    SET v_univ_id = GetUniversityIDByNameAndState(p_university_name, p_state);

    IF v_univ_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: University not found.';
    END IF;

    -- Step 2: Select locations matching input and having the accessibility tag
    SELECT 
        L.name AS location_name,
        U.username AS rated_by,
        R.score,
        R.noise,
        R.cleanliness,
        R.equipment_quality,
        R.wifi_strength,
        R.extra_comments,
        RA.accessibility_tag
    FROM location L
    JOIN ratings R ON L.LID = R.LID
    JOIN rating_accessibility RA ON R.RID = RA.RID
    JOIN users U ON R.UID = U.uid
    WHERE L.university_id = v_univ_id
      AND L.name LIKE CONCAT('%', p_location_name, '%')
      AND RA.accessibility_tag = p_accessibility_tag
    ORDER BY L.name, R.date;

END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE SearchWithRating(
    IN p_university_name VARCHAR(100),
    IN p_state VARCHAR(50),
    IN p_campus_name VARCHAR(100), -- optional, can pass NULL
    IN p_rating_type VARCHAR(20),  -- use VARCHAR instead of ENUM
    IN p_min_value INT,
    IN p_max_value INT
)
BEGIN
    DECLARE v_univ_id INT;

    -- Step 1: Get university ID
    SET v_univ_id = GetUniversityIDByNameAndState(p_university_name, p_state);

    IF v_univ_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: University not found.';
    END IF;

    -- Validate rating type
    IF p_rating_type NOT IN ('wifi_strength','noise','equipment_quality','cleanliness') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Invalid rating type.';
    END IF;

    -- Step 2: Build dynamic SQL
    SET @sql = CONCAT(
        'SELECT L.name AS location_name,
                C.campus_name,
                U.username AS rated_by,
                R.score,
                R.noise,
                R.cleanliness,
                R.equipment_quality,
                R.wifi_strength,
                R.extra_comments
         FROM location L
         JOIN campus C ON L.campus_name = C.campus_name AND L.university_id = C.university_id
         JOIN ratings R ON L.LID = R.LID
         JOIN users U ON R.UID = U.uid
         WHERE L.university_id = ', v_univ_id,
         ' AND ', p_rating_type, ' BETWEEN ', p_min_value, ' AND ', p_max_value
    );

    -- If campus filter is provided
    IF p_campus_name IS NOT NULL THEN
        SET @sql = CONCAT(@sql, ' AND L.campus_name = ''', p_campus_name, '''');
    END IF;

    SET @sql = CONCAT(@sql, ' ORDER BY L.name, R.date');

    -- Execute dynamic SQL
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

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

DELIMITER $$
CREATE PROCEDURE RequestRoom(
    IN p_room_name VARCHAR(100),
    IN p_university_name VARCHAR(100),
    IN p_state VARCHAR(50),
    IN p_campus_name VARCHAR(100),
    IN p_building_name VARCHAR(100),
    IN p_requested_by_username VARCHAR(50)
)
BEGIN
    DECLARE v_univ_id INT;
    DECLARE v_building_LID INT;
    DECLARE v_user_id INT;

    -- Step 1: Get university ID
    SET v_univ_id = GetUniversityIDByNameAndState(p_university_name, p_state);
    IF v_univ_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: University not found.';
    END IF;

    -- Step 2: Get building LID
    SELECT L.LID INTO v_building_LID
    FROM location L
    JOIN buildings B ON L.LID = B.LID
    WHERE L.name = p_building_name
      AND L.campus_name = p_campus_name
      AND L.university_id = v_univ_id
    LIMIT 1;

    IF v_building_LID IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Building not found.';
    END IF;

    -- Step 3: Get user ID
    SELECT uid INTO v_user_id
    FROM users
    WHERE username = p_requested_by_username
    LIMIT 1;

    IF v_user_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: User not found.';
    END IF;

    -- Step 4: Insert room request
    INSERT INTO room_requests (room_name, university_id, campus_name, building_LID, requested_by)
    VALUES (p_room_name, v_univ_id, p_campus_name, v_building_LID, v_user_id);

    -- Step 5: Return success message
    SELECT CONCAT('Room request for "', p_room_name, '" submitted successfully.') AS message;
END$$
DELIMITER ;
