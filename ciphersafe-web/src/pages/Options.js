import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Options() {
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showViewLogsModal, setShowViewLogsModal] = useState(false);
  const [logs, setLogs] = useState([]);
  const [viewLogs, setViewLogs] = useState([]);
  const [code, setCode] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const userId = localStorage.getItem('user_id');

  // Cargar el estado actual de 2FA al cargar la vista

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/get-2fa/${userId}`)
      .then(res => setTwoFAEnabled(res.data.enabled))
      .catch(() => setTwoFAEnabled(false));
  }, [userId]);

  // Manejar el cambio del estado de 2FA
  const handleToggle2FA = () => {
    axios.post(`${process.env.REACT_APP_API_URL}/toggle-2fa`, {
      user_id: userId,
      enabled: !twoFAEnabled
    })
      .then(() => setTwoFAEnabled(prev => !prev))
      .catch(() => alert('Error al cambiar el estado de 2FA'));
  };

  // Manejar el envío del código de cambio de contraseña
  const handleChangePassword = async () => {
    setMessage('');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/change-password-send-code`, { user_id: userId });
      setShowCodeModal(true);
    } catch {
      setMessage('Error al enviar el código');
    }
  };
  // Manejar la verificación del código ingresado
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/change-password-verify-code`, { user_id: userId, code });
      setShowCodeModal(false);
      setShowPasswordModal(true);
    } catch {
      setMessage('Código inválido o expirado');
    }
  };
  // Manejar el guardado de la nueva contraseña
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      return;
    }
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/change-password-final-step`, {
        user_id: userId,
        old_password: oldPassword,
        new_password: newPassword
      });
      setShowPasswordModal(false);
      setMessage('Contraseña cambiada exitosamente');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setMessage('Error al cambiar la contraseña');
    }
  };
  // Manejar la obtención de los registros de acceso
  const fetchLoginLogs = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/login-logs/${userId}`);
      setLogs(res.data);
      setShowLogsModal(true);
    } catch (err) {
      setMessage('Error al obtener los registros de inicio de sesión.');
    }
  };

  // Obtener logs de visualización de contraseñas
  const fetchPasswordViewLogs = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/password-view-logs/${userId}`);
      setViewLogs(res.data);
      setShowViewLogsModal(true);
    } catch (err) {
      setMessage('Error al obtener el historial de visualización de contraseñas.');
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Opciones de Seguridad</h2>
      <ul className="list-group shadow-sm mb-4">

        <li className="list-group-item d-flex justify-content-between align-items-center">
          <div>
            <strong>Cambiar contraseña</strong>
            <div className="text-muted small">Actualiza tu contraseña de acceso</div>
          </div>
          <button className="btn btn-outline-primary" onClick={handleChangePassword}>
            Cambiar
          </button>
        </li>

        <li className="list-group-item d-flex justify-content-between align-items-center">
          <div>
            <strong>Autenticación de dos pasos (2FA)</strong>
            <div className="text-muted small">Protección extra al iniciar sesión</div>
          </div>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="twoFA"
              checked={twoFAEnabled}
              onChange={handleToggle2FA}
            />
          </div>
        </li>
        <li className="list-group-item d-flex justify-content-between align-items-center">
          <div>
            <strong>Historial de inicios de sesión</strong>
            <div className="text-muted small">Ver registros de accesos recientes</div>
          </div>
          <button className="btn btn-outline-primary" onClick={fetchLoginLogs}>
            Ver
          </button>
        </li>
        <li className="list-group-item d-flex justify-content-between align-items-center">
          <div>
            <strong>Historial de actividad de contraseñas</strong>
            <div className="text-muted small">Ver cuándo y qué contraseñas se visualizaron</div>
          </div>
          <button className="btn btn-outline-primary" onClick={fetchPasswordViewLogs}>
            Ver
          </button>
        </li>
      </ul>

      {message && (
        <div className={`alert mt-3 ${message.toLowerCase().includes('error') ? 'alert-danger' : 'alert-info'}`}>
          {message}
        </div>
      )}

      {/* Modal de código de verificación */}
      {showCodeModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleVerifyCode}>
                <div className="modal-header">
                  <h5 className="modal-title">Verificación de Código</h5>
                  <button type="button" className="btn-close" onClick={() => setShowCodeModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p>Ingresa el código de 6 dígitos que enviamos a tu correo.</p>
                  <input
                    className="form-control"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCodeModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Verificar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cambio de contraseña */}
      {showPasswordModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleSavePassword}>
                <div className="modal-header">
                  <h5 className="modal-title">Cambiar Contraseña</h5>
                  <button type="button" className="btn-close" onClick={() => setShowPasswordModal(false)}></button>
                </div>
                <div className="modal-body">
                  <input
                    className="form-control mb-2"
                    type="password"
                    placeholder="Contraseña actual"
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    required
                  />
                  <input
                    className="form-control mb-2"
                    type="password"
                    placeholder="Nueva contraseña"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                  <input
                    className="form-control mb-2"
                    type="password"
                    placeholder="Confirmar nueva contraseña"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success">
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Modal de registros de acceso */}
      {showLogsModal && (
      <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Historial de Inicios de Sesión</h5>
              <button type="button" className="btn-close" onClick={() => setShowLogsModal(false)}></button>
            </div>
            <div className="modal-body">
              {logs.length === 0 ? (
                <p className="text-muted text-center">No hay registros disponibles.</p>
              ) : (
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Fecha y hora</th>
                      <th>IP</th>
                      <th>Ubicación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr key={index}>
                        <td>{log.timestamp}</td>
                        <td>{log.ip}</td>
                        <td>{log.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowLogsModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
      {/* Modal de registros de visualización de contraseñas */}
      {showViewLogsModal && (
  <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog modal-lg modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Historial de Visualización de Contraseñas</h5>
          <button type="button" className="btn-close" onClick={() => setShowViewLogsModal(false)}></button>
        </div>
        <div className="modal-body">
          {viewLogs.length === 0 ? (
            <p className="text-muted text-center">No hay registros disponibles.</p>
          ) : (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Fecha y hora</th>
                  <th>Etiqueta</th>
                </tr>
              </thead>
              <tbody>
                {viewLogs.map((log, index) => (
                  <tr key={index}>
                    <td>{log.viewed_at}</td>
                    <td>{log.tag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowViewLogsModal(false)}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
