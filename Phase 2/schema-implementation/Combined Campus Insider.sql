DROP DATABASE IF EXISTS campus_insider;

CREATE DATABASE campus_insider;
USE campus_insider;

CREATE TABLE university (
    university_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    wiki_url VARCHAR(255),
    UNIQUE (name, state)  -- ensures name+state combination is unique
);

CREATE TABLE campus (
  campus_name VARCHAR(100),
  university_id INT NOT NULL,
  PRIMARY KEY (campus_name, university_id),
  FOREIGN KEY (university_id) REFERENCES university(university_id)
);

CREATE TABLE location (
    LID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    image LONGBLOB,
    campus_name VARCHAR(100) NOT NULL,
    university_id INT NOT NULL,
    FOREIGN KEY (campus_name, university_id)
        REFERENCES campus(campus_name, university_id)
        ON DELETE CASCADE
);

CREATE TABLE nonbuildings (
    LID INT PRIMARY KEY,
    description TEXT,
    FOREIGN KEY (LID) REFERENCES location(LID) ON DELETE CASCADE
);

CREATE TABLE buildings (
    LID INT PRIMARY KEY,
    FOREIGN KEY (LID) REFERENCES location(LID) ON DELETE CASCADE
);

CREATE TABLE rooms (
    LID INT PRIMARY KEY,
    building_LID INT NOT NULL,
    room_number VARCHAR(10) NULL,
    room_type ENUM('study room', 'computer room', 'science lab', 'classroom', 'facility', 'meeting room', 'store', 'venue') NOT NULL,
    room_size ENUM('small', 'medium', 'large') NOT NULL,
    FOREIGN KEY (LID) REFERENCES location(LID) ON DELETE CASCADE,
    FOREIGN KEY (building_LID) REFERENCES buildings(LID) ON DELETE CASCADE
);


CREATE TABLE users (
    uid INT AUTO_INCREMENT PRIMARY KEY,      -- auto-incrementing unique ID  #(Ahmad): modified it to INT auto increment primary key becase it was casueing problems with UID in ratings
    username VARCHAR(50) NOT NULL UNIQUE,    -- must be unique
    password VARCHAR(255) NOT NULL,
    university_id INT NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('Student', 'Faculty', 'Visitor')),
    FOREIGN KEY (university_id) REFERENCES university(university_id) ON DELETE CASCADE -- use university_id as foreign key to ensure unique references
);

CREATE TABLE ratings (
    RID INT AUTO_INCREMENT PRIMARY KEY,
    score INT NOT NULL CHECK (score BETWEEN 1 AND 10),
    date DATE DEFAULT (CURRENT_DATE),
    noise INT CHECK (noise BETWEEN 1 AND 5),                           -- 1 is silent, 5 is loud
    cleanliness INT CHECK (cleanliness BETWEEN 1 AND 5),               -- 1 is clean, 5 is very dirty
    equipment_quality INT CHECK (equipment_quality BETWEEN 1 AND 3),   -- 1 = great, 2 = okay, 3 = bad
    wifi_strength INT CHECK (wifi_strength BETWEEN 1 AND 3),           -- 1 = great, 2 = okay, 3 = bad
    extra_comments VARCHAR(2000),                                      -- using varchar since MySQL doesn't have CLOB
    UID INT NOT NULL,
    LID INT NOT NULL,
    FOREIGN KEY (UID) REFERENCES users(uid) ON DELETE CASCADE,         -- deleting user deletes ratings
    FOREIGN KEY (LID) REFERENCES location(LID) ON DELETE CASCADE,      -- deleting location deletes ratings
    UNIQUE KEY unique_user_location (UID, LID)                         -- ensures a user can only rate a location once
);

CREATE TABLE rating_equipment (
    RID INT NOT NULL,
    equipment_tag ENUM(
	  'whiteboard',
	  'chalkboard',
	  'smartboard',
	  'projector',
	  'projector_screen',
	  'document_camera',
	  'television_display',
	  'hdmi_input_available',
	  'vga_input_available',
	  'wireless_display_adapter',
	  'lecture_capture_system',
	  'video_conferencing_system',
	  'webcam',
	  'microphone',
	  'ceiling_speakers',
	  'audio_amplifier',
	  'soundbar',
	  'podium_with_controls',
	  'lighting_controls',
	  'adjustable_lighting',
	  'desktop_computers',
	  'laptop_checkout_station',
	  'charging_station',
	  'usb_power_outlets',
	  'ethernet_ports',
	  'printer',
	  'scanner',
	  '3d_printer',
	  'plotter_printer',
	  'photocopier',
	  'microscope',
	  'centrifuge',
	  'spectrophotometer',
	  'fume_hood',
	  'lab_sink',
	  'chemical_storage_cabinet',
	  'safety_shower',
	  'eye_wash_station',
	  'biosafety_cabinet',
	  'incubator',
	  'balance_scale',
	  'pipette_set',
	  'autoclave',
	  'cnc_machine',
	  'laser_cutter',
	  'vinyl_cutter',
	  'soldering_station',
	  'oscilloscope',
	  'power_supply_unit',
	  'multimeter',
	  'workbench',
	  'tool_storage',
	  'art_easels',
	  'light_table',
	  'ceramics_kiln',
	  'printing_press',
	  'photo_darkroom',
	  'camera_equipment',
	  'tripod',
	  'lighting_kit',
	  'audio_recorder',
	  'green_screen',
	  'editing_workstation',
	  'piano',
	  'music_stands',
	  'amplifier',
	  'mixing_console',
	  'studio_monitors',
	  'recording_booth',
	  'lab_benches',
	  'movable_furniture',
	  'height_adjustable_desks',
	  'accessible_workstation',
	  'soundproofing_panels',
	  'climate_control',
	  'air_filtration_system',
	  'refrigerator',
	  'freezer',
	  'storage_lockers',
	  'safety_signage',
	  'fire_extinguisher',
	  'first_aid_kit',
	  'emergency_phone',
	  'recycling_bin',
	  'trash_bin',
	  'water_fountain',
	  'bottle_filler',
	  'vending_machine',
	  'coffee_machine',
	  'microwave',
	  'refrigerator_access',
	  'public_computer_terminal',
	  'kiosk',
	  'digital_signage',
	  'interactive_map',
	  'project_material_storage',
	  'lockable_drawers',
	  'equipment_checkout',
	  'supplies_cabinet',
	  'outdoor_seating',
	  'picnic_table',
	  'bike_rack',
	  'charging_lockers',
	  'solar_charger') NOT NULL,
	PRIMARY KEY (RID, equipment_tag),
    FOREIGN KEY (RID) REFERENCES ratings(RID) ON DELETE CASCADE
);

CREATE TABLE rating_accessibility (
    RID INT NOT NULL,
    accessibility_tag ENUM(
      'wheelchair_accessible',
	  'automatic_doors',
	  'ramps_available',
	  'elevator_access',
	  'ground_level_entry',
	  'accessible_parking_nearby',
	  'curb_cuts_present',
	  'wide_doorways',
	  'level_flooring',
	  'accessible_restroom',
	  'low_counter_service',
	  'braille_signage',
	  'tactile_floor_markings',
	  'non_slip_surface',
	  'assistive_listening_devices',
	  'captioned_displays',
	  'intercom_with_visual_alert',
	  'quiet_space_available',
	  'low_noise_environment',
	  'sign_language_interpreter_available',
	  'captioned_media',
	  'sound_system_quality_good',
	  'high_contrast_signage',
	  'braille_labels',
	  'tactile_maps',
	  'good_lighting',
	  'clear_wayfinding_signs',
	  'large_print_materials',
	  'screen_reader_friendly_displays',
	  'accessible_electronic_kiosks',
	  'clear_navigation_layout',
	  'consistent_signage',
	  'reduced_clutter_environment',
	  'quiet_study_space',
	  'sensory_friendly_area',
	  'visual_distraction_minimized',
	  'step_by_step_directions_available',
	  'predictable_noise_levels',
	  'allergen_friendly_area',
	  'scent_free_zone',
	  'service_animal_friendly',
	  'emergency_exits_accessible',
	  'evacuation_plan_posted',
	  'accessible_first_aid_station',
	  'accessible_pathways',
	  'rest_areas_with_seating',
	  'shaded_areas',
	  'smooth_pavement',
	  'accessible_crosswalk_signals',
	  'clear_snow_removal_in_winter',
	  'bike_path_separation',
	  'accessible_bus_stop',
	  'accessible_wifi_portal',
	  'accessible_digital_signage',
	  'accessible_website_info',
	  'qr_codes_with_alt_text',
	  'virtual_tour_available',
	  'accessible_scheduling_system',
	  'accessibility_office_nearby',
	  'staff_trained_in_accessibility',
	  'wheelchair_rental_available',
	  'orientation_services_for_visually_impaired',
	  'accessibility_assistance_on_request',
	  'mobility_scooter_charging_station') NOT NULL,
    PRIMARY KEY (RID, accessibility_tag),
    FOREIGN KEY (RID) REFERENCES ratings(RID) ON DELETE CASCADE
);

CREATE TABLE room_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    room_name VARCHAR(100) NOT NULL,
    university_id INT NOT NULL,
    campus_name VARCHAR(100) NOT NULL,
    building_LID INT NOT NULL,
    requested_by INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    FOREIGN KEY (university_id) REFERENCES university(university_id) ON DELETE CASCADE,
    FOREIGN KEY (building_LID) REFERENCES buildings(LID) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES users(uid) ON DELETE CASCADE
);

