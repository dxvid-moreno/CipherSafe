import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1);
  const [userEmailForReset, setUserEmailForReset] = useState('');

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/forgot-password`, { email });
      setMessage(res.data.message || 'Solicitud enviada.');
      setUserEmailForReset(email);
      setStep(2);
    } catch (err) {
      console.error("Error al solicitar código:", err);
      setMessage(err.response?.data?.error || 'Error al solicitar restablecimiento. Intente de nuevo.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/reset-password`, {
        email: userEmailForReset,
        code: code,
        new_password: newPassword
      });
      setMessage(res.data.message || 'Contraseña restablecida con éxito.');
      setTimeout(() => {
        setMessage('');
        setStep(1);
        setEmail('');
        setCode('');
        setNewPassword('');
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error("Error al restablecer contraseña:", err);
      setMessage(err.response?.data?.error || 'Error al restablecer contraseña. Código inválido o expirado.');
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card shadow p-4" style={{ maxWidth: '450px', width: '100%' }}>
        <h3 className="card-title text-center mb-4">¿Olvidaste tu Contraseña?</h3>

        {step === 1 ? (
          <form onSubmit={handleRequestCode}>
            <p className="text-center text-muted">
              Ingresa tu correo electrónico para recibir un código de restablecimiento.
            </p>
            <input
              className="form-control mb-3"
              type="email"
              placeholder="Tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className="btn btn-primary w-100" type="submit">Enviar Código de Restablecimiento</button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <p className="text-center text-muted">
              Se ha enviado un código a **{userEmailForReset}**. Ingresa el código y tu nueva contraseña.
            </p>
            <input
              className="form-control mb-3 text-center"
              type="text"
              maxLength="6"
              placeholder="Código de 6 dígitos"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <input
              className="form-control mb-3"
              type="password"
              placeholder="Nueva Contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button className="btn btn-success w-100" type="submit">Restablecer Contraseña</button>
          </form>
        )}

        {message && <div className={`alert ${message.includes('éxito') || message.includes('enviado') ? 'alert-success' : 'alert-info'} mt-3`}>{message}</div>}
        <div className="text-center mt-3">
          <Link to="/login">Volver al Inicio de Sesión</Link>
        </div>
      </div>
    </div>
  );
}