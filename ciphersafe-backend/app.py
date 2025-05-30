from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from datetime import datetime

# --- Configuración base ---
app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# --- Modelo de Usuario ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    passwords = db.relationship('PasswordEntry', backref='user', lazy=True)

# --- Modelo de Contraseña ---
class PasswordEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tag = db.Column(db.String(100))  
    value = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# --- Registro ---
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'error': 'Faltan datos'}), 400

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

    return jsonify({'message': 'Inicio de sesión exitoso', 'user_id': user.id}), 200

# --- Guardar contraseña ---
@app.route('/save-password', methods=['POST'])
def save_password():
    data = request.get_json()
    user_id = data.get('user_id')
    password_value = data.get('password')
    tag = data.get('tag', '')

    if not user_id or not password_value:
        return jsonify({'error': 'Faltan datos'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    new_password = PasswordEntry(value=password_value, tag=tag, user_id=user.id)
    db.session.add(new_password)
    db.session.commit()

    return jsonify({'message': 'Contraseña guardada exitosamente'}), 201

# --- Obtener contraseñas ---
@app.route('/get-passwords/<int:user_id>', methods=['GET'])
def get_passwords(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    passwords = PasswordEntry.query.filter_by(user_id=user.id).all()
    result = []
    for p in passwords:
        result.append({
            'id': p.id,
            'tag': p.tag,
            'password': p.value,
            'created_at': p.created_at.strftime('%Y-%m-%d %H:%M')
        })

    return jsonify(result), 200

# --- Inicializar base de datos ---
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    print(">>> Iniciando servidor Flask...")
    app.run(debug=True)
