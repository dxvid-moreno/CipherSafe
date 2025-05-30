import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import GeneratePassword from './pages/GeneratePassword';
import SavedPasswords from './pages/SavedPassword';
import RequireAuth from './components/RequireAuth';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar /> {/* Siempre visible */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
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
