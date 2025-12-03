from flask import Flask, jsonify, request, g
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import mysql.connector

CORS()
bcrypt = Bcrypt()

app = Flask(__name__)

def get_db():
    if 'db' not in g:
        g.db = mysql.connector.connect(
            host="localhost",
            user="app_rw",
            password="[your password]",
            database="campus_insider"
        )
    return g.db

@app.teardown_appcontext
def close_db(exception=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

@app.route('/api/hello')
def hello():
    return jsonify(message="Hello, from the Flask Backend!")

@app.route('/')
def index():
    return jsonify(message="Welcome to the Campus Insider API!")

@app.route('/api/login')
def login():
    # Dummy login endpoint for demonstration
    return jsonify(message="Login endpoint - functionality to be implemented.")

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
        sql += " AND u.state = %s"
        params.append(state)

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
        # Call stored procedure
        cursor.callproc("ShowUniversity", [university, state])

        result_sets = []
        
        # Read all result sets
        for result in cursor.stored_results():
            result_sets.append(result.fetchall())

        # result_sets[0] = university info
        # result_sets[1] = campuses
        # result_sets[2] = locations + building/nonbuilding ratings
        # result_sets[3] = rooms + room ratings

        response = {
            "university_info": result_sets[0] if len(result_sets) > 0 else [],
            "campuses": result_sets[1] if len(result_sets) > 1 else [],
            "locations": result_sets[2] if len(result_sets) > 2 else [],
        }

        return jsonify(response)

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

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    # ------ BASE SQL (UNCHANGED) ------
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
        R.room_size
    FROM location L
    LEFT JOIN buildings B ON L.LID = B.LID
    LEFT JOIN nonbuildings NB ON L.LID = NB.LID
    LEFT JOIN rooms R ON L.LID = R.LID
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
        return jsonify({"results": results, "ratings": rating_results})

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
        return jsonify({"tags": enum_list})
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
        return jsonify({"tags": enum_list})
    return jsonify({"tags": []})




if __name__ == '__main__':
    app.run(debug=True)