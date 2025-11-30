'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getApiEndpoint } from '@/lib/api';

// Define o formato do objeto User, incluindo a role
interface User {
  id: number;
  nomeCompleto: string;
  email: string;
  fotoUrl: string | null;
  curso: string | null;
  turno: string | null;
  role: string; // Ex: "ROLE_USER", "ROLE_ADMIN"
}

// Define o formato do contexto que será compartilhado
interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean; // Helper para verificar facilmente se o usuário é Admin
}

// Cria o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Componente Provedor que envolve a aplicação
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true); // Estado para controlar o carregamento inicial

  // Efeito para carregar o token do localStorage ao iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      fetchAndSetUser(storedToken); // Se encontrar token, busca dados do usuário
    } else {
      setLoadingUser(false); // Se não há token, termina o carregamento
    }
  }, []);

  // Função assíncrona para buscar os dados do usuário usando o token
  const fetchAndSetUser = async (currentToken: string) => {
     setLoadingUser(true); // Começa a carregar
     try {
        const response = await fetch(getApiEndpoint('/api/users/me'), {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
         // Lança erro se a resposta não for OK (ex: token inválido/expirado)
         if (!response.ok) {
            const errorBody = await response.text(); // Tenta ler corpo do erro
            throw new Error(`Falha ao buscar dados do usuário: ${response.status} ${errorBody}`);
         }
         const userData: User = await response.json();
         setUser(userData); // Armazena os dados do usuário no estado
         setToken(currentToken); // Armazena o token no estado
         localStorage.setItem('authToken', currentToken); // Persiste o token no localStorage
     } catch (error) {
         console.error("Erro em fetchAndSetUser:", error);
         // Se falhar (token inválido?), desloga o usuário limpando o estado e storage
         setToken(null);
         setUser(null);
         localStorage.removeItem('authToken');
     } finally {
         setLoadingUser(false); // Termina o carregamento
     }
  }

  // Função chamada pela página de Login
  const login = async (newToken: string) => {
    await fetchAndSetUser(newToken); // Busca os dados do usuário ao logar
  };

  // Função para deslogar
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    // Força o redirecionamento para a página de login para garantir o estado limpo
    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
  };

  // Helpers derivados do estado
  const isAuthenticated = !!token && !!user; // Autenticado se tiver token E dados do usuário
  const isAdmin = isAuthenticated && user?.role === 'ROLE_ADMIN'; // Verifica se a role é ADMIN

  // Se estiver carregando os dados iniciais do usuário, mostra um loader simples
  if (loadingUser) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 bg-white rounded-2xl shadow-lg">
              <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-uniguacu-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-lg font-semibold text-gray-700">Carregando...</span>
            </div>
          </div>
        </div>
      );
  }

  // Fornece o estado e as funções para os componentes filhos
  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado para consumir o contexto facilmente
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}