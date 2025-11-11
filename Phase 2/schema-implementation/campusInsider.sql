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
    room_number VARCHAR(10) NOT NULL,
    room_type ENUM('study room', 'computer room', 'science lab', 'classroom', 'facility', 'meeting room', 'store', 'venue') NOT NULL,
    room_size ENUM('small', 'medium', 'large') NOT NULL,
    FOREIGN KEY (LID) REFERENCES location(LID) ON DELETE CASCADE,
    FOREIGN KEY (building_LID) REFERENCES buildings(LID) ON DELETE CASCADE
);
