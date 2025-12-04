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



