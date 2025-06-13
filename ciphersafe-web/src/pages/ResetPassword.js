// ciphersafe-web/src/pages/ResetPassword.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css'; // Reutilizar el CSS de Login

export default function ResetPassword() {
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Obtener userId del estado de la navegación (viene de ForgotPassword.js)
    if (location.state && location.state.userId) {
      setUserId(location.state.userId);
    } else {
      setMessage('No se encontró ID de usuario para restablecer la contraseña. Por favor, regresa al formulario de recuperación.');
      setTimeout(() => navigate('/forgot-password'), 3000); // Redirigir si no hay userId
    }
  }, [location.state, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Limpiar mensajes anteriores

    if (!userId) {
      setMessage('Error: ID de usuario no disponible.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Las contraseñas no coinciden.');
      return;
    }
    
    // Aquí puedes añadir validación de complejidad de contraseña si quieres
    // if (newPassword.length < 8) {
    //   setMessage('La contraseña debe tener al menos 8 caracteres.');
    //   return;
    // }

    try {
      const res = await axios.post('http://localhost:5000/reset-password', {
        user_id: userId,
        otp_code: otpCode,
        new_password: newPassword
      });
      setMessage(res.data.message);
      // Si el restablecimiento es exitoso, redirigir al login
      setTimeout(() => navigate('/login'), 3000); 
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error al restablecer la contraseña.');
    }
  };

  if (userId === null) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="card shadow p-4 login-card text-center">
          <p>{message || "Cargando..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4 login-card">
        <h2 className='text-center mb-4 fw-bold'>Restablecer Contraseña</h2>
        <p className="text-center text-muted">Introduce el código de verificación y tu nueva contraseña.</p>
        <form onSubmit={handleSubmit}>
          <input
            className="form-control my-2 text-center"
            name="otpCode"
            placeholder="Código de Verificación (OTP)"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            maxLength="6"
            required
          />
          <input
            className="form-control my-2"
            name="newPassword"
            placeholder="Nueva Contraseña"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            className="form-control my-2"
            name="confirmPassword"
            placeholder="Confirmar Nueva Contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <div className="text-center">
            <button className="btn btn-primary" type="submit">Restablecer Contraseña</button>
          </div>
        </form>
        {message && <div className="alert alert-info mt-3">{message}</div>}
      </div>
    </div>
  );
}