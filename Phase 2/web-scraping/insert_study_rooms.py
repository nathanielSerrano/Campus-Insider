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
cursor = conn.cursor(buffered=True)

# --- Step 3: Map institution name to university_id ---
# Update this mapping based on your university table
university_map = {
    "USM": 54 # Whatever ID corresponds to University of Southern Maine, was 54 for me -- Nathaniel
}

# --- Step 4: Library → building mapping ---
# Maps library name → (building_name, campus_name)
library_to_building = {
    "Glickman Library": ("Glickman Library", "Portland"),
    "Gorham Library": ("Bailey Hall", "Gorham"),
    "LAC Library": (None, "Lewiston-Auburn")  # building unknown
}

# --- Step 5: Ensure campuses exist ---
campuses = {}
for item in data:
    uni_id = 54  # university_map[item["institution"]]
    campus_name = library_to_building[item["library"]][1]

    # Skip if already processed
    if (campus_name, uni_id) in campuses:
        continue

    cursor.execute("""
        SELECT COUNT(*) FROM campus WHERE campus_name=%s AND university_id=%s
    """, (campus_name, uni_id))
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO campus (campus_name, university_id) VALUES (%s, %s)
        """, (campus_name, uni_id))
    campuses[(campus_name, uni_id)] = True

conn.commit()

# --- Step 6: Insert buildings ---
buildings = {}
for item in data:
    uni_id = 54  # university_map[item["institution"]]
    building_name, campus_name = library_to_building[item["library"]]

    # Skip unknown buildings
    if building_name is None:
        continue

    key = (building_name, campus_name, uni_id)
    if key in buildings:
        continue

    # Check if building already exists
    cursor.execute("""
        SELECT LID FROM location
        WHERE name=%s AND campus_name=%s AND university_id=%s
    """, (building_name, campus_name, uni_id))
    result = cursor.fetchone()
    if result:
        building_LID = result[0]
    else:
        # Insert into location table
        cursor.execute("""
            INSERT INTO location (name, campus_name, university_id)
            VALUES (%s, %s, %s)
        """, (building_name, campus_name, uni_id))
        building_LID = cursor.lastrowid
        # Insert into buildings table
        cursor.execute("INSERT INTO buildings (LID) VALUES (%s)", (building_LID,))
    buildings[key] = building_LID

conn.commit()

# --- Step 7: Insert study rooms ---
for item in data:
    uni_id = 54  # university_map[item["institution"]]
    building_name, campus_name = library_to_building[item["library"]]
    building_LID = buildings.get((building_name, campus_name, uni_id))  # None if unknown

    if building_LID is None:
        placeholder_name = f"Unknown Building ({campus_name})"
        cursor.execute("""
            INSERT INTO location (name, campus_name, university_id)
            VALUES (%s, %s, %s)
        """, (placeholder_name, campus_name, uni_id))
        building_LID = cursor.lastrowid
        cursor.execute("INSERT INTO buildings (LID) VALUES (%s)", (building_LID,))
        buildings[(placeholder_name, campus_name, uni_id)] = building_LID

    room_name = item["room_name"]
    room_number = None  # study rooms have no numeric ID

    # Optional: download image_url and store as BLOB, else NULL
    image_url = item.get("image_url")  # can be stored if you extend schema

    # Insert room location
    cursor.execute("""
        INSERT INTO location (name, campus_name, university_id)
        VALUES (%s, %s, %s)
    """, (room_name, campus_name, uni_id))
    room_LID = cursor.lastrowid

    # Insert room
    cursor.execute("""
        INSERT INTO rooms (LID, building_LID, room_number, room_type, room_size)
        VALUES (%s, %s, %s, %s, %s)
    """, (room_LID, building_LID, room_number, "study room", "small"))

conn.commit()

# --- Step 8: Close connection ---
cursor.close()
conn.close()

print("Buildings and study rooms inserted successfully!")
