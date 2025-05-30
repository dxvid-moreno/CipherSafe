import { useEffect, useState } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

export default function SavedPasswords() {
  const [passwords, setPasswords] = useState([]);
  const [error, setError] = useState('');
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchPasswords = async () => {
      try {
        if (!userId) {
          setError('No hay usuario autenticado.');
          return;
        }

        const url = `http://localhost:5000/get-passwords/${userId}`;
        const res = await axios.get(url);
        setPasswords(res.data);
      } catch (err) {
        console.error("Error al obtener contraseñas:", err);
        setError(err.response?.data?.error || 'No se pudieron cargar las contraseñas');
      }
    };

    fetchPasswords();
  }, [userId]);

  const exportPasswords = async (format) => {
    try {
      const res = await axios.get(`http://localhost:5000/export/${userId}/${format}`, {
        responseType: format === 'pdf' ? 'blob' : 'text'
      });

      const blob = new Blob(
        [res.data],
        { type: format === 'pdf' ? 'application/pdf' : 'text/csv' }
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contraseñas.${format}`;
      link.click();
    } catch (err) {
      console.error(`Error al exportar ${format}:`, err);
      alert('Error al exportar contraseñas');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Contraseñas Guardadas</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <button className="btn btn-outline-primary me-2" onClick={() => exportPasswords('csv')}>Exportar CSV</button>
      <button className="btn btn-outline-danger" onClick={() => exportPasswords('pdf')}>Exportar PDF</button>

      <ul className="list-group mt-4">
        {passwords.map((pw) => (
          <li key={pw.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{pw.tag || '(sin etiqueta)'}</strong><br />
              <small>{pw.created_at}</small><br />
              <span>{pw.password}</span>
            </div>
            <div>
              <QRCodeSVG value={pw.password} size={64} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
