CREATE DATABASE CAMPUSINSIDER;
USE CAMPUSINSIDER;

CREATE TABLE users (
    uid SERIAL PRIMARY KEY,                  -- auto-incrementing unique ID
    username VARCHAR(50) NOT NULL UNIQUE,    -- must be unique
    password VARCHAR(255) NOT NULL,          -- store hashed passwords!
    institution VARCHAR(100) check (institution IN (select name from University)),
    role VARCHAR(10) NOT NULL CHECK (role IN ('Student', 'Faculty', 'Visitor'))
);

