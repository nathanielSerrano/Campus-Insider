# Application Setup (MacOS)

1. Clone the repository:
  ```
  git clone https://github.com/nathanielSerrano/Campus-Insider.git
  cd Campus-Insider
  ```
2. Install dependencies & initialize DB

Before running the installer, edit the `Phase 3/env-1.txt` file with the following information:
  ```
  DB_USER=root
  DB_PASSWORD=[your MySQL root password]
  ```
Rename the file to be '.env', still in the phase 3 directory.
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


## Signing in as Admin
For the purposes of seeing the current extent of this project, the admin user is automatically inserted into the database upon running `install.sh`. 

To log in as admin, open the web app, navigate to the login page, and enter:
```
username: admin
password: 123
```
(Note that this feature is just for testing purposes and would not be so insecure in an official product)

This will enable a "Manage Locations" button at the bottom of each university screen, which will navigate to the incomplete admin dashboard.


# Backend Setup (Flask)
1. Navigate to the backend directory:
   ```
   cd backend
   ```
2. (Optional but recommended): Create and activate a virtual environment:
    ```
    python -m venv venv
    source venv/bin/activate    # macOS/Linux
    venv\Scripts\activate       # Windows
    ```
3. Install backend dependencies:
    ```
    pip install -r requirements.txt
    ```
4. Run the Flask Server:
    ```
    python app.py
    ```
    or
  
    ```
    flask run
    ```
    
By default, Flask runs on `http://127.0.0.1:5000`. You can test an endpoint:
  ```
  curl http://127.0.0.1:5000/api/hello
  ```

# Frontend Setup (React + Vite + Tailwind)
1. Navigate to the frontend directory
    ```
    cd frontend
    ```
2. Install frontend dependencies
    ```
    npm install
    npm install -D @tailwindcss/postcss  
    npm install lucide-react
    ```
3. Run the development server
    ```
    npm run dev
    ```
 * Vite will show a URL in the terminal, usually `http://localhost:5173`
 * The frontned is configured to **fetch from the Flask backend** at `http://127.0.0.1:5000/api/...`.

# Development Workflow
1. **Backend**: Edit Python files in `backend/`. Changes are reflected automatically if the backend server is run in debug mode (this is done by default when running `app.py`).
2. **Frontend**: Edit React files in `front/src/`. Vite hot reloads all changes in the browser automatically
3. Navigate in your browser to the Vite frontend URL (whatever `npm run dev` shows) to see updates

## Notes
 * Make sure **both frontend and backend servers are running** to see dynamic content from the backend through the frontend

# Phase 3 Tasks

Advanced Database Feature -- Due Friday, November 28, 2025
 * Backup & Recovery Procedures
   * Ben
 * Database Security & Authentication
   * Nathaniel
 * Concurrency Control and Locking
   * Ahmad
  
Fully Functionable Web App -- Due Thursday, December 4, 2025
 * REACT Frontend 
   * Nathaniel
 * Flask Backend 
   * Ahmad




