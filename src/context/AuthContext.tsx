import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, SiteSettings, BankDetails } from '../types';
import { api, getAuthToken, setAuthToken, removeAuthToken, getAdminToken, setAdminToken, removeAdminToken } from '../lib/api';

interface AuthContextType {
  user: User | null;
  adminUser: User | null;
  settings: SiteSettings | null;
  bankDetails: BankDetails | null;
  loading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (payload: { fullName: string; username: string; email: string; phone: string; password: string; referralCode?: string }) => Promise<void>;
  logout: () => void;
  adminLogin: (email: string, password: string) => Promise<void>;
  adminLogout: () => void;
  refreshUser: () => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshSettings = useCallback(async () => {
    try {
      const [sData, bData] = await Promise.all([
        api.getSettings().catch(() => null),
        api.getBankDetails().catch(() => null),
      ]);
      if (sData) setSettings(sData);
      if (bData) setBankDetails(bData);
    } catch (err) {
      console.error('Failed loading settings:', err);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const res = await api.getCurrentUser();
      setUser(res.user);
    } catch (err) {
      console.error('Session expired or invalid:', err);
      removeAuthToken();
      setUser(null);
    }
  }, []);

  const refreshAdmin = useCallback(async () => {
    const adminToken = getAdminToken();
    if (!adminToken) {
      setAdminUser(null);
      return;
    }
    try {
      const res = await api.getCurrentUser();
      if (res.user.isAdmin || res.user.email.toLowerCase() === 'talkdavidjohn@gmail.com') {
        setAdminUser(res.user);
      } else {
        removeAdminToken();
        setAdminUser(null);
      }
    } catch (err) {
      removeAdminToken();
      setAdminUser(null);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([refreshSettings(), refreshUser(), refreshAdmin()]);
      setLoading(false);
    };
    init();
  }, [refreshSettings, refreshUser, refreshAdmin]);

  const login = async (emailOrUsername: string, password: string) => {
    const res = await api.login({ emailOrUsername, password });
    setAuthToken(res.token);
    setUser(res.user);
  };

  const register = async (payload: { fullName: string; username: string; email: string; phone: string; password: string; referralCode?: string }) => {
    const res = await api.register(payload);
    setAuthToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  const adminLogin = async (email: string, password: string) => {
    const res = await api.adminLogin({ email, password });
    setAdminToken(res.token);
    setAdminUser(res.user);
  };

  const adminLogout = () => {
    removeAdminToken();
    setAdminUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        adminUser,
        settings,
        bankDetails,
        loading,
        login,
        register,
        logout,
        adminLogin,
        adminLogout,
        refreshUser,
        refreshSettings,
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
