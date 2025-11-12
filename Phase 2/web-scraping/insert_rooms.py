import json
import mysql.connector

INPUT = "[path to rooms_clean.json]"

# --- Step 1: Load your raw JSON data ---
with open(INPUT, "r") as f:
    data = json.load(f)

# --- Step 2: Connect to MySQL ---
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="[your password]",
    database="campus_insider"
)
cursor = conn.cursor()

# --- Step 3: Map institution name to university_id ---
# Update this mapping based on your university table
university_map = {
    "USM": 54 # Whatever ID corresponds to University of Southern Maine, was 54 for me -- Nathaniel
}

# --- Step 4: Process unique buildings first ---
buildings = {}
for item in data:
    uni_id = university_map[item["institution"]]

    # Map institution name -> university_id
    uni_id = university_map[item['institution']]

    # Ensure campus exists
    cursor.execute("""
        SELECT COUNT(*) FROM campus WHERE campus_name=%s AND university_id=%s
        """, (item['campus'], uni_id))
    if cursor.fetchone()[0] == 0:
        # Insert campus if missing
        cursor.execute("""
            INSERT INTO campus (campus_name, university_id)
            VALUES (%s, %s)
        """, (item['campus'], uni_id))

    key = (item["building"], item["campus"], uni_id)
    if key not in buildings:
        # Insert into location table (for building)
        cursor.execute("""
            INSERT INTO location (name, campus_name, university_id)
            VALUES (%s, %s, %s)
        """, (item["building"], item["campus"], uni_id))
        building_LID = cursor.lastrowid  # Get auto-generated LID
        # Insert into buildings table
        cursor.execute("INSERT INTO buildings (LID) VALUES (%s)", (building_LID,))
        buildings[key] = building_LID  # store mapping

conn.commit()

# --- Step 5: Insert rooms ---
for item in data:
    uni_id = university_map[item["institution"]]
    building_key = (item["building"], item["campus"], uni_id)
    building_LID = buildings[building_key]

    room_number = item.get("room_number")
    if room_number is None:
        # fallback: try to parse from "room" string
        # e.g., "Room 10" → "10"
        room_number = item["room"].split()[-1]

    # Insert room location
    cursor.execute("""
        INSERT INTO location (name, campus_name, university_id)
        VALUES (%s, %s, %s)
    """, (item["room"], item["campus"], uni_id))
    room_LID = cursor.lastrowid

    # Insert room
    cursor.execute("""
        INSERT INTO rooms (LID, building_LID, room_number, room_type, room_size)
        VALUES (%s, %s, %s, %s, %s)
    """, (room_LID, building_LID, room_number, "classroom", "medium"))

conn.commit()

# --- Step 6: Close connection ---
cursor.close()
conn.close()

print("Buildings and rooms inserted successfully!")
