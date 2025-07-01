from flask import Flask, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from cryptography.fernet import Fernet
from datetime import datetime, timedelta, timezone
import qrcode
import io
import csv
from fpdf import FPDF
import base64
import os
import random
import string
import smtplib
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Cargar variables de entorno al inicio
load_dotenv()

app = Flask(__name__)
# Cors es para manejar el backen en varios dispositivos
CORS(app)

# Configuración de la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Instanciar DB
db = SQLAlchemy(app)
# Funcionalidad para encriptar contraseñas
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

# Configuración de Flask-Mail (usando variables de entorno)
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')

#Modelos de las tablas de la base da datos
# Usuario
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    passwords = db.relationship('PasswordEntry', backref='user', lazy=True)
    twofa_code = db.Column(db.String(6), nullable=True)
    twofa_code_expires_at = db.Column(db.DateTime, nullable=True)
    reset_tokens = db.relationship('PasswordResetToken', backref='user', lazy=True, cascade="all, delete-orphan")
    two_factor_enabled = db.Column(db.Boolean, default=True)
    login_history = db.relationship('LoginHistory', backref='user', lazy=True)
    failed_login_attempts = db.Column(db.Integer, default=0)
    last_failed_login = db.Column(db.DateTime, nullable=True)
# Entrada de contraseña
class PasswordEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tag = db.Column(db.String(100))
    value = db.Column(db.String(300), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
# Token de restablecimiento de contraseña
class PasswordResetToken(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    token = db.Column(db.String(6), unique=True, nullable=False) # Código de 6 dígitos
    expires_at = db.Column(db.DateTime(timezone=True), nullable=False)
# Registro de inicio de sesión
class LoginHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    ip_address = db.Column(db.String(100), nullable=True)
    location = db.Column(db.String(255), nullable=True)


#Funciones Auxiliares para Correo
def generate_code(length=6):
    return ''.join(random.choices('0123456789', k=length))

def send_email(recipient_email, subject, body):
    sender_email = app.config['MAIL_DEFAULT_SENDER']
    sender_password = app.config['MAIL_PASSWORD']

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = recipient_email
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'plain'))

    try:
        with smtplib.SMTP(app.config['MAIL_SERVER'], app.config['MAIL_PORT']) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, recipient_email, msg.as_string())
        print(f"Correo enviado a {recipient_email} con asunto: {subject}")
        return True
    except Exception as e:
        print(f"Error al enviar correo a {recipient_email}: {e}")
        return False
# Función para obtener la ubicación a partir de la dirección IP
def get_location_from_ip(ip):
    try:
        if ip == "127.0.0.1":
            return "Localhost"
        response = requests.get(f"https://ipapi.co/{ip}/json/")
        if response.status_code == 200:
            data = response.json()
            return f"{data.get('city', '')}, {data.get('region', '')}, {data.get('country_name', '')}"
    except Exception as e:
        print("Error obteniendo ubicación:", e)
    return "Ubicación desconocida"

#Rutas
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'error': 'Todos los campos son requeridos'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'El nombre de usuario ya existe'}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'El correo electrónico ya está registrado'}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'Usuario registrado correctamente'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if not user or not bcrypt.check_password_hash(user.password, password):
        # Registrar intento fallido
        if user:
            user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
            user.last_failed_login = datetime.utcnow()
            db.session.commit()
        return jsonify({'error': 'Credenciales inválidas'}), 401

    # Si el login es exitoso, revisa si hubo 5 o más intentos fallidos
    show_warning = False
    if user.failed_login_attempts and user.failed_login_attempts >= 5:
        show_warning = True

    # Resetear contador de intentos fallidos
    user.failed_login_attempts = 0
    user.last_failed_login = None
    db.session.commit()

    # Obtener ubicación usando la API
    ip_address = request.remote_addr or '127.0.0.1'
    location = get_location_from_ip(ip_address)
    # Registrar el inicio de sesión
    log = LoginHistory(user_id=user.id, ip_address=ip_address, location=location)
    db.session.add(log)
    db.session.commit()

    if user.two_factor_enabled:
        # Generar y enviar código 2FA
        code = generate_code()
        user.twofa_code = code
        user.twofa_code_expires_at = datetime.utcnow() + timedelta(minutes=5)
        db.session.commit()

        subject = "Tu Código de Verificación CipherSafe"
        body = f"""
        Hola,

        Tu código de verificación para acceder a CipherSafe es: {code}
        Este código expirará en 5 minutos.

        Saludos,
        Equipo CipherSafe
        """
        send_email(user.email, subject, body)

        return jsonify({
            'message': '2FA requerido',
            'user_id': user.id,
            'requires_2fa': True,
            'show_warning': show_warning
        }), 200
    else:
        return jsonify({
            'message': 'Inicio de sesión exitoso',
            'user_id': user.id,
            'requires_2fa': False,
            'show_warning': show_warning
        }), 200

# Ruta para recuperacion de contraseña
@app.route('/verify-2fa', methods=['POST'])
def verify_2fa():
    data = request.get_json()
    user_id = data.get('user_id')
    code = data.get('code')

    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    # Verificar el código y la expiración
    if user.twofa_code and user.twofa_code == code and \
       user.twofa_code_expires_at and datetime.utcnow() < user.twofa_code_expires_at:
        # Limpiar el código después de usarlo
        user.twofa_code = None
        user.twofa_code_expires_at = None
        db.session.commit()
        # Revisar si hubo warning
        show_warning = False
        if user.failed_login_attempts and user.failed_login_attempts >= 5:
            show_warning = True
        user.failed_login_attempts = 0
        user.last_failed_login = None
        db.session.commit()
        return jsonify({
            'message': 'Verificación 2FA exitosa',
            'user_id': user.id,
            'token': 'dummy-token' # Puedes generar un token JWT real aquí si lo deseas
        }), 200
    else:
        return jsonify({'error': 'Código 2FA inválido o expirado'}), 401

@app.route('/forgot-password', methods=['POST'])
def forgot_password_request():
    data = request.get_json()
    email = data.get('email')

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.'}), 200

    # Limpiar tokens anteriores para este usuario
    PasswordResetToken.query.filter_by(user_id=user.id).delete()
    db.session.commit()

    reset_code = generate_code()
    expires_at = datetime.utcnow() + timedelta(minutes=15) # Token válido por 15 minutos
    new_token = PasswordResetToken(user_id=user.id, token=reset_code, expires_at=expires_at)
    db.session.add(new_token)
    db.session.commit()

    subject = "Restablecimiento de Contraseña CipherSafe"
    body = f"""
    Hola {user.username},

    Hemos recibido una solicitud para restablecer la contraseña de tu cuenta CipherSafe.
    Tu código de restablecimiento es:

    {reset_code}

    Este código expirará en 15 minutos. Si no solicitaste este restablecimiento, puedes ignorar este correo.

    Saludos,
    Equipo CipherSafe
    """
    if send_email(user.email, subject, body):
        return jsonify({'message': 'Se ha enviado un código de restablecimiento a tu correo electrónico.', 'email': email}), 200
    else:
        return jsonify({'error': 'Error al enviar el correo de restablecimiento. Intenta de nuevo más tarde.'}), 500


@app.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')
    new_password = data.get('new_password')

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'Usuario no encontrado.'}), 404

    # Buscar el token de restablecimiento más reciente y válido
    reset_token = PasswordResetToken.query.filter_by(user_id=user.id, token=code) \
        .filter(PasswordResetToken.expires_at > datetime.utcnow()) \
        .first()

    if not reset_token:
        return jsonify({'error': 'Código de restablecimiento inválido o expirado.'}), 401

    user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    db.session.delete(reset_token)
    db.session.commit()

    return jsonify({'message': 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión.'}), 200


@app.route('/save-password', methods=['POST'])
def save_password():
    data = request.get_json()
    user_id = data.get('user_id')
    password_value = data.get('password')
    tag = data.get('tag', '')

    if not user_id or not password_value:
        return jsonify({'error': 'Usuario y contraseña son requeridos'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    encrypted_pw = cipher.encrypt(password_value.encode()).decode()
    entry = PasswordEntry(tag=tag, value=encrypted_pw, user_id=user_id)
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



# Ruta para cambiar la contraseña
@app.route('/change-password-send-code', methods=['POST'])
def change_password_send_code():
    data = request.get_json()
    user_id = data.get('user_id')
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    code = generate_code()
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    # Eliminar códigos previos
    PasswordResetToken.query.filter_by(user_id=user.id).delete()

    token = PasswordResetToken(user_id=user.id, token=code, expires_at=expires_at)
    db.session.add(token)
    db.session.commit()

    subject = "Código de verificación para cambiar contraseña"
    body = f"Tu código es: {code}. Expira en 10 minutos."
    if send_email(user.email, subject, body):
        return jsonify({'message': 'Código enviado correctamente'}), 200
    else:
        return jsonify({'error': 'Error al enviar el código'}), 500

@app.route('/change-password-verify-code', methods=['POST'])
def change_password_verify_code():
    data = request.get_json()
    user_id = data.get('user_id')
    code = data.get('code')

    token_entry = PasswordResetToken.query.filter_by(user_id=user_id, token=code).first()
    if not token_entry:
        return jsonify({'error': 'Código inválido'}), 400
    if token_entry.expires_at < datetime.utcnow():
        db.session.delete(token_entry)
        db.session.commit()
        return jsonify({'error': 'Código expirado'}), 400

    db.session.delete(token_entry)
    db.session.commit()
    return jsonify({'message': 'Código verificado correctamente'}), 200

@app.route('/change-password-final-step', methods=['POST'])
def change_password_final_step():
    data = request.get_json()
    user_id = data.get('user_id')
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    if not bcrypt.check_password_hash(user.password, old_password):
        return jsonify({'error': 'La contraseña actual es incorrecta'}), 400

    user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    db.session.commit()
    return jsonify({'message': 'Contraseña cambiada exitosamente'}), 200

# Ruta para activar/desactivar 2FA
@app.route('/toggle-2fa', methods=['POST'])
def toggle_2fa():
    data = request.get_json()
    user_id = data.get('user_id')
    enabled = data.get('enabled', False)

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    user.two_factor_enabled = enabled
    db.session.commit()
    return jsonify({'message': '2FA actualizado correctamente'})

@app.route('/get-2fa/<int:user_id>', methods=['GET'])
def get_2fa_status(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    return jsonify({'enabled': user.two_factor_enabled})

# Ruta para obtener el código QR de una contraseña
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
        out.write(pdf.output(dest='S').encode('latin-1'))
        out.seek(0)
        return send_file(out, download_name="passwords.pdf", as_attachment=True)

    return jsonify({'error': 'Formato no válido'}), 400

@app.route('/delete-password/<int:password_id>', methods=['DELETE'])
def delete_password(password_id):
    entry = PasswordEntry.query.get(password_id)
    if not entry:
        return jsonify({'error': 'Entrada no encontrada'}), 404

    db.session.delete(entry)
    db.session.commit()
    return jsonify({'message': 'Contraseña eliminada correctamente'}), 200

@app.route('/update-password/<int:password_id>', methods=['PUT'])
def update_password(password_id):
    data = request.get_json()
    new_tag = data.get('tag')
    new_password_value = data.get('password')

    entry = PasswordEntry.query.get(password_id)
    if not entry:
        return jsonify({'error': 'Contraseña no encontrada'}), 404

    # Actualizar la etiqueta si se proporciona
    if new_tag is not None:
        entry.tag = new_tag

    # Actualizar la contraseña si se proporciona
    if new_password_value:
        encrypted_pw = cipher.encrypt(new_password_value.encode()).decode()
        entry.value = encrypted_pw
    
    db.session.commit()
    return jsonify({'message': 'Contraseña actualizada exitosamente'}), 200

# Ruta para obtener los registros de inicio de sesión de un usuario
@app.route('/login-logs/<int:user_id>', methods=['GET'])
def get_login_logs(user_id):
    logs = LoginHistory.query.filter_by(user_id=user_id).order_by(LoginHistory.timestamp.desc()).all()
    result = []
    for log in logs:
        result.append({
            'timestamp': log.timestamp.strftime('%Y-%m-%d %H:%M'),
            'ip': log.ip_address,
            'location': log.location
        })
    return jsonify(result)



# Inicializa base de datos si no existe
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)