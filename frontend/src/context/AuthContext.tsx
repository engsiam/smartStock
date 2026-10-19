import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../lib/api-client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'STAFF' | 'ACCOUNTANT';
  businessId?: string;
  businessName?: string;
}

export interface Business {
  id: string;
  name: string;
  legalType?: string;
  currency: string;
}

export interface AuthContextType {
  user: User | null;
  business: Business | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  quickLogin: (role: 'OWNER' | 'STAFF' | 'ACCOUNTANT') => Promise<void>;
  logout: () => void;
  switchBusiness: (businessId: string, businessName: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SEED_USERS = {
  OWNER: { email: 'owner@smartstock.local', password: 'Password123!', role: 'OWNER' as const, name: 'Siam Ahmed (Owner)' },
  STAFF: { email: 'staff@smartstock.local', password: 'Password123!', role: 'STAFF' as const, name: 'Karim Ullah (Staff)' },
  ACCOUNTANT: { email: 'accountant@smartstock.local', password: 'Password123!', role: 'ACCOUNTANT' as const, name: 'Nasreen Sultana (Accountant)' },
};

const DEFAULT_BIZ_ID = 'biz_dhaka_grocery_01';
const DEFAULT_BIZ_NAME = 'Dhaka Grocery & General Store';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('smartstock_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smartstock_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [business, setBusiness] = useState<Business | null>(() => {
    const saved = localStorage.getItem('smartstock_business');
    if (saved) return JSON.parse(saved);
    return {
      id: DEFAULT_BIZ_ID,
      name: DEFAULT_BIZ_NAME,
      currency: 'BDT',
    };
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session or auto-login with default owner demo if clean session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('smartstock_token');
        if (storedToken) {
          // Verify with /me
          try {
            const me = await apiRequest<{ id: string; email: string; name: string; memberships: Array<{ role: string; business: { id: string; name: string } }> }>('/auth/me');
            const primaryMembership = me.memberships[0];
            const activeUser: User = {
              id: me.id,
              email: me.email,
              name: me.name,
              role: (primaryMembership?.role as any) || 'OWNER',
              businessId: primaryMembership?.business?.id || DEFAULT_BIZ_ID,
              businessName: primaryMembership?.business?.name || DEFAULT_BIZ_NAME,
            };
            setUser(activeUser);
            localStorage.setItem('smartstock_user', JSON.stringify(activeUser));
            if (primaryMembership?.business) {
              const activeBiz = { id: primaryMembership.business.id, name: primaryMembership.business.name, currency: 'BDT' };
              setBusiness(activeBiz);
              localStorage.setItem('smartstock_biz_id', activeBiz.id);
              localStorage.setItem('smartstock_business', JSON.stringify(activeBiz));
            }
          } catch {
            // Token expired or invalid, auto-login with demo owner
            await quickLogin('OWNER');
          }
        } else {
          // No token saved, perform quick demo login as OWNER
          await quickLogin('OWNER');
        }
      } catch {
        // Fallback silently
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password = 'Password123!') => {
    setIsLoading(true);
    try {
      const res = await apiRequest<{
        accessToken: string;
        refreshToken: string;
        user: { id: string; email: string; name: string; memberships?: Array<{ role: string; business: { id: string; name: string } }> };
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const primaryMembership = res.user.memberships?.[0];
      const activeBizId = primaryMembership?.business?.id || DEFAULT_BIZ_ID;
      const activeBizName = primaryMembership?.business?.name || DEFAULT_BIZ_NAME;
      const role = (primaryMembership?.role as any) || 'OWNER';

      const authedUser: User = {
        id: res.user.id,
        email: res.user.email,
        name: res.user.name,
        role,
        businessId: activeBizId,
        businessName: activeBizName,
      };

      const authedBiz: Business = {
        id: activeBizId,
        name: activeBizName,
        currency: 'BDT',
      };

      setToken(res.accessToken);
      setUser(authedUser);
      setBusiness(authedBiz);

      localStorage.setItem('smartstock_token', res.accessToken);
      localStorage.setItem('smartstock_biz_id', activeBizId);
      localStorage.setItem('smartstock_user', JSON.stringify(authedUser));
      localStorage.setItem('smartstock_business', JSON.stringify(authedBiz));
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (role: 'OWNER' | 'STAFF' | 'ACCOUNTANT') => {
    const creds = SEED_USERS[role];
    await login(creds.email, creds.password);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('smartstock_token');
    localStorage.removeItem('smartstock_user');
  };

  const switchBusiness = (businessId: string, businessName: string) => {
    const newBiz: Business = { id: businessId, name: businessName, currency: 'BDT' };
    setBusiness(newBiz);
    localStorage.setItem('smartstock_biz_id', businessId);
    localStorage.setItem('smartstock_business', JSON.stringify(newBiz));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        token,
        isLoading,
        login,
        quickLogin,
        logout,
        switchBusiness,
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
