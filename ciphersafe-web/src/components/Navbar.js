import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
<nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3 ">
  <Link className="navbar-brand" to="/">CipherSafe</Link>

  <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Alternar navegación">
    <span className="navbar-toggler-icon"></span>
  </button>

  <div className="collapse navbar-collapse" id="navbarNav">
    <ul className="navbar-nav ms-auto">
      {token ? (
        <>
          <li className="nav-item">
            <Link className="nav-link" to="/generate">Generar</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/saved">Mis Contraseñas</Link>
          </li>
          <li className="nav-item">
            <button className="btn btn-outline-light ms-2" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </li>
        </>
      ) : (
        <>
          <li className="nav-item">
            <Link className="nav-link" to="/login">Iniciar sesión</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/register">Registrarse</Link>
          </li>
        </>
      )}
    </ul>
  </div>
</nav>

  );
}
