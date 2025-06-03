import { useState } from 'react';
import axios from 'axios';
import './Login.css';// Importamos la hoja de estilos que esta en la misma carpeta

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/register', form);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error en el registro');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4 login-card">
        <h2 className='text-center mb-4 fw-bold'>Registro</h2>
        <form onSubmit={handleSubmit}>
          <input className="form-control my-2" name="username" placeholder="Usuario" onChange={handleChange} />
          <input className="form-control my-2" name="email" placeholder="Correo" type="email" onChange={handleChange} />
          <input className="form-control my-2" name="password" placeholder="Contraseña" type="password" onChange={handleChange} />
          <div className='text-center'>
            <button className="btn btn-primary" type="submit">Registrarse</button>
          </div>
          
        </form>
        {message && <div className="alert alert-info mt-3">{message}</div>}
      </div>
    </div>

  );
}

