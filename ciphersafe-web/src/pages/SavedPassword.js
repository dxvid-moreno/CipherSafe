import { useEffect, useState } from 'react';
import axios from 'axios';

export default function SavedPasswords() {
  const [passwords, setPasswords] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPasswords = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
          setError('No hay usuario autenticado.');
          return;
        }

        const res = await axios.get(`http://localhost:5000/get-passwords/${userId}`);
        setPasswords(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || 'No se pudieron cargar las contraseñas');
      }
    };

    fetchPasswords();
  }, []);



  return (
    <div className="container mt-5">
      <h2>Contraseñas Guardadas</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <ul className="list-group">
        {passwords.map((pw) => (
          <li key={pw.id} className="list-group-item d-flex justify-content-between">
            <div>
              <strong>Etiqueta:</strong> {pw.tag || '(sin etiqueta)'}<br />
              <small>Creada: {pw.created_at}</small>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
