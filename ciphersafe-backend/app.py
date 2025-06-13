from flask import Flask, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from cryptography.fernet import Fernet
from datetime import datetime, timedelta # Importar timedelta
import qrcode
import io
import csv
from fpdf import FPDF
import base64
import os
import random # Para generar el OTP
from flask_mail import Mail, Message # Importar Flask-Mail

app = Flask(__name__)
CORS(app)

# Configuración de la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configuración de Flask-Mail para el envío de correos (ejemplo con Gmail)
# ¡ADVERTENCIA! Para producción, usa variables de entorno para las credenciales.
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.environ.get('EMAIL_USER', 'cristhiandf001@gmail.com') # REEMPLAZA O USA VAR. DE ENTORNO
app.config['MAIL_PASSWORD'] = os.environ.get('EMAIL_PASS', 'gsndlhnguirjgkdd') # REEMPLAZA O USA VAR. DE ENTORNO
app.config['MAIL_DEFAULT_SENDER'] = ('CipherSafe', os.environ.get('EMAIL_USER', 'cristhiandf001@gmail.com')) # REEMPLAZA O USA VAR. DE ENTORNO

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
mail = Mail(app) # Inicializar Flask-Mail

with app.app_context():
    engine = db.engine
    db_path = engine.url.database
    print(f"DEBUG: La base de datos está en: {db_path}")

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
    # Nuevas columnas para 2FA
    otp_secret = db.Column(db.String(6), nullable=True) # Para almacenar el OTP
    otp_expiration = db.Column(db.DateTime, nullable=True) # Para la expiración del OTP
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
    # Verificar si el usuario o correo ya existen
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'El nombre de usuario ya existe'}), 409
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'El correo electrónico ya está registrado'}), 409

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

    # Generar OTP
    otp = str(random.randint(100000, 999999)) # Genera un OTP de 6 dígitos
    user.otp_secret = otp
    user.otp_expiration = datetime.utcnow() + timedelta(minutes=5) # OTP válido por 5 minutos
    db.session.commit()

    # Enviar OTP por correo
    try:
        msg = Message('Tu Código de Verificación de CipherSafe', recipients=[user.email])
        msg.body = f'Hola {user.username},\n\nTu código de verificación de dos pasos es: {otp}\n\nEste código es válido por 5 minutos.\n\nSi no solicitaste este código, por favor ignora este correo.'
        mail.send(msg)
        return jsonify({'message': 'Código OTP enviado a tu correo electrónico', 'user_id': user.id}), 200
    except Exception as e:
        print(f"Error al enviar correo: {e}")
        return jsonify({'error': 'Error al enviar el código OTP. Intenta de nuevo más tarde.'}), 500

@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    user_id = data.get('user_id')
    otp_code = data.get('otp_code')

    if not user_id or not otp_code:
        return jsonify({'error': 'Faltan datos de usuario o código OTP'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    # Verificar si el OTP coincide y no ha expirado
    if user.otp_secret == otp_code and \
       user.otp_expiration and \
       datetime.utcnow() < user.otp_expiration:
        
        # OTP válido, limpiar el OTP de la base de datos para evitar reusos
        user.otp_secret = None
        user.otp_expiration = None
        db.session.commit()
        return jsonify({'message': 'Verificación de dos pasos exitosa', 'user_id': user.id}), 200
    
    else:
        return jsonify({'error': 'Código OTP inválido o expirado'}), 401

@app.route('/save-password', methods=['POST'])
def save_password():
    data = request.get_json()
    print(f"DEBUG (Backend): Recibida solicitud para guardar contraseña. Datos: {data}")

    try:
        password_value = data['password']
        encrypted_pw = cipher.encrypt(password_value.encode()).decode()
        print(f"DEBUG (Backend): Contraseña encriptada: {encrypted_pw}")
        
        user_id = data['user_id']
        tag = data.get('tag', '')

        # Crear el objeto PasswordEntry
        entry = PasswordEntry(tag=tag, value=encrypted_pw, user_id=user_id)
        print(f"DEBUG (Backend): Objeto PasswordEntry creado: tag='{entry.tag}', value='{entry.value}', user_id={entry.user_id}")

        # Añadir el objeto a la sesión de la base de datos
        db.session.add(entry)
        print("DEBUG (Backend): Objeto añadido a la sesión de SQLAlchemy.")

        # Intentar realizar el commit y capturar posibles errores
        try:
            db.session.commit()
            print("DEBUG (Backend): ¡Commit de la sesión realizado exitosamente!")
            return jsonify({'message': 'Contraseña guardada exitosamente'}), 201
        except Exception as e:
            # Si el commit falla, es crucial hacer un rollback
            db.session.rollback() 
            print(f"ERROR (Backend): Fallo al realizar el commit en la base de datos: {e}")
            return jsonify({'error': f'Error al guardar la contraseña en la base de datos: {e}'}), 500

    except KeyError as e:
        print(f"ERROR (Backend): Falta un campo requerido en la solicitud POST: {e}")
        return jsonify({'error': f'Falta un campo requerido: {e}'}), 400
    except Exception as e:
        # Captura cualquier otro error inesperado antes del commit
        print(f"ERROR (Backend): Un error inesperado ocurrió en save_password: {e}")
        return jsonify({'error': f'Error interno del servidor: {e}'}), 500
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
    # Eliminar la base de datos existente y crearla de nuevo si hay cambios en el modelo.
    # ¡CUIDADO! Esto eliminará todos tus usuarios y contraseñas.
    # Si quieres preservar los datos, investiga Flask-Migrate.
    # db.drop_all() # Descomentar para borrar y recrear la BD si el esquema cambia
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)