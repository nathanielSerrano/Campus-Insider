from flask import Flask, jsonify
from flask_bcrypt import Bcrypt
from flask_cors import CORS
CORS()
bcrypt = Bcrypt()

app = Flask(__name__)

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
if __name__ == '__main__':
    app.run(debug=True)