CREATE TABLE ratings (
    RID INT AUTO_INCREMENT PRIMARY KEY,
    score INT NOT NULL CHECK (score BETWEEN 1 AND 10),
    date DATE DEFAULT (CURRENT_DATE),
    noise INT CHECK (noise BETWEEN 1 AND 5),
    cleanliness INT CHECK (cleanliness BETWEEN 1 AND 5),
    equipment_quality INT CHECK (equipment_quality BETWEEN 1 AND 3),
    wifi_strength INT CHECK (wifi_strength BETWEEN 1 AND 3),
    extra_comments VARCHAR(2000),
    UID INT NOT NULL,
    FOREIGN KEY (UID) REFERENCES users(UID) ON DELETE CASCADE,
    LID INT NOT NULL,
    FOREIGN KEY (LID) REFERENCES location(LID) ON DELETE CASCADE
);
