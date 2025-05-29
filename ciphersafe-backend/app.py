# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify(message='Bienvenido a CipherSafe Backend')

if __name__ == '__main__':
    app.run(debug=True)
