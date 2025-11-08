CREATE DATABASE campus_insider;
USE campus_insider;

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


