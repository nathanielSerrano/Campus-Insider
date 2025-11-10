CREATE TABLE rating_equipment (
    rating_id INT NOT NULL,
    equipment_tag VARCHAR(100) NOT NULL,
    PRIMARY KEY (rating_id, equipment_tag),
    FOREIGN KEY (rating_id) REFERENCES ratings(rating_id) ON DELETE CASCADE
);

CREATE TABLE rating_accessibility (
    rating_id INT NOT NULL,
    accessibility_tag VARCHAR(100) NOT NULL,
    PRIMARY KEY (rating_id, accessibility_tag),
    FOREIGN KEY (rating_id) REFERENCES ratings(rating_id) ON DELETE CASCADE
);