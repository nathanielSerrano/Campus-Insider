from flask import Flask, jsonify, request, g
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import mysql.connector
import os
from dotenv import load_dotenv
from datetime import datetime




bcrypt = Bcrypt()

app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

load_dotenv()

db_user = os.environ.get("DB_USER")
db_password = os.environ.get("DB_PASSWORD")

def get_db():
    if 'db' not in g:
        g.db = mysql.connector.connect(
            host="localhost",
            user=db_user,
            password=db_password,
            database="campus_insider"
        )
    return g.db

@app.teardown_appcontext
def close_db(exception=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

@app.route('/')
def index():
    return jsonify(message="Welcome to the Campus Insider API!")

@app.route('/api/login', methods=['POST'])
def login():
    # Dummy login endpoint for demonstration
    # return jsonify(message="Login endpoint - functionality to be implemented.")
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    cursor.close()
    if user and bcrypt.check_password_hash(user['password'], password):
        return jsonify(message="Login successful", user={"username": user["username"], "role": user["role"], "university_id": user["university_id"]})
    else:
        return jsonify(message="Invalid username or password"), 401

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')
    uni = data.get('university')
    state = data.get('state')

    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.callproc("CreateUser", [username, password_hash, role, uni, state])
        conn.commit()
        return jsonify(message="User registered successfully"), 201
    except mysql.connector.Error as err:
        return jsonify(message="Error registering user", error=str(err)), 400
    finally:
        cursor.close()

@app.route("/api/search")
def search():
    q = request.args.get("q", "")
    state = request.args.get("state", "")

    sql = """
    SELECT DISTINCT u.name AS university, u.state
    FROM university u
    LEFT JOIN campus c ON u.university_id = c.university_id
    WHERE u.name LIKE %s
    """
    params = [f"%{q}%"]

    if state:
        sql += " AND u.state LIKE %s"
        params.append(f"%{state}%")

    sql += " LIMIT 20"

    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(sql, params)
    results = cursor.fetchall()
    cursor.close()

    return jsonify({"results": results})

@app.route("/api/university", methods=["GET"])
def show_university():
    university = request.args.get("name")
    state = request.args.get("state")

    if not university or not state:
        return jsonify({"error": "Missing name or state"}), 400

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    try:
        # ============================================================
        # 1. University Info
        # ============================================================
        sql_uni = """
            SELECT university_id, name, state, wiki_url
            FROM university
            WHERE name = %s AND state = %s
        """

        cursor.execute(sql_uni, (university, state))
        uni_info = cursor.fetchall()

        if not uni_info:
            return jsonify({"error": "University not found"}), 404

        uni_id = uni_info[0]["university_id"]

        # ============================================================
        # 2. Campuses
        # ============================================================
        sql_campuses = """
            SELECT campus_name
            FROM campus
            WHERE university_id = %s
            ORDER BY campus_name;
        """

        cursor.execute(sql_campuses, (uni_id,))
        campuses = cursor.fetchall()

        # ============================================================
        # 3. Locations
        # ============================================================
        sql_locations = """
SELECT 
    L.LID,
    L.name AS location_name,
    L.campus_name,

    CASE
        WHEN B.LID IS NOT NULL THEN 'Building'
        WHEN NB.LID IS NOT NULL THEN 'Non-building'
        ELSE 'Room'
    END AS location_type,

    R.room_number,
    R.room_type,
    R.room_size,

    BL.name AS building_name  -- NEW: get the building name
FROM location L
LEFT JOIN buildings B ON L.LID = B.LID
LEFT JOIN nonbuildings NB ON L.LID = NB.LID
LEFT JOIN rooms R ON L.LID = R.LID
LEFT JOIN location BL ON R.building_LID = BL.LID   -- NEW JOIN
WHERE L.university_id = %s
ORDER BY L.name;

        """

        cursor.execute(sql_locations, (uni_id,))
        raw_locations = cursor.fetchall()

        # ============================================================
        # 4. Optional cleanup / formatting
        # ============================================================
        final_locations = []
        seen = set()
        for row in raw_locations:
            loc_type = row["location_type"]

            raw_name = row["location_name"]

            if loc_type == "Room" and row["room_number"] is not None:
                # Room: use the building_name from the join
                building_name = row["building_name"]
                room_num = row["room_number"]

                formatted_name = f"{building_name} - Room {room_num}"

            else:
                # Building or non-building
                formatted_name = raw_name

            key = (formatted_name, loc_type)
            if key in seen:
                continue
            seen.add(key)

            final_locations.append({
                        "location_name": formatted_name,     # the frontend label
                        "unformatted_name": raw_name,        # the exact DB name (for filtering/search)
                        "location_type": loc_type,
                        "campus_name": row["campus_name"],
                        "building_name": row.get("building_name"),  
                        "room_number": row.get("room_number")     
                            })

        # ============================================================
        # Final Response
        # ============================================================
        return jsonify({
            "university_info": uni_info,
            "campuses": campuses,
            "locations": final_locations
        })

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        cursor.close()

        
    
@app.route("/api/locationSearch", methods=["GET"])
def search_locations():
    university_name = request.args.get("university", "")
    state = request.args.get("state", "")
    query = request.args.get("q", "")

    # OPTIONAL FILTERS
    types = request.args.get("types", "")          # room, building, nonbuilding
    room_sizes = request.args.get("roomSizes", "") # small,medium,large
    room_types = request.args.get("roomTypes", "") # study room, computer room...
    room_number = request.args.get("roomNumber", "")
    search_by_rating = request.args.get("searchByRating", "")
    campus = request.args.get("campus", "")
    building = request.args.get("building", "")

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    sql = """
SELECT 
    L.name AS location_name,

    CASE 
        WHEN B.LID IS NOT NULL THEN 'Building'
        WHEN NB.LID IS NOT NULL THEN 'Non-building'
        ELSE 'Room'
    END AS location_type,

    R.room_number,
    R.room_type,
    R.room_size,

    BL.name AS building_name,     -- building name from the building’s location row
    L.campus_name                 -- directly from location table

FROM location L
LEFT JOIN buildings B ON L.LID = B.LID
LEFT JOIN nonbuildings NB ON L.LID = NB.LID
LEFT JOIN rooms R ON L.LID = R.LID

-- FIX: use building_LID instead of building_id
LEFT JOIN buildings BR ON R.building_LID = BR.LID
LEFT JOIN location BL ON BR.LID = BL.LID

JOIN university U ON L.university_id = U.university_id
WHERE U.name = %s
"""


    params = [university_name]

    # ------ OPTIONAL BASE CONDITIONS ------
    if state:
        sql += " AND U.state = %s"
        params.append(state)

    if query:
        sql += " AND L.name LIKE %s"
        params.append(f"%{query}%")

    # ------ TYPE FILTERS ------
    if types:
        type_list = [t.strip().lower() for t in types.split(",")]

        type_conditions = []
        if "room" in type_list:
            type_conditions.append("R.LID IS NOT NULL")
        if "building" in type_list:
            type_conditions.append("B.LID IS NOT NULL")
        if "nonbuilding" in type_list:
            type_conditions.append("NB.LID IS NOT NULL")

        if type_conditions:
            sql += " AND (" + " OR ".join(type_conditions) + ")"

    # ------ ROOM SIZE FILTER ------
    if room_sizes:
        sizes = room_sizes.split(",")
        placeholders = ", ".join(["%s"] * len(sizes))
        sql += f" AND R.room_size IN ({placeholders})"
        params.extend(sizes)

    # ------ ROOM TYPE FILTER ------
    if room_types:
        rtypes = room_types.split(",")
        placeholders = ", ".join(["%s"] * len(rtypes))
        sql += f" AND R.room_type IN ({placeholders})"
        params.extend(rtypes)

    # ------ ROOM NUMBER FILTER ------
    if room_number:
        sql += " AND R.room_number = %s"
        params.append(room_number)

    # ------ CAMPUS FILTER ------
    if campus:
        sql += " AND L.campus_name LIKE %s"
        params.append(f"%{campus}%")
    
    # ------ BUILDING FILTER ------
    if building:
        sql += " AND BL.name LIKE %s"
        params.append(f"%{building}%")

     # Execute base SQL first
    cursor.execute(sql, params)
    results = cursor.fetchall()

    # Rating filter
    if search_by_rating:
        rating_type = request.args.get("ratingType")  # e.g., "score", "noise"
        min_val = request.args.get("ratingMin", 1, type=int)
        max_val = request.args.get("ratingMax", 10, type=int)
        campus_name = request.args.get("campus")  # optional

        # Call the stored procedure
        cursor.callproc(
            "SearchWithRating",
            [university_name, state, campus_name, rating_type, min_val, max_val]
        )

        # Collect procedure results
        rating_results = []
        for result in cursor.stored_results():
            rating_results.extend(result.fetchall())

        # Optionally merge rating_results with your base results
        # For now, just return rating results separately
        final_results = []
        rating_lids = {r['LID'] for r in rating_results}
        for res in results:
            if res['LID'] in rating_lids:
                final_results.append(res)
        results = final_results

        # return jsonify({"results": results, "ratings": rating_results})

    cursor.close()
    return jsonify({"results": results})

@app.route("/api/equipmentTags")
def get_equipment_tags():
    conn = get_db()
    cursor = conn.cursor()
    sql = """
        SELECT SUBSTRING(COLUMN_TYPE, 6, CHAR_LENGTH(COLUMN_TYPE) - 6) AS enum_values
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = %s
          AND TABLE_NAME = %s
          AND COLUMN_NAME = %s
    """
    cursor.execute(sql, ("campus_insider", "rating_equipment", "equipment_tag"))
    row = cursor.fetchone()
    cursor.close()

    if row:
        # Convert 'val1','val2','val3',... to a Python list
        enum_list = [v.strip("'") for v in row[0].split(",")]
        clean_tags = [v.replace("_"," ") for v in enum_list]
        return jsonify({"tags": clean_tags})
    return jsonify({"tags": []})

@app.route("/api/accessibilityTags")
def get_accessibility_tags():
    conn = get_db()
    cursor = conn.cursor()
    sql = """
        SELECT SUBSTRING(COLUMN_TYPE, 6, CHAR_LENGTH(COLUMN_TYPE) - 6) AS enum_values
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = %s
          AND TABLE_NAME = %s
          AND COLUMN_NAME = %s
    """
    cursor.execute(sql, ("campus_insider", "rating_accessibility", "accessibility_tag"))
    row = cursor.fetchone()
    cursor.close()

    if row:
        enum_list = [v.strip("'") for v in row[0].split(",")]
        clean_tags = [v.replace("_"," ") for v in enum_list]
        return jsonify({"tags": clean_tags})
    return jsonify({"tags": []})

@app.route("/api/request-room", methods=["POST"])
def api_request_room():
    data = request.get_json()

    try:
        conn = get_db()
        cur = conn.cursor(dictionary=True)

        cur.callproc("RequestRoom", [
            data["room_name"],
            data["university_name"],
            data["state"],
            data["campus_name"],
            data["building_name"],
            data["requested_by_username"],
        ])

        # Stored procedure returns a result set
        for result in cur.stored_results():
            message = result.fetchone()["message"]

        conn.commit()
        return jsonify({"message": message})

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400

    finally:
        cur.close()
        conn.close()

@app.route("/api/reviews", methods=["GET"])
def get_reviews():
    """Fetch all ratings for a given location and university."""
    location_name = request.args.get("location")
    university_name = request.args.get("university")

    if not location_name or not university_name:
        return jsonify({"error": "Missing location or university"}), 400

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    sql = """
    SELECT 
        r.RID,
        u.username,
        u.role AS role,
        r.score,
        r.noise,
        r.cleanliness,
        r.equipment_quality,
        r.wifi_strength,
        r.extra_comments AS comment,
        r.date
    FROM ratings r
    JOIN users u ON r.UID = u.uid
    JOIN location l ON r.LID = l.LID
    JOIN university uni ON l.university_id = uni.university_id
    WHERE l.name = %s AND uni.name = %s
    ORDER BY r.date DESC
    """

    cursor.execute(sql, (location_name, university_name))
    reviews = cursor.fetchall()

    cursor.close()
    conn.close()
    return jsonify({"reviews": reviews})


@app.route("/api/addReview", methods=["POST"])
def add_review():
    """Add a new rating for a location."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON"}), 400

        required_fields = [
            "username", "score", "noise", "cleanliness",
            "equipment_quality", "wifi_strength", "location", "university"
        ]
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing fields"}), 400

        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        # Find user
        cursor.execute("SELECT uid, role FROM users WHERE username = %s", (data["username"],))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404
        uid = user["uid"]
        role = user["role"]

        # Find location
        cursor.execute("""
            SELECT l.LID 
            FROM location l
            JOIN university u ON l.university_id = u.university_id
            WHERE l.name = %s AND u.name = %s
        """, (data["location"], data["university"]))
        loc = cursor.fetchone()
        if not loc:
            return jsonify({"error": "Location not found"}), 404
        lid = loc["LID"]

        # Insert review
        cursor.execute("""
            INSERT INTO ratings 
            (UID, LID, score, noise, cleanliness, equipment_quality, wifi_strength, extra_comments, date)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            uid, lid,
            data["score"], data["noise"], data["cleanliness"],
            data["equipment_quality"], data["wifi_strength"],
            data.get("comment", ""),
            datetime.now()
        ))
        conn.commit()

        return jsonify({"message": "Review added successfully", "role": role, "username": data["username"]})

    except Exception as e:
        # Catch all other errors and return JSON instead of HTML
        return jsonify({"error": str(e)}), 500

    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass

@app.route("/api/locationRatings")
def location_ratings():
    location_name = request.args.get("location", "")
    university_name = request.args.get("university", "")
    room_param = request.args.get("room", "")  # extra param used by university page

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    # -----------------------------------------
    # Get location info
    # -----------------------------------------
    cursor.execute(
        """
SELECT
  L.LID,
  L.name AS location_name,
  CASE
    WHEN B.LID IS NOT NULL THEN 'Building'
    WHEN NB.LID IS NOT NULL THEN 'Non-building'
    ELSE 'Room'
  END AS location_type,
  -- building_name: for ROOM rows, look up the building's location row name (BL.name)
  CASE
    WHEN B.LID IS NULL AND NB.LID IS NULL THEN BL.name
    ELSE NULL
  END AS building_name,
  U.name AS university_name,
  L.campus_name AS campus_name
FROM location L
LEFT JOIN buildings B ON L.LID = B.LID
LEFT JOIN nonbuildings NB ON L.LID = NB.LID
-- If L is a room (i.e., no B and no NB), find the room row, its building, then that building's location row
LEFT JOIN rooms R ON L.LID = R.LID
LEFT JOIN buildings BR ON R.building_LID = BR.LID
LEFT JOIN location BL ON BR.LID = BL.LID
JOIN university U ON L.university_id = U.university_id
WHERE (
      L.name = %s
   OR L.name = %s
   OR REPLACE(L.name, ' - Room ', ' ') = %s
)
AND U.name = %s

        """,
        (
            location_name,      # matches raw "BEH 1000" or "BEH - Room 1000"
            room_param,         # matches exact room long-format name
            location_name,      # matches translated short version
            university_name,
        )
    )

    # location_info = cursor.fetchone()
    rows = cursor.fetchall()  # fetch all to clear result set
    location_info = rows[0] if rows else None
    

    if not location_info:
        cursor.close()
        return {"location": None, "ratings": []}

    lid = location_info["LID"]

    # -----------------------------------------
    # Get ratings for this location
    # -----------------------------------------
    cursor.execute(
        """
        SELECT R.RID,
               U.username AS user_type,
               U.role AS role,
               R.score,
               R.noise,
               R.cleanliness,
               R.equipment_quality,
               R.wifi_strength,
               R.extra_comments AS comment,
               GROUP_CONCAT(DISTINCT RE.equipment_tag) AS tags_equipment,
               GROUP_CONCAT(DISTINCT RE2.accessibility_tag) AS tags_accessibility
        FROM ratings R
        JOIN users U ON R.UID = U.uid
        LEFT JOIN rating_equipment RE ON R.RID = RE.RID
        LEFT JOIN rating_accessibility RE2 ON R.RID = RE2.RID
        WHERE R.LID = %s
        GROUP BY R.RID
        """,
        (lid,)
    )
    
    ratings = cursor.fetchall()

    # Convert comma-separated tags → arrays
    for r in ratings:
        r["tags_equipment"] = r["tags_equipment"].split(",") if r["tags_equipment"] else []
        r["tags_accessibility"] = r["tags_accessibility"].split(",") if r["tags_accessibility"] else []

    cursor.close()
    return {"location": location_info, "ratings": ratings}


#temp login route for testing
@app.route("/api/login", methods=["POST"])
def login_user():   # <-- changed function name
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT username, password, role, university_id FROM users WHERE username = %s",
        (username,)
    )
    user = cursor.fetchone()
    cursor.close()

    if not user:
        return jsonify({"error": "User not found"}), 404

    if password != user["password"]:
        return jsonify({"error": "Incorrect password"}), 401

    return jsonify({
        "message": "Login successful",
        "username": user["username"],
        "role": user["role"],
        "university_id": user["university_id"]
    })

# @app.route("/api/admin/dashboard")
# def admin_dashboard():
#     conn = get_db()
#     cursor = conn.cursor(dictionary=True)

#     # Example: Fetch total number of users
#     cursor.execute("SELECT COUNT(*) AS total_users FROM users")
#     total_users = cursor.fetchone()["total_users"]

#     # Example: Fetch total number of universities
#     cursor.execute("SELECT COUNT(*) AS total_universities FROM university")
#     total_universities = cursor.fetchone()["total_universities"]

#     cursor.close()

#     return jsonify({
#         "total_users": total_users,
#         "total_universities": total_universities
#     })

@app.route("/api/admin/requested-rooms")
def admin_requested_rooms():
    user = get_current_user()
    if not user or user["username"] != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    sql = """
        SELECT 
            rr.request_id,
            rr.room_name,
            rr.campus_name,
            rr.status,
            u.username AS requested_by_email,
            uni.name AS university_name,
            L.name AS building_name
        FROM room_requests rr
        JOIN users u ON u.uid = rr.requested_by
        JOIN university uni ON uni.university_id = rr.university_id
        JOIN location L ON L.LID = rr.building_LID
        ORDER BY rr.request_id DESC
    """

    cursor.execute(sql)
    rows = cursor.fetchall()

    return jsonify({"requests": rows})

def get_current_user():
    # token = request.cookies.get("auth_token")
    # if not token:
    #     return None

    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT uid, username, role FROM users WHERE username = 'admin'")
    user = cursor.fetchone()
    cursor.close()

    return user



if __name__ == '__main__':
    app.run(debug=True)