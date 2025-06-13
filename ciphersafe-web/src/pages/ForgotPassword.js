// ciphersafe-web/src/pages/ForgotPassword.js
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Reutilizar el CSS de Login

export default function ForgotPassword() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Limpiar mensajes anteriores
    try {
      const res = await axios.post('http://localhost:5000/forgot-password', {
        username_or_email: usernameOrEmail
      });
      setMessage(res.data.message);
      // Si el backend devuelve un user_id (incluso si el usuario no existe para el mensaje genérico),
      // lo usamos para la siguiente pantalla.
      if (res.data.user_id) {
        navigate('/reset-password', { state: { userId: res.data.user_id } });
      } else {
        // Si no hay user_id (significa que el usuario no existe o es un mensaje genérico)
        // Puedes redirigir al login o mantener al usuario aquí.
        // Aquí optamos por mantener el mensaje y no redirigir automáticamente
        // para dar tiempo al usuario de leer el mensaje genérico.
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error al solicitar el código de recuperación.');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4 login-card">
        <h2 className='text-center mb-4 fw-bold'>Recuperar Contraseña</h2>
        <p className="text-center text-muted">Introduce tu nombre de usuario o correo electrónico para recibir un código de recuperación.</p>
        <form onSubmit={handleSubmit}>
          <input
            className="form-control my-2"
            name="usernameOrEmail"
            placeholder="Usuario o Correo Electrónico"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            required
          />
          <div className="text-center">
            <button className="btn btn-primary" type="submit">Enviar Código de Recuperación</button>
          </div>
        </form>
        {message && <div className="alert alert-info mt-3">{message}</div>}
      </div>
    </div>
  );
}