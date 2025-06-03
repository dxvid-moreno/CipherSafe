import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <header className="bg-dark text-white p-4">
        <div className="container text-center">
          <h1 className="display-4 ">CipherSafe</h1>
          <p className="lead">Protege tus contraseñas con tecnología QR y cifrado de última generación.</p>
          <p className='lead'>Seguridad moderna, sencilla y siempre a tu alcance.</p>

        </div>
      </header>

      <main className="container flex-grow-1 my-5">
        <div className="row align-items-center">
          <div className="col-md-6">
            <h2 className="mb-4">¿Qué es CipherSafe?</h2>
            <p>
              CipherSafe es una aplicación web y móvil que te permite generar, guardar y verificar tus contraseñas de forma segura. Usa autenticación multifactor, códigos QR y cifrado avanzado para proteger tu información.
            </p>
            <ul className="list-unstyled mt-3">
              <li>🔐 Crea contraseñas fuertes en segundos </li>
              <li>🧠 Olvídate de recordarlas: guárdalas de forma cifrada</li>
              <li>📱 Verifícalas fácilmente con tu cámara y códigos QR</li>
              <li>📄 Exporta tus claves en PDF o CSV con seguridad</li>
              <li>💻 Accede desde cualquier dispositivo, en todo momento</li>
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
              src="https://cdn-icons-png.flaticon.com/512/2930/2930409.png"
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

