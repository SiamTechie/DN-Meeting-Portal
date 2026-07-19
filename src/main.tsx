import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { Login } from './pages/Login.tsx';
import { ForgotPassword } from './pages/ForgotPassword.tsx';
import { Profile } from './pages/Profile.tsx';
import { UserManagement } from './pages/admin/UserManagement.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/users" element={
            <ProtectedRoute requireAdmin={true}>
              <UserManagement />
            </ProtectedRoute>
          } />
          
          {/* Main App (Dashboard & Booking) */}
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
