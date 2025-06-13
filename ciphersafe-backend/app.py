# ciphersafe-backend/app.py

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_mail import Mail, Message
from datetime import datetime, timedelta
import pyotp
import os
import base64 # Importa base64
from cryptography.fernet import Fernet # Importa Fernet para la encriptación
from dotenv import load_dotenv # Importa dotenv
from flask_cors import CORS # Importa CORS para habilitar CORS

# Cargar variables de entorno del archivo .env
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Configuración de la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configuración de Flask-Mail
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT'))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
mail = Mail(app)

# Imprimir la ruta de la base de datos al inicio
with app.app_context():
    engine = db.engine
    db_path = engine.url.database
    print(f"DEBUG: La base de datos está en: {db_path}")

# Genera una clave Fernet si no existe
FERNET_KEY = os.getenv('FERNET_KEY')
if FERNET_KEY is None:
    FERNET_KEY = Fernet.generate_key().decode()
    # print(f"Generated FERNET_KEY: {FERNET_KEY}") # Solo para depuración inicial
    # Considera guardar esta clave en un archivo .env o variable de entorno real
    # para no perderla entre reinicios del servidor.
    # Por ejemplo, puedes añadirla manualmente a tu .env después de la primera ejecución.
    # Esto es crucial, ya que si la clave cambia, las contraseñas encriptadas no se podrán desencriptar.
os.environ['FERNET_KEY'] = FERNET_KEY # Asegúrate de que esté en el entorno de Flask
cipher = Fernet(FERNET_KEY.encode())


# Modelos
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    otp_secret = db.Column(db.String(16)) # Secreto para el OTP
    otp_expiration = db.Column(db.DateTime) # Tiempo de expiración del OTP
    
    # Relación uno a muchos con PasswordEntry
    password_entries = db.relationship('PasswordEntry', backref='user', lazy=True)

class PasswordEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tag = db.Column(db.String(100), nullable=True)
    value = db.Column(db.String(500), nullable=False) # Valor encriptado
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)


# Rutas

# Ruta de registro (mantener como está)
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    # Genera un nuevo secreto OTP para el usuario
    otp_secret = base64.b32encode(os.urandom(10)).decode('utf-8') # 16 caracteres base32
    
    new_user = User(username=data['username'], email=data['email'], password=hashed_password, otp_secret=otp_secret)
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'Usuario registrado exitosamente. Por favor, inicia sesión.'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al registrar usuario: ' + str(e)}), 400

# Ruta de inicio de sesión (mantener como está)
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()

    if user and bcrypt.check_password_hash(user.password, data['password']):
        # Generar un nuevo OTP para 2FA y enviarlo por correo
        totp = pyotp.TOTP(user.otp_secret)
        otp_code = totp.now()
        
        # Guardar OTP y su expiración en la DB
        user.otp_expiration = datetime.now() + timedelta(minutes=5) # OTP válido por 5 minutos
        db.session.commit()

        msg = Message('Tu Código de Verificación para CipherSafe',
                      sender=app.config['MAIL_DEFAULT_SENDER'],
                      recipients=[user.email])
        msg.body = f"Tu código de verificación es: {otp_code}\nEste código expirará en 5 minutos."
        try:
            mail.send(msg)
            return jsonify({'message': 'Código OTP enviado a tu correo.', 'user_id': user.id}), 200
        except Exception as e:
            print(f"Error al enviar correo: {e}")
            return jsonify({'error': 'Error al enviar código OTP. Intenta de nuevo más tarde.'}), 500
    else:
        return jsonify({'error': 'Credenciales inválidas'}), 401

# Ruta de verificación de OTP (mantener como está)
@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    user_id = data.get('user_id')
    otp_code = data.get('otp_code')

    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'Usuario no encontrado.'}), 404

    # Verificar expiración del OTP
    if user.otp_expiration and datetime.now() > user.otp_expiration:
        return jsonify({'error': 'Código OTP expirado. Por favor, inicia sesión de nuevo.'}), 400

    # Verificar el código OTP
    totp = pyotp.TOTP(user.otp_secret)
    if totp.verify(otp_code, valid_window=1): # valid_window permite un pequeño desfase
        # Si el OTP es válido, limpiar el secreto y la expiración para seguridad
        user.otp_expiration = None
        db.session.commit()
        return jsonify({'message': 'Verificación de dos pasos exitosa', 'user_id': user.id}), 200
    else:
        return jsonify({'error': 'Código OTP inválido.'}), 400

# Ruta para guardar contraseña (mantener como está, solo la he añadido para referencia)
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

        entry = PasswordEntry(tag=tag, value=encrypted_pw, user_id=user_id)
        print(f"DEBUG (Backend): Objeto PasswordEntry creado: tag='{entry.tag}', value='{entry.value}', user_id={entry.user_id}")

        db.session.add(entry)
        print("DEBUG (Backend): Objeto añadido a la sesión de SQLAlchemy.")

        try:
            db.session.commit()
            print("DEBUG (Backend): ¡Commit de la sesión realizado exitosamente!")
            return jsonify({'message': 'Contraseña guardada exitosamente'}), 201
        except Exception as e:
            db.session.rollback() 
            print(f"ERROR (Backend): Fallo al realizar el commit en la base de datos: {e}")
            return jsonify({'error': f'Error al guardar la contraseña en la base de datos: {e}'}), 500

    except KeyError as e:
        print(f"ERROR (Backend): Falta un campo requerido en la solicitud POST: {e}")
        return jsonify({'error': f'Falta un campo requerido: {e}'}), 400
    except Exception as e:
        print(f"ERROR (Backend): Un error inesperado ocurrió en save_password: {e}")
        return jsonify({'error': f'Error interno del servidor: {e}'}), 500

# Ruta para obtener contraseñas (mantener como está)
@app.route('/get-passwords/<int:user_id>', methods=['GET'])
def get_passwords(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado.'}), 404

    passwords_data = []
    for entry in user.password_entries:
        try:
            # Asegúrate de que el valor sea un string base64 antes de decodificar y desencriptar
            decrypted_value = cipher.decrypt(entry.value.encode()).decode()
            passwords_data.append({
                'id': entry.id,
                'tag': entry.tag,
                'password': decrypted_value,
                'created_at': entry.created_at.strftime('%Y-%m-%d %H:%M:%S')
            })
        except Exception as e:
            print(f"Error al desencriptar contraseña {entry.id}: {e}")
            passwords_data.append({
                'id': entry.id,
                'tag': entry.tag,
                'password': '[Error de desencriptación]',
                'created_at': entry.created_at.strftime('%Y-%m-%d %H:%M:%S')
            })
    return jsonify(passwords_data), 200

# Rutas de exportación (mantener como están)
@app.route('/export/<int:user_id>/<string:format>', methods=['GET'])
def export_passwords(user_id, format):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado.'}), 404

    passwords_data = []
    for entry in user.password_entries:
        try:
            decrypted_value = cipher.decrypt(entry.value.encode()).decode()
            passwords_data.append({
                'id': entry.id,
                'tag': entry.tag,
                'password': decrypted_value,
                'created_at': entry.created_at.strftime('%Y-%m-%d %H:%M:%S')
            })
        except Exception as e:
            print(f"Error al desencriptar durante exportación {entry.id}: {e}")
            passwords_data.append({
                'id': entry.id,
                'tag': entry.tag,
                'password': '[Error de desencriptación]',
                'created_at': entry.created_at.strftime('%Y-%m-%d %H:%M:%S')
            })

    if format == 'csv':
        csv_output = "ID,Etiqueta,Contraseña,Fecha de Creación\n"
        for pw in passwords_data:
            csv_output += f"{pw['id']},{pw['tag']},{pw['password']},{pw['created_at']}\n"
        return csv_output, 200, {'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=passwords.csv'}
    elif format == 'pdf':
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet
        from io import BytesIO

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        story.append(Paragraph("Contraseñas Guardadas", styles['h1']))
        story.append(Spacer(1, 0.2 * 10))

        for pw in passwords_data:
            story.append(Paragraph(f"<b>Etiqueta:</b> {pw['tag']}", styles['Normal']))
            story.append(Paragraph(f"<b>Contraseña:</b> {pw['password']}", styles['Normal']))
            story.append(Paragraph(f"<b>Creada en:</b> {pw['created_at']}", styles['Normal']))
            story.append(Spacer(1, 0.1 * 10))
            story.append(Paragraph("-" * 50, styles['Normal'])) # Separador
            story.append(Spacer(1, 0.1 * 10))

        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue(), 200, {'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename=passwords.pdf'}
    else:
        return jsonify({'error': 'Formato de exportación no soportado.'}), 400


# NUEVAS RUTAS PARA "OLVIDÉ MI CONTRASEÑA"

@app.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    username_or_email = data.get('username_or_email')

    if not username_or_email:
        return jsonify({'error': 'Por favor, introduce tu nombre de usuario o correo electrónico.'}), 400

    user = User.query.filter((User.username == username_or_email) | (User.email == username_or_email)).first()

    if not user:
        # Por seguridad, no reveles si el usuario existe o no.
        # Envía un mensaje genérico de éxito si el correo sería enviado.
        print(f"DEBUG: Intento de recuperación de contraseña para usuario/email no encontrado: {username_or_email}")
        return jsonify({'message': 'Si tu cuenta existe, se ha enviado un código de recuperación a tu correo.'}), 200

    try:
        # Genera un nuevo OTP para recuperación de contraseña
        totp = pyotp.TOTP(user.otp_secret) # Usa el mismo otp_secret del usuario
        otp_code = totp.now()
        
        # Guarda el OTP de recuperación y su expiración en la DB (5 minutos)
        user.otp_expiration = datetime.now() + timedelta(minutes=5)
        db.session.commit()

        msg = Message('Tu Código de Recuperación de Contraseña para CipherSafe',
                      sender=app.config['MAIL_DEFAULT_SENDER'],
                      recipients=[user.email])
        msg.body = f"Hemos recibido una solicitud para restablecer tu contraseña. Tu código de recuperación es: {otp_code}\nEste código expirará en 5 minutos.\nSi no solicitaste esto, puedes ignorar este correo."
        
        mail.send(msg)
        print(f"DEBUG: OTP de recuperación enviado a {user.email} para user_id {user.id}")
        return jsonify({'message': 'Código de recuperación enviado a tu correo.', 'user_id': user.id}), 200
    except Exception as e:
        print(f"ERROR: Error al enviar correo de recuperación de contraseña: {e}")
        return jsonify({'error': 'Error al enviar el código de recuperación. Intenta de nuevo más tarde.'}), 500

@app.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    user_id = data.get('user_id')
    otp_code = data.get('otp_code')
    new_password = data.get('new_password')

    if not all([user_id, otp_code, new_password]):
        return jsonify({'error': 'Faltan campos requeridos.'}), 400

    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'Usuario no encontrado.'}), 404

    # Verificar expiración del OTP
    if user.otp_expiration and datetime.now() > user.otp_expiration:
        return jsonify({'error': 'Código OTP expirado o inválido. Por favor, solicita uno nuevo.'}), 400

    # Verificar el código OTP
    totp = pyotp.TOTP(user.otp_secret)
    if totp.verify(otp_code, valid_window=1): # valid_window=1 para un pequeño desfase
        try:
            # Encriptar la nueva contraseña y actualizar
            hashed_new_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
            user.password = hashed_new_password
            
            # Limpiar el OTP y su expiración después de un uso exitoso
            user.otp_secret = base64.b32encode(os.urandom(10)).decode('utf-8') # Generar uno nuevo por seguridad
            user.otp_expiration = None
            db.session.commit()
            print(f"DEBUG: Contraseña restablecida exitosamente para user_id {user.id}")
            return jsonify({'message': 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'}), 200
        except Exception as e:
            db.session.rollback()
            print(f"ERROR: Fallo al actualizar la contraseña en la base de datos: {e}")
            return jsonify({'error': f'Error al restablecer la contraseña: {e}'}), 500
    else:
        return jsonify({'error': 'Código OTP inválido.'}), 400


if __name__ == '__main__':
    with app.app_context():
        db.create_all() # Asegúrate de que las tablas estén creadas
    app.run(debug=True)