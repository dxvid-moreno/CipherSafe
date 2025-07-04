import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/login`, form);

      if (res.data.requires_2fa) {
        localStorage.setItem('user_id_temp', res.data.user_id);
        setMessage(res.data.message);
        navigate('/verify-2fa');
      } else {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user_id', res.data.user_id);
        setMessage(res.data.message);
        navigate('/generate');
      }
      // Si hubo warning, lo guardamos en localStorage
      if (res.data.show_warning) {
        localStorage.setItem('show_warning', 'true');
      }
    } catch (err) {
      console.error("Error en login:", err);
      setMessage(err.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h3 className="card-title text-center mb-4">Inicio de Sesión</h3>
        <form onSubmit={handleSubmit}>
          <input className="form-control mb-3" name="username" placeholder="Usuario" onChange={handleChange} />
          <input className="form-control mb-3" name="password" placeholder="Contraseña" type="password" onChange={handleChange} />
          <button className="btn btn-success w-100" type="submit">Ingresar</button>
        </form>
        {message && <div className="alert alert-info mt-3">{message}</div>}
        <div className="text-center mt-3">
          <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link> {/* Nuevo enlace */}
        </div>
      </div>
    </div>
  );
}