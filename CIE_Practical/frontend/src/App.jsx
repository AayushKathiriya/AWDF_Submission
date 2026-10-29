import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// 3 Distinct Page Components (T1: No everything-in-App anti-pattern)
import DashboardPage from './pages/DashboardPage';
import CreateTaskPage from './pages/CreateTaskPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={styles.appShell}>
          <Navbar />
          <div style={styles.content}>
            <Routes>
              {/* Public Route: Dashboard */}
              <Route path="/" element={<DashboardPage />} />

              {/* Protected Route: Create Task (T2: redirects if unauthenticated) */}
              <Route
                path="/tasks/new"
                element={
                  <ProtectedRoute>
                    <CreateTaskPage />
                  </ProtectedRoute>
                }
              />

              {/* Public Route: Login */}
              <Route path="/login" element={<LoginPage />} />

              {/* Fallback 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

const styles = {
  appShell: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--color-bg)',
  },
  content: {
    flex: 1,
  },
};
