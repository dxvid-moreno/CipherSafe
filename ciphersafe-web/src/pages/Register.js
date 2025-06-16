import { useState } from 'react';
import axios from 'axios';

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
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h3 className="card-title text-center mb-4">Registro</h3>
        <form onSubmit={handleSubmit}>
          <input className="form-control mb-3" name="username" placeholder="Usuario" onChange={handleChange} />
          <input className="form-control mb-3" name="email" placeholder="Correo" type="email" onChange={handleChange} />
          <input className="form-control mb-3" name="password" placeholder="Contraseña" type="password" onChange={handleChange} />
          <button className="btn btn-primary w-100" type="submit">Registrarse</button>
        </form>
        {message && <div className="alert alert-info mt-3">{message}</div>}
      </div>
    </div>
  );
}

