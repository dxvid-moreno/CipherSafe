// ciphersafe-web/src/context/AuthContext.js
import React, { createContext, useState, useContext } from 'react';

// 1. Crear el Contexto
export const AuthContext = createContext(null);

// 2. Crear el Proveedor del Contexto
export const AuthProvider = ({ children }) => {
  // Estado para saber si el usuario está logueado
  // Inicialmente, verifica si hay un user_id en localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('user_id'));
  // Estado para almacenar el user_id
  const [userId, setUserId] = useState(localStorage.getItem('user_id'));

  // Función para iniciar sesión
  const login = (id) => {
    localStorage.setItem('user_id', id);
    setUserId(id);
    setIsAuthenticated(true);
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('user_id');
    setUserId(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para facilitar el uso del contexto
export const useAuth = () => {
  return useContext(AuthContext);
};