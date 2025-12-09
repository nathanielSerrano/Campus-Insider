import mysql.connector
import dotenv
import os
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()


# Load environment variables from .env file
dotenv.load_dotenv(dotenv_path=".env")

def call_create_user_procedure(username, password, role, university, location):
    try:
        # Connect to the database
        connection = mysql.connector.connect(
            host="localhost",
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database="campus_insider"
        )

        cursor = connection.cursor()

        password_hash = bcrypt.generate_password_hash(password).decode('utf-8')


        # Call the stored procedure
        cursor.callproc('CreateUser', [username, password_hash, role, university, location])

        # Commit the transaction
        connection.commit()

        print("Procedure executed successfully.")

    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Call the function
call_create_user_procedure('admin', os.getenv('DB_ADMIN_PASSWORD'), 'student', 'University of Southern Maine', 'Maine')