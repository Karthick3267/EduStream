import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const DEMO_USERS = {
  student: {
    email: 'rahul.sharma@student.edu',
    password: 'Student@123',
    roleLabel: 'Student (Apex)',
  },
  student2: {
    email: 'priya.patel@student.edu',
    password: 'Student@123',
    roleLabel: 'Student (NCE - Approved)',
  },
  institution_staff: {
    email: 'staff@apex.edu',
    password: 'Staff@123',
    roleLabel: 'Institution Staff (Apex)',
  },
  admin: {
    email: 'admin@scholarships.gov',
    password: 'Admin@123',
    roleLabel: 'Scholarship Administrator',
  },
  finance_officer: {
    email: 'finance@treasury.gov',
    password: 'Finance@123',
    roleLabel: 'Finance / Treasury Officer',
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('scholarship_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile on mount if token exists
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
        setStudentProfile(res.data.studentProfile || null);
      } catch (err) {
        console.error('Failed to load user profile:', err);
        localStorage.removeItem('scholarship_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('scholarship_token', newToken);
      setToken(newToken);
      setUser(userData);

      // Also fetch full profile if student
      if (userData.role === 'student') {
        const meRes = await api.get('/auth/me');
        setStudentProfile(meRes.data.studentProfile);
      }

      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (formData) => {
    setError(null);
    try {
      const res = await api.post('/auth/register', formData);
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('scholarship_token', newToken);
      setToken(newToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('scholarship_token');
    setToken(null);
    setUser(null);
    setStudentProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      setStudentProfile(res.data.studentProfile || null);
    } catch (err) {
      console.error('Refresh profile failed:', err);
    }
  };

  // 1-Click quick login for demo and examination presentations
  const quickLogin = async (roleKey) => {
    const creds = DEMO_USERS[roleKey];
    if (!creds) return;
    return await login(creds.email, creds.password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        studentProfile,
        token,
        loading,
        error,
        login,
        register,
        logout,
        refreshProfile,
        quickLogin,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
