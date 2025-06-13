// ciphersafe-web/src/pages/SavedPasswords.js
import { useEffect, useState } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { useLocation } from 'react-router-dom'; // <--- Importa useLocation
import { useAuth } from '../context/AuthContext'; // <--- Importa useAuth para userId

export default function SavedPasswords() {
  const [passwords, setPasswords] = useState([]);
  const [error, setError] = useState('');
  const { userId } = useAuth(); // <--- Obtener userId del AuthContext
  const location = useLocation(); // <--- Inicializa useLocation

  // Un estado para forzar la recarga de contraseñas. Incrementarlo fuerza el useEffect.
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Función para obtener las contraseñas
  // (Eliminada porque no se utiliza)

  // Este useEffect se encarga de detectar si venimos de un guardado exitoso
  useEffect(() => {
    if (location.state?.refreshPasswords) {
      // Limpiar el estado de navegación para evitar recargas infinitas o innecesarias
      // Esto modifica la entrada actual del historial, no añade una nueva.
      window.history.replaceState({}, document.title, window.location.pathname);
      setRefreshTrigger(prev => prev + 1); // Forzar que el otro useEffect se ejecute
    }
  }, [location.state]); // Depende de los cambios en el estado de la ruta

  // Este useEffect se encarga de llamar a fetchPasswords cuando sea necesario
  // Se ejecuta en el montaje inicial, cuando userId cambia, o cuando refreshTrigger cambia
  useEffect(() => {
    const fetchPasswords = async () => {
      try {
        if (!userId) {
          setError('No hay usuario autenticado.');
          setPasswords([]); // Limpiar contraseñas si no hay usuario
          return;
        }

        // Corregí las comillas para usar backticks para template literals
        const url = `http://localhost:5000/get-passwords/${userId}`; 
        const res = await axios.get(url);
        setPasswords(res.data);
        setError(''); // Limpiar errores si la carga es exitosa
      } catch (err) {
        console.error("Error al obtener contraseñas:", err);
        setError(err.response?.data?.error || 'No se pudieron cargar las contraseñas');
      }
    };
    fetchPasswords();
  }, [userId, refreshTrigger]); // <--- Añade refreshTrigger como dependencia

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
      {/* Opcional: Un botón para refrescar manualmente si el usuario lo desea */}
      <button className="btn btn-outline-secondary ms-2" onClick={() => setRefreshTrigger(prev => prev + 1)}>Refrescar Contraseñas</button>


      <ul className="list-group mt-4">
        {passwords.length === 0 ? (
          <li className="list-group-item text-center text-muted">No hay contraseñas guardadas.</li>
        ) : (
          passwords.map((pw) => (
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
          ))
        )}
      </ul>
    </div>
  );
}