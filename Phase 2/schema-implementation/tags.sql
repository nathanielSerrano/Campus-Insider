CREATE TABLE rating_equipment (
    equipment_id INT AUTO_INCREMENT PRIMARY KEY,
    rating_id INT NOT NULL,
    equipment_tag VARCHAR(100) NOT NULL,
    FOREIGN KEY (rating_id) REFERENCES ratings(rating_id) ON DELETE CASCADE
);

CREATE TABLE rating_accessibility (
    accessibility_id INT AUTO_INCREMENT PRIMARY KEY,
    rating_id INT NOT NULL,
    accessibility_tag VARCHAR(100) NOT NULL,
    FOREIGN KEY (rating_id) REFERENCES ratings(rating_id) ON DELETE CASCADE
);