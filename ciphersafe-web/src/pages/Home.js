import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <header className="bg-dark text-white p-4">
        <div className="container">
          <h1 className="display-4">CipherSafe</h1>
          <p className="lead">Tu gestor seguro de contraseñas con tecnología QR y cifrado avanzado.</p>
        </div>
      </header>

      <main className="container flex-grow-1 my-5">
        <div className="row align-items-center">
          <div className="col-md-6">
            <h2 className="mb-4">¿Qué es CipherSafe?</h2>
            <p>
              CipherSafe es una plataforma web y móvil que permite generar, almacenar y verificar contraseñas
              de forma segura usando códigos QR, autenticación multifactor y cifrado robusto.
            </p>
            <ul className="list-unstyled mt-3">
              <li>✅ Generación de contraseñas seguras</li>
              <li>✅ Almacenamiento cifrado</li>
              <li>✅ Verificación mediante códigos QR</li>
              <li>✅ Exportación segura en PDF/CSV</li>
              <li>✅ Compatible con múltiples dispositivos</li>
            </ul>
            <div className="mt-4">
              <Link to="/register" className="btn btn-primary me-3">
                Registrarse
              </Link>
              <Link to="/login" className="btn btn-outline-dark">
                Iniciar sesión
              </Link>
            </div>
          </div>

          <div className="col-md-6 text-center mt-4 mt-md-0">
            <img
              src="https://cdn-icons-png.flaticon.com/512/747/747305.png"
              alt="seguridad"
              className="img-fluid"
              style={{ maxWidth: '300px' }}
            />
          </div>
        </div>
      </main>

      <footer className="bg-dark text-white text-center p-3">
        &copy; 2025 CipherSafe | Seguridad digital para todos
      </footer>
    </div>
  );
}

