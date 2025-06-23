import { Navigate } from 'react-router-dom';

export default function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  const userIdTemp = localStorage.getItem('user_id_temp');

  if (token) {
    return children; // Si hay token, el usuario está completamente autenticado
  }

  if (userIdTemp) {
    return <Navigate to="/verify-2fa" replace />;
  }

  return <Navigate to="/login" replace />;
}