// File: context/AuthContext.tsx
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { User } from '../types';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = () => {
      // TODO: replace with real auth state listener (e.g. Firebase)
      setLoading(false);
    };
    unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    // TODO: implement sign-in logic
    // setUser({ id: '1', email });
  };

  const signOut = async () => {
    // TODO: implement sign-out logic
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
