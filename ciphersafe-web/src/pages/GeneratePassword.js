import { useState } from 'react';
import axios from 'axios';

export default function GeneratePassword() {
  const [password, setPassword] = useState('');
  const [tag, setTag] = useState('');
  const [message, setMessage] = useState('');

  const generate = () => {
    const length = 12;
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
    setMessage('');
  };

  const savePassword = async () => {
    const user_id = localStorage.getItem('user_id');

    if (!password || !user_id) {
      setMessage('⚠️ Genera una contraseña y asegúrate de haber iniciado sesión');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/save-password', {
        user_id: parseInt(user_id),
        password,
        tag
      });

      setMessage(res.data.message || 'Contraseña guardada');
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || 'Error al guardar');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Generar Contraseña</h2>
      <button className="btn btn-secondary mb-3" onClick={generate}>
        Generar Contraseña Segura
      </button>
      <div className="form-group">
        <input className="form-control mb-2" value={password} readOnly />
        <input
          className="form-control mb-2"
          placeholder="Etiqueta (opcional)"
          onChange={e => setTag(e.target.value)}
        />
        <button className="btn btn-success" onClick={savePassword}>
          Guardar Contraseña
        </button>
      </div>
      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
}
