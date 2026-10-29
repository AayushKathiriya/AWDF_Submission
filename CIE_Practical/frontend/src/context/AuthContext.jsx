import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore token on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('cie_auth_token');
      const savedUser = localStorage.getItem('cie_auth_user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.warn('Failed to parse cached auth state:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Authentication failed.');
    }

    setToken(data.data.token);
    setUser(data.data.user);
    localStorage.setItem('cie_auth_token', data.data.token);
    localStorage.setItem('cie_auth_user', JSON.stringify(data.data.user));
    return data.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cie_auth_token');
    localStorage.removeItem('cie_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
