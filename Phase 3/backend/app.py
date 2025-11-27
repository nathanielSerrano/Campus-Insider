from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/hello')
def hello():
    return jsonify(message="Hello, from the Flask Backend!")

@app.route('/')
def index():
    return jsonify(message="Welcome to the Campus Insider API!")

if __name__ == '__main__':
    app.run(debug=True)