// ciphersafe-web/src/pages/OTPVerification.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';
import { useAuth } from '../context/AuthContext'; // Importar useAuth

export default function OTPVerification() {
  const [otpCode, setOtpCode] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState(null);
  const { login } = useAuth(); // Usar el hook useAuth

  useEffect(() => {
    if (location.state && location.state.userId) {
      setUserId(location.state.userId);
    } else {
      setMessage('No se encontró ID de usuario para la verificación OTP. Por favor, inicia sesión de nuevo.');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [location.state, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!userId) {
      setMessage('Error: ID de usuario no disponible.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/verify-otp', {
        user_id: userId,
        otp_code: otpCode
      });
      
      // Si la verificación es exitosa, llama a la función login del contexto
      login(res.data.user_id); // Esto guarda user_id en localStorage y actualiza el estado global
      setMessage(res.data.message);
      navigate('/generate'); // Redirigir a la página de generación de contraseñas
      
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error al verificar el código OTP.');
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
        <h2 className='text-center mb-4 fw-bold'>Verificación de Código</h2>
        <p className="text-center">Se ha enviado un código de 6 dígitos a tu correo electrónico registrado.</p>
        <form onSubmit={handleSubmit}>
          <input
            className="form-control my-2 text-center"
            name="otpCode"
            placeholder="Introduce el código OTP"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            maxLength="6"
            required
          />
          <div className="text-center">
            <button className="btn btn-primary" type="submit">Verificar</button>
          </div>
        </form>
        {message && <div className="alert alert-info mt-3">{message}</div>}
      </div>
    </div>
  );
}