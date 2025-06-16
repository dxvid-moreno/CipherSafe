import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user_id', res.data.user_id); // <- AGREGADO
      setMessage(res.data.message);
      navigate('/generate');
    } catch (err) {
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
    </div>
  </div>
);

}
