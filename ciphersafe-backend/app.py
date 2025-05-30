from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_pymongo import PyMongo
from cryptography.fernet import Fernet
from datetime import datetime

# --- Configuración base ---
app = Flask(__name__)
CORS(app)

# Clave JWT y MongoDB
app.config['JWT_SECRET_KEY'] = 'clave-secreta-segura'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/ciphersafe'
jwt = JWTManager(app)
mongo = PyMongo(app)

# Clave de cifrado (en producción deberías guardarla segura)
key = Fernet.generate_key()
cipher_suite = Fernet(key)

# Base de datos relacional (usuarios)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# --- Modelo de usuario ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)

# --- Registro ---
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'El usuario ya existe'}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Usuario registrado correctamente'}), 201

# --- Login ---
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({'error': 'Credenciales inválidas'}), 401

    access_token = create_access_token(identity=user.id)
    return jsonify({'message': 'Inicio de sesión exitoso', 'token': access_token}), 200


# --- Guardar contraseña (MongoDB + cifrado) ---
@app.route('/save-password', methods=['POST'])
@jwt_required()
def save_password():
    try:
        user_id = get_jwt_identity()
        print("✅ Usuario autenticado:", user_id)

        if not request.is_json:
            print("❌ El request no tiene JSON válido")
            return jsonify({'error': 'El contenido debe ser JSON'}), 400

        data = request.get_json()
        print("📦 JSON recibido:", data)

        password = data.get('password')
        tag = data.get('tag')

        if not password:
            return jsonify({'error': 'La contraseña es obligatoria'}), 400

        encrypted = cipher_suite.encrypt(password.encode())

        mongo.db.passwords.insert_one({
            'user_id': user_id,
            'password': encrypted.decode(),
            'tag': tag,
            'created_at': datetime.utcnow()
        })

        return jsonify({'message': 'Contraseña guardada correctamente'}), 201

    except Exception as e:
        print("❌ Error inesperado:", e)
        return jsonify({'error': 'Error interno del servidor'}), 500


# --- Obtener contraseñas guardadas ---
@app.route('/get-passwords', methods=['GET'])
@jwt_required()
def get_passwords():
    user_id = get_jwt_identity()
    passwords = mongo.db.passwords.find({'user_id': user_id})

    result = []
    for p in passwords:
        result.append({
            'id': str(p['_id']),
            'tag': p.get('tag'),
            'created_at': p.get('created_at').strftime('%Y-%m-%d %H:%M'),
        })

    return jsonify(result), 200

# --- Inicializar DB ---
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    print(">>> Iniciando servidor Flask...")
    app.run(debug=True)