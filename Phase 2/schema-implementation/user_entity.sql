CREATE TABLE users (
    UID INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    university_id INT NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('Student', 'Faculty', 'Visitor')),
    FOREIGN KEY (university_id) REFERENCES university(university_id) ON DELETE CASCADE
);
