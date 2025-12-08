# Campus Insider
**Campus Insider** is a full-stack web application that aggregates building and room data for U.S. colleges and universities. Students and faculty alike can:
 * Search for buildings, rooms, and campus locations
 * View details such as location type, room number, and campus
 * Submit ratings for academic spaces (grading noise, Wi-Fi, equipment, cleanliness, etc.)
 * Request missing rooms to be added
 * Leave comments and feedback
 * Access a friendly UI optimized for quick location lookup

This project was done as part of the Database Systems (COS 457 / COS 557) course at the University of Southern Maine.

Team Members:
 * Nathaniel Serrano (Team Leader)
   * [github.com/nathanielSerrano](url)
   * nathaniel.serrano@maine.edu
 * Benjamin Franklin
   * [github.com/bennyyy51](url)
   * benjamin.franklin1@maine.edu
 * Ahmad Mouhsen
   * [github.com/AhmadMouhsen](url)
   * ahmad.mouhsen@maine.edu


The application consists of:
 * React Frontend (Vite)
 * Python Flask Backend (REST API)
 * MySQL Database populated with cleaned U.S. campus data

## Features
### Location Search
 * Search buildings and rooms by name
 * Use toggleable filters to narrow down your search
 * Fast indexed search using MySQL B-tree indices

### Ratings & Reviews
 * Users can submit detailed multi-factor ratings that include:
   * Noise
   * Cleanliness
   * Equipment quality
   * Wi-Fi strength
   * Overall score
   * Comments

### User Authentication
 * Users can register & log in
 * When signing up, users select a university they are affiliated with
 * Guests (not signed in) can browse but cannot post reviews

### Database Automation
 * Includes scripts to populate the database:
   * `insert_colleges.py`
   * `insert_rooms.py`
   * `insert_study_rooms.py`
   * SQL initialization files for:
     * tables
     * functions
     * procedures
     * indices
     * MySQL user creation

## Tech Stack
### Frontend
 * React (Vite)
 * TailwindCSS
 * Lucide Icons

### Backend
 * Python Flask
 * MySQL Connector Python
 * CORS

### Database
 * MySQL 8
 * Normalized schema

## Installation (MacOS)
1. Clone the repository:
  ```
  git clone https://github.com/nathanielSerrano/Campus-Insider.git
  cd Campus-Insider
  ```
2. Install dependencies & initialize DB
Before running the installer, edit the `Phase 3/.env` file with the following information:
  ```
  DB_USER=root
  DB_PASSWORD=[your MySQL root password]
  ```
Run the installer:
  ```
  cd "Phase 3"
  chmod +x install.sh
  ./install.sh
  ```
This script will:
 * Install system packages
 * Create the MySQL database and user
 * Run all SQL files
 * Insert colleges, rooms, and study rooms
 * Install backend + frontend dependencies
3. Start the application
  ```
  chmod +x run.sh
  ./run.sh
  ```
This runs:
 * Flask backend (port 5000)
 * Vite frontend (port 5173)
