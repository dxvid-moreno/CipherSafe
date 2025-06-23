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

        const url = `${process.env.REACT_APP_API_URL}/get-passwords/${userId}`;
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
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/export/${userId}/${format}`, {
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

  const deletePassword = async (id) => {
  if (!window.confirm("¿Estás seguro de eliminar esta contraseña?")) return;

  try {
    await axios.delete(`${process.env.REACT_APP_API_URL}/delete-password/${id}`);
    setPasswords(passwords.filter(p => p.id !== id));
  } catch (err) {
    console.error("Error al eliminar contraseña:", err);
    alert("No se pudo eliminar la contraseña");
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
            <div className="d-flex flex-column align-items-end">
              <QRCodeSVG value={pw.password} size={64} />
              <button 
                className="btn btn-sm btn-danger mt-2"
                onClick={() => deletePassword(pw.id)}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
