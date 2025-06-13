// ciphersafe-web/src/pages/Login.js
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // <--- Añade Link
import './Login.css';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/login', form);
      setMessage(res.data.message);
      navigate('/verify-otp', { state: { userId: res.data.user_id } });

    } catch (err) {
      setMessage(err.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4 login-card">
        <h2 className='text-center mb-4 fw-bold'>Inicio de Sesión</h2>
        <form onSubmit={handleSubmit}>
          <input className="form-control my-2" name="username" placeholder="Usuario" onChange={handleChange} />
          <input className="form-control my-2" name="password" placeholder="Contraseña" type="password" onChange={handleChange} />
          <div className='text-center'>
            <button className="btn btn-primary" type="submit">Ingresar</button>
          </div>
          
        </form>
        {message && <div className="alert alert-info mt-3">{message}</div>}
        <div className="text-center mt-3">
          <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link> {/* <--- AÑADE ESTE ENLACE */}
        </div>
      </div>
    </div>
  );
}