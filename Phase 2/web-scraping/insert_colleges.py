import json
import mysql.connector
import os
import dotenv

# Load environment variables from .env file
dotenv.load_dotenv(dotenv_path=".env")
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")


# --- Step 1: Load JSON data ---
INPUT = "../Phase 2/web-scraping/data/US_Colleges.json"  # path to your JSON file

with open(INPUT, "r") as f:
    universities = json.load(f)

# --- Step 2: Connect to MySQL ---
conn = mysql.connector.connect(
    host="localhost",
    user=db_user,      # replace with your username
    password=db_password,  # replace with your password
    database="campus_insider"
)
cursor = conn.cursor()

# --- Step 3: Insert universities ---
for uni in universities:
    name = uni["name"].strip()
    state = uni["state"].strip()
    wiki_url = uni.get("wiki_url", None)

    # Check if university already exists
    cursor.execute(
        "SELECT university_id FROM university WHERE name=%s AND state=%s",
        (name, state)
    )
    result = cursor.fetchone()
    if result:
        # print(f"Skipping {name} ({state}) — already exists with ID {result[0]}")
        continue

    # Insert university
    cursor.execute(
        "INSERT INTO university (name, state, wiki_url) VALUES (%s, %s, %s)",
        (name, state, wiki_url)
    )
    # print(f"Inserted {name} ({state}) with ID {cursor.lastrowid}")

# --- Step 4: Commit and close ---
conn.commit()
cursor.close()
conn.close()

print("All universities inserted successfully!")
