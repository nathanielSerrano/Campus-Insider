from flask import Flask, jsonify, request
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import mysql.connector

CORS()
bcrypt = Bcrypt()

app = Flask(__name__)

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="[your password]",
    database="campus_insider"
)
cursor = conn.cursor()

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
    university_name = request.args.get("university")
    state = request.args.get("state", "")
    query = request.args.get("q", "")

    cursor = conn.cursor(dictionary=True)
    
    sql = """
    SELECT L.name AS location_name, 
           CASE 
               WHEN B.LID IS NOT NULL THEN 'Building'
               WHEN NB.LID IS NOT NULL THEN 'Non-building'
               ELSE 'Unknown'
           END AS location_type
    FROM location L
    LEFT JOIN buildings B ON L.LID = B.LID
    LEFT JOIN nonbuildings NB ON L.LID = NB.LID
    JOIN university U ON L.university_id = U.university_id
    WHERE U.name = %s
    """
    params = [university_name]

    if state:
        sql += " AND U.state = %s"
        params.append(state)
    if query:
        sql += " AND L.name LIKE %s"
        params.append(f"%{query}%")

    cursor.execute(sql, params)
    results = cursor.fetchall()
    cursor.close()

    return jsonify({"results": results})



if __name__ == '__main__':
    app.run(debug=True)