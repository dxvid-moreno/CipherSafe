import React, { useEffect } from 'react';
import { useState, useRef } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import Swal from 'sweetalert2';

export default function GeneratePassword() {
  const [password, setPassword] = useState('');
  const [tag, setTag] = useState('');
  const [message, setMessage] = useState('');
  const passwordRef = useRef(null);

  useEffect(() => {
    // Mostrar advertencia si existe el flag
    if (localStorage.getItem('show_warning') === 'true') {
      Swal.fire({
        icon: 'warning',
        title: '¡Alerta de Seguridad!',
        html: 'Se detectaron <b>5 o más intentos fallidos</b> de inicio de sesión en tu cuenta.<br>Te recomendamos <b>cambiar tu contraseña</b> en las opciones de seguridad.',
        showConfirmButton: false,
        showCloseButton: true,
        allowOutsideClick: false,
        allowEscapeKey: true,
      });
      // Elimina el flag para que no vuelva a aparecer hasta el próximo caso
      localStorage.removeItem('show_warning');
    }
  }, []);

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

  const copyToClipboard = () => {
    if (passwordRef.current) {
      passwordRef.current.select();
      document.execCommand('copy');
      setMessage('🔒 Contraseña copiada al portapapeles');
    }
  };

  const savePassword = async () => {
    const user_id = localStorage.getItem('user_id');
    if (!password || !user_id) {
      setMessage('⚠️ Genera una contraseña y asegúrate de haber iniciado sesión');
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/save-password`, {
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
      <h2 className="mb-4">Generar Contraseña</h2>

      <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Formulario a la izquierda */}
        <div style={{ flex: 1, minWidth: '280px' }}>
          <button className="btn btn-secondary mb-3" onClick={generate}>
            Generar Contraseña Segura
          </button>

          <input
            className="form-control mb-2"
            value={password}
            ref={passwordRef}
            readOnly
          />
          <input
            className="form-control mb-2"
            placeholder="Etiqueta (opcional)"
            onChange={e => setTag(e.target.value)}
          />
          <button className="btn btn-outline-primary mb-2" onClick={copyToClipboard}>
            Copiar Contraseña
          </button>
          <button className="btn btn-success mb-2 ms-3" onClick={savePassword}>
            Guardar Contraseña
          </button>

          {message && <div className="alert alert-info mt-3">{message}</div>}
        </div>

        {/* QR a la derecha */}
        <div style={{ flex: '0 0 150px', textAlign: 'center' }}>
          {password && (
            <>
              <QRCodeCanvas value={password} size={150} />
              <p className="mt-2"><small>Escanea el código QR</small></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
