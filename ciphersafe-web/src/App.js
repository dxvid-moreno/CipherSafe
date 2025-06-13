// ciphersafe-web/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import GeneratePassword from './pages/GeneratePassword';
import SavedPasswords from './pages/SavedPassword';
import OTPVerification from './pages/OTPVerification'; 
import RequireAuth from './components/RequireAuth';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext'; // Importar AuthProvider

function App() {
  return (
    <Router>
      <AuthProvider> {/* Envuelve toda la aplicación con AuthProvider */}
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          <Route
            path="/generate"
            element={
              <RequireAuth>
                <GeneratePassword />
              </RequireAuth>
            }
          />
          <Route
            path="/saved"
            element={
              <RequireAuth>
                <SavedPasswords />
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;