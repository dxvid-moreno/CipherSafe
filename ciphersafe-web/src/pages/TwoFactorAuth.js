import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function TwoFactorAuth() {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const userId = localStorage.getItem('user_id_temp');

  useEffect(() => {
    if (!userId) {
      setMessage('No se encontró ID de usuario temporal. Por favor, inicie sesión de nuevo.');

    }
  }, [userId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!userId) {
      setMessage('Error: ID de usuario no disponible.');
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/verify-2fa`, {
        user_id: parseInt(userId),
        code: code
      });

      // Si la verificación es exitosa
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user_id', res.data.user_id);
        localStorage.removeItem('user_id_temp');
        setMessage(res.data.message || 'Verificación exitosa.');
        navigate('/generate');
      }
    } catch (err) {
      console.error("Error al verificar 2FA:", err);
      setMessage(err.response?.data?.error || 'Código inválido o expirado. Intente de nuevo.');
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card shadow p-4" style={{ maxWidth: '450px', width: '100%' }}>
        <h3 className="card-title text-center mb-4">Verificación de Dos Pasos</h3>
        <p className="text-center text-muted">
          Se ha enviado un código de verificación a tu correo electrónico.
          Por favor, ingrésalo a continuación para continuar.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            className="form-control mb-3 text-center"
            type="text"
            maxLength="6"
            placeholder="Ingresa el código de 6 dígitos"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <button className="btn btn-primary w-100" type="submit">Verificar Código</button>
        </form>
        {message && <div className={`alert ${message.includes('exitos') ? 'alert-success' : 'alert-info'} mt-3`}>{message}</div>}
      </div>
    </div>
  );
}