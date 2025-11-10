CREATE DATABASE CAMPUSINSIDER;
USE CAMPUSINSIDER;

CREATE TABLE users (
    uid SERIAL PRIMARY KEY,                  -- auto-incrementing unique ID
    username VARCHAR(50) NOT NULL UNIQUE,    -- must be unique
    password VARCHAR(255) NOT NULL,          -- store hashed passwords!
    university_id INT NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('Student', 'Faculty', 'Visitor'))
    FOREIGN KEY (university_id) REFERENCES University(university_id) ON DELETE CASCADE -- use university_id as foreign key to ensure unique references
);

