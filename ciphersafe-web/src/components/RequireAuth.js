// ciphersafe-web/src/components/RequireAuth.js
import { Navigate } from 'react-router-dom';

export default function RequireAuth({ children }) {
  // Ahora verificamos 'user_id' en lugar de 'token'
  const userId = localStorage.getItem('user_id'); 
  
  // Si hay un userId, permite el acceso a la ruta protegida; de lo contrario, redirige al login.
  return userId ? children : <Navigate to="/login" replace />;
}