CREATE DATABASE campus_insider;
USE campus_insider;

CREATE TABLE university (
    university_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
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
    room_number VARCHAR(10) NOT NULL,
    room_type ENUM('study room', 'computer room', 'science lab', 'classroom', 'facility', 'meeting room', 'store', 'venue') NOT NULL,
    room_size ENUM('small', 'medium', 'large') NOT NULL,
    FOREIGN KEY (LID) REFERENCES location(LID) ON DELETE CASCADE,
    FOREIGN KEY (building_LID) REFERENCES buildings(LID) ON DELETE CASCADE
);


CREATE TABLE users (
    uid INT AUTO_INCREMENT PRIMARY KEY,      -- auto-incrementing unique ID  #(Ahmad): modified it to INT auto increment primary key becase it was casueing problems with UID in ratings
    username VARCHAR(50) NOT NULL UNIQUE,    -- must be unique
    password VARCHAR(255) NOT NULL,          -- store hashed passwords!
    university_id INT NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('Student', 'Faculty', 'Visitor')),
    FOREIGN KEY (university_id) REFERENCES university(university_id) ON DELETE CASCADE -- use university_id as foreign key to ensure unique references
);

CREATE TABLE ratings (
    RID INT AUTO_INCREMENT PRIMARY KEY,
    score INT NOT NULL CHECK (score BETWEEN 1 AND 10),
    date DATE DEFAULT (CURRENT_DATE),
    noise INT CHECK (noise BETWEEN 1 AND 5), 							-- 1 is silent, 5 is loud
    cleanliness INT CHECK (cleanliness BETWEEN 1 AND 5),				-- 1 is clean, 5 is very dirty
    equipment_quality INT CHECK (equipment_quality BETWEEN 1 AND 3),	-- 1 = great, 2 = okay, 3 = bad
    wifi_strength INT CHECK (wifi_strength BETWEEN 1 AND 3),			-- 1 = great, 2 = okay, 3 = bad
    extra_comments VARCHAR(2000),										-- there is no clob in mySQL so I decided to use Varchar that holds 2000 characters
    UID INT NOT NULL,
    FOREIGN KEY (UID) REFERENCES users(uid) ON DELETE CASCADE, 	-- if a user is deleted, all their ratings are automatically deleted.
    LID INT NOT NULL,
    FOREIGN KEY (LID) REFERENCES location(LID) ON DELETE CASCADE -- if a location is deleted, all their ratings are automatically deleted.
);

CREATE TABLE rating_equipment (
    rating_id INT NOT NULL,
    equipment_tag VARCHAR(100) NOT NULL,
    PRIMARY KEY (rating_id, equipment_tag),
    FOREIGN KEY (rating_id) REFERENCES ratings(RID) ON DELETE CASCADE
);

CREATE TABLE rating_accessibility (
    rating_id INT NOT NULL,
    accessibility_tag VARCHAR(100) NOT NULL,
    PRIMARY KEY (rating_id, accessibility_tag),
    FOREIGN KEY (rating_id) REFERENCES ratings(RID) ON DELETE CASCADE
);
