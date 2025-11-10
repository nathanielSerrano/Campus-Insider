CREATE TABLE rating_equipment (
    RID INT NOT NULL,
    equipment_tag VARCHAR(100) NOT NULL,
	PRIMARY KEY (RID, equipment_tag),
    FOREIGN KEY (RID) REFERENCES ratings(RID) ON DELETE CASCADE
);

CREATE TABLE rating_accessibility (
    RID INT NOT NULL,
    accessibility_tag VARCHAR(100) NOT NULL,
    PRIMARY KEY (RID, accessibility_tag),
    FOREIGN KEY (RID) REFERENCES ratings(RID) ON DELETE CASCADE
);
