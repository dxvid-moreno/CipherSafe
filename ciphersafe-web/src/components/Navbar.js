// ciphersafe-web/src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importar useAuth

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth(); // Obtener el estado de autenticación y la función de logout
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Llama a la función de logout del contexto
    navigate('/login'); // Redirige al usuario a la página de login
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          CipherSafe
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {!isAuthenticated ? ( // Si no está autenticado
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Iniciar Sesión
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Registrarse
                  </Link>
                </li>
              </>
            ) : ( // Si está autenticado
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/generate">
                    Generar Contraseña
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/saved">
                    Contraseñas Guardadas
                  </Link>
                </li>
                <li className="nav-item">
                  <button className="nav-link btn btn-link text-white-50" onClick={handleLogout}>
                    Cerrar Sesión
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}