#!/bin/bash
cd backend
source venv/bin/activate
python3 app.py &   # backend runs in background

cd ../frontend
npm run dev         # frontend runs in foreground