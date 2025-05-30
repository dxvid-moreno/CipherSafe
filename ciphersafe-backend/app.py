from flask import Flask, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from cryptography.fernet import Fernet
from datetime import datetime
import qrcode
import io
import csv
from fpdf import FPDF
import base64
import os

app = Flask(__name__)
CORS(app)

# Configuración de la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# Carga o crea la clave Fernet y guarda en 'secret.key'
def load_or_create_key():
    if not os.path.exists("secret.key"):
        key = Fernet.generate_key()
        with open("secret.key", "wb") as f:
            f.write(key)
    else:
        with open("secret.key", "rb") as f:
            key = f.read()
    return key

FERNET_KEY = load_or_create_key()
cipher = Fernet(FERNET_KEY)

# Modelos
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    passwords = db.relationship('PasswordEntry', backref='user', lazy=True)

class PasswordEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tag = db.Column(db.String(100))
    value = db.Column(db.String(300), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# Rutas
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(username=data['username'], email=data['email'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'Usuario registrado correctamente'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if not user or not bcrypt.check_password_hash(user.password, data['password']):
        return jsonify({'error': 'Credenciales inválidas'}), 401
    return jsonify({'message': 'Inicio de sesión exitoso', 'user_id': user.id}), 200

@app.route('/save-password', methods=['POST'])
def save_password():
    data = request.get_json()
    encrypted_pw = cipher.encrypt(data['password'].encode()).decode()
    entry = PasswordEntry(tag=data.get('tag', ''), value=encrypted_pw, user_id=data['user_id'])
    db.session.add(entry)
    db.session.commit()
    return jsonify({'message': 'Contraseña guardada exitosamente'}), 201

@app.route('/get-passwords/<int:user_id>', methods=['GET'])
def get_passwords(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    results = []
    for entry in user.passwords:
        decrypted = cipher.decrypt(entry.value.encode()).decode()
        results.append({
            'id': entry.id,
            'tag': entry.tag,
            'password': decrypted,
            'created_at': entry.created_at.strftime('%Y-%m-%d %H:%M')
        })
    return jsonify(results), 200

@app.route('/get-qr/<int:password_id>', methods=['GET'])
def get_qr(password_id):
    entry = PasswordEntry.query.get(password_id)
    if not entry:
        return jsonify({'error': 'No encontrada'}), 404
    decrypted = cipher.decrypt(entry.value.encode()).decode()
    qr = qrcode.make(decrypted)
    buf = io.BytesIO()
    qr.save(buf)
    img_base64 = base64.b64encode(buf.getvalue()).decode()
    return jsonify({'qr': img_base64})

@app.route('/export/<int:user_id>/<string:format>', methods=['GET'])
def export(user_id, format):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    try:
        passwords = [
            {
                'tag': entry.tag,
                'password': cipher.decrypt(entry.value.encode()).decode(),
                'created_at': entry.created_at.strftime('%Y-%m-%d %H:%M')
            } for entry in user.passwords
        ]
    except Exception as e:
        return jsonify({'error': 'Error al desencriptar contraseñas', 'detail': str(e)}), 500

    if format == 'csv':
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['Exportado por CipherSafe'])
        writer.writerow(['Tag', 'Password', 'Fecha'])
        for p in passwords:
            writer.writerow([p['tag'], p['password'], p['created_at']])
        output.seek(0)
        return output.getvalue(), 200, {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename=passwords.csv'
        }

    elif format == 'pdf':
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", 'B', 16)
        pdf.set_text_color(40, 40, 40)
        pdf.cell(0, 10, "CipherSafe - Reporte de Contraseñas", ln=True, align="C")
        pdf.ln(10)

        # Encabezados de tabla
        pdf.set_font("Arial", 'B', 12)
        pdf.set_fill_color(200, 220, 255)
        pdf.cell(60, 10, "Tag", 1, 0, 'C', True)
        pdf.cell(60, 10, "Password", 1, 0, 'C', True)
        pdf.cell(60, 10, "Fecha", 1, 1, 'C', True)

        # Cuerpo de tabla
        pdf.set_font("Arial", '', 11)
        for p in passwords:
            pdf.cell(60, 10, p['tag'], 1)
            pdf.cell(60, 10, p['password'], 1)
            pdf.cell(60, 10, p['created_at'], 1)
            pdf.ln()

        out = io.BytesIO()
        out.write(pdf.output(dest='S').encode('latin1'))
        out.seek(0)
        return send_file(out, download_name="passwords.pdf", as_attachment=True)

    return jsonify({'error': 'Formato no válido'}), 400

# Inicializa base de datos si no existe
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)
