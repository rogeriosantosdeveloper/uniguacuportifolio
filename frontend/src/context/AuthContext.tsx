'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// 1. Definimos um tipo para o objeto do usuário
interface User {
  id: number;
  nomeCompleto: string;
  email: string;
  fotoUrl: string | null;
  curso: string | null;
  turno: string | null; 
}

interface AuthContextType {
  token: string | null;
  user: User | null; // 2. Adicionamos o usuário ao contexto
  login: (token: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null); // 3. Criamos o estado para o usuário

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      fetchAndSetUser(storedToken); // Se encontrar um token, busca os dados do usuário
    }
  }, []);

  // Função para buscar dados do usuário com um token
  const fetchAndSetUser = async (token: string) => {
     try {
         const response = await fetch('http://localhost:8080/api/users/me', {
             headers: { 'Authorization': `Bearer ${token}` }
         });
         if (!response.ok) throw new Error('Falha ao buscar dados do usuário');
         const userData = await response.json();
         setUser(userData);
         setToken(token);
         localStorage.setItem('authToken', token);
     } catch (error) {
         console.error(error);
         logout(); // Se falhar, faz logout para limpar estado inválido
     }
  }

  const login = async (newToken: string) => {
    await fetchAndSetUser(newToken); // 4. Login agora busca os dados do usuário
  };

  const logout = () => {
    setToken(null);
    setUser(null); // 5. Logout agora limpa os dados do usuário
    localStorage.removeItem('authToken');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}