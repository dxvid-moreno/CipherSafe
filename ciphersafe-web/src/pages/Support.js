import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Support() {
  /*return (
    

  );*/
  const [section, setSection] = useState('tutorials');

  const renderSection = () => {
    switch (section) {
      case 'tutorials':
        return (
          <div>
            <h4>Tutoriales</h4>
            <p>Aquí encontrarás guías paso a paso para usar CipherSafe.</p>
            {/* Agrega más contenido o enlaces aquí */}
          </div>
        );
      case 'policies':
        return (
          <div>
            <h4>Políticas</h4>
            <p>Consulta nuestras políticas de privacidad y términos de servicio.</p>
          </div>
        );
      case 'contact':
        return (
          <div>
            <h4>Contactar Soporte</h4>
            <form>
              <div className="mb-3">
                <label className="form-label">Tu correo electrónico</label>
                <input type="email" className="form-control" placeholder="ejemplo@correo.com" />
              </div>
              <div className="mb-3">
                <label className="form-label">Mensaje</label>
                <textarea className="form-control" rows="4" placeholder="Describe tu problema o duda..."></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Enviar</button>
            </form>
          </div>
        );
      case 'faq':
        return (
          <div>
            <h4>Preguntas Frecuentes (FAQ)</h4>
            <ul>
              <li>¿Cómo genero una contraseña segura?</li>
              <li>¿Cómo restablezco mi cuenta?</li>
              {/* Añade más preguntas/respuestas aquí */}
            </ul>
          </div>
        );
      case 'report':
        return (
          <div>
            <h4>Reporte de errores</h4>
            <p>Si encontraste un bug, por favor repórtalo usando el formulario de contacto o abre un issue en GitHub.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Soporte</h2>
      <p>Esta es la sección de ayuda o soporte técnico.</p>

      <div className="mb-4 d-flex flex-wrap gap-2">
        <button className="btn btn-outline-primary" onClick={() => setSection('tutorials')}>Tutoriales</button>
        <button className="btn btn-outline-primary" onClick={() => setSection('policies')}>Políticas</button>
        <button className="btn btn-outline-primary" onClick={() => setSection('contact')}>Contactar</button>
        <button className="btn btn-outline-primary" onClick={() => setSection('faq')}>FAQ</button>
        <button className="btn btn-outline-primary" onClick={() => setSection('report')}>Reportar error</button>
      </div>

      <div>{renderSection()}</div>
    </div>
  );
}

