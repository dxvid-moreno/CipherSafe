import { useEffect, useState } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

export default function SavedPasswords() {
  const [passwords, setPasswords] = useState([]);
  const [error, setError] = useState('');
  const userId = localStorage.getItem('user_id');
  const [editingPassword, setEditingPassword] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState({});

  // Función para obtener las contraseñas
  const fetchPasswords = async () => {
    try {
      if (!userId) {
        setError('No hay usuario autenticado.');
        return;
      }
      const url = `${process.env.REACT_APP_API_URL}/get-passwords/${userId}`;
      const res = await axios.get(url);
      setPasswords(res.data);
      setError('');
    } catch (err) {
      console.error("Error al obtener contraseñas:", err);
      setError(err.response?.data?.error || 'No se pudieron cargar las contraseñas');
    }
  };

  useEffect(() => {
    const fetchPasswordsEffect = async () => {
      try {
        if (!userId) {
          setError('No hay usuario autenticado.');
          return;
        }
        const url = `${process.env.REACT_APP_API_URL}/get-passwords/${userId}`;
        const res = await axios.get(url);
        setPasswords(res.data);
        setError('');
      } catch (err) {
        console.error("Error al obtener contraseñas:", err);
        setError(err.response?.data?.error || 'No se pudieron cargar las contraseñas');
      }
    };
    fetchPasswordsEffect();
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

  const handleEditClick = (passwordEntry) => {
    setEditingPassword(passwordEntry);
    setNewTag(passwordEntry.tag);
    setNewPasswordValue(passwordEntry.password);
    setEditMessage('');
  };

  const handleUpdatePassword = async () => {
    if (!editingPassword || (!newTag && !newPasswordValue)) {
      setEditMessage('Ingresa al menos un valor para actualizar.');
      return;
    }

    try {
      const res = await axios.put(`${process.env.REACT_APP_API_URL}/update-password/${editingPassword.id}`, {
        tag: newTag,
        password: newPasswordValue
      });
      setEditMessage(res.data.message || 'Contraseña actualizada.');
      fetchPasswords();
      setEditingPassword(null);
    } catch (err) {
      console.error("Error al actualizar contraseña:", err);
      setEditMessage(err.response?.data?.error || 'Error al actualizar la contraseña.');
    }
  };

  const handleCloseEditModal = () => {
    setEditingPassword(null);
    setEditMessage('');
  };


  return (
    <div className="container mt-5">
      <h2>Contraseñas Guardadas</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <button className="btn btn-outline-primary me-2" onClick={() => exportPasswords('csv')}>Exportar CSV</button>
      <button className="btn btn-outline-danger" onClick={() => exportPasswords('pdf')}>Exportar PDF</button>

<ul className="list-group mt-4">
  {passwords.length === 0 && !error ? (
    <li className="list-group-item text-center text-muted">No tienes contraseñas guardadas.</li>
  ) : (
    passwords.map((pw) => {
      const visible = !!visiblePasswords[pw.id];
      return (
        <li key={pw.id} className="list-group-item d-flex justify-content-between align-items-center">
          <div>
            <strong>{pw.tag || '(sin etiqueta)'}</strong><br />
            <small>{pw.created_at}</small><br />
            <div className="d-flex align-items-center">
            <input
              type={visible ? 'text' : 'password'}
              readOnly
              value={pw.password}
              className="form-control me-2"
              style={{ width: 'auto' }}
            />
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() =>
                setVisiblePasswords((prev) => ({
                  ...prev,
                  [pw.id]: !prev[pw.id],
                }))
              }
              title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              <i className={`fas ${visible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
          </div>
          <div className="d-flex flex-column align-items-end">
            <QRCodeSVG value={pw.password} size={64} />
            <div className="mt-2">
              <button
                className="btn btn-sm btn-info me-2"
                onClick={() => handleEditClick(pw)}
              >
                Editar
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => deletePassword(pw.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        </li>
      );
    })
  )}
</ul>


      {editingPassword && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Contraseña: {editingPassword.tag || '(sin etiqueta)'}</h5>
                <button type="button" className="btn-close" onClick={handleCloseEditModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="editTag" className="form-label">Etiqueta</label>
                  <input
                    type="text"
                    className="form-control"
                    id="editTag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Nueva etiqueta"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="editPassword" className="form-label">Contraseña</label>
                  <input
                    type="text"
                    className="form-control"
                    id="editPassword"
                    value={newPasswordValue}
                    onChange={(e) => setNewPasswordValue(e.target.value)}
                    placeholder="Nueva contraseña"
                  />
                </div>
                {editMessage && <div className="alert alert-info mt-3">{editMessage}</div>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseEditModal}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={handleUpdatePassword}>Guardar Cambios</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}