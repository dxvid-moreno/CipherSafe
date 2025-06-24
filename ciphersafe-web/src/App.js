import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import GeneratePassword from './pages/GeneratePassword';
import SavedPasswords from './pages/SavedPassword';
import TwoFactorAuth from './pages/TwoFactorAuth';
import ForgotPassword from './pages/ForgotPassword';
import Support from './pages/Support';

import RequireAuth from './components/RequireAuth';
import Navbar from './components/Navbar';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-2fa" element={<TwoFactorAuth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        { <Route path="/support" element={<Support />} /> }
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
    </Router>
  );
}

export default App;