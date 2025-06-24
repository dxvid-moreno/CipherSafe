import React from 'react';
import { Link } from 'react-router-dom';

export default function Support() {
  return (
    <div className="container mt-5">
      <h2 className="mb-4">Soporte</h2>

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

