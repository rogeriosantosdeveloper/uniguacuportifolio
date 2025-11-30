'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { getApiEndpoint } from '@/lib/api';

// Definimos o tipo de dado para o artefato
type Artefato = {
  id: number;
  titulo: string;
  autor: string;
  curso: string;
  status: 'PENDENTE' | 'APROVADO' | 'REPROVADO';
};

// Fetcher que envia o token de autenticação
const fetcher = async (url: string, token: string | null) => {
  if (!token) {
    throw new Error('Não autenticado.');
  }
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error('Falha ao buscar os projetos pendentes. Apenas administradores podem ver esta página.');
  }
  return res.json();
};

export default function AdminPage() {
  const { token, isAuthenticated, isAdmin, user } = useAuth();
  
  // Verificação de acesso - apenas administradores
  if (!isAuthenticated) {
    return (
      <main className="container mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h1 className="text-2xl font-bold text-red-800 mb-2">Acesso Negado</h1>
          <p className="text-red-600 mb-4">Você precisa estar logado para acessar esta página.</p>
          <Link href="/login" className="bg-uniguacu-blue text-white px-6 py-2 rounded-lg hover:bg-opacity-80 transition-colors">
            Fazer Login
          </Link>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="container mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
          </svg>
          <h1 className="text-2xl font-bold text-red-800 mb-2">Acesso Restrito</h1>
          <p className="text-red-600 mb-2">Apenas administradores podem acessar esta página.</p>
          <p className="text-gray-600 mb-4">Seu usuário: <span className="font-semibold">{user?.nomeCompleto}</span> ({user?.role === 'ROLE_ADMIN' ? 'Administrador' : 'Usuário'})</p>
          <div className="flex gap-4 justify-center">
            <Link href="/" className="bg-uniguacu-blue text-white px-6 py-2 rounded-lg hover:bg-opacity-80 transition-colors">
              Voltar ao Início
            </Link>
            <Link href="/perfil" className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-opacity-80 transition-colors">
              Meu Perfil
            </Link>
          </div>
        </div>
      </main>
    );
  }
  
  // Usamos SWR para buscar os projetos do endpoint de pendentes
  const pendentesUrl = token ? getApiEndpoint('/api/artefatos/pendentes') : null;
  const { data: pendentes, error, isLoading } = useSWR<Artefato[]>(
    pendentesUrl, // Só busca se o token existir
    (url: string) => fetcher(url, token)
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Função para aprovar um projeto
  const handleApprove = async (id: number) => {
    setIsSubmitting(true);
    await fetch(getApiEndpoint(`/api/artefatos/${id}/aprovar`), {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    // Avisa ao SWR para recarregar a lista de projetos pendentes
    if (pendentesUrl) mutate(pendentesUrl);
    setIsSubmitting(false);
  };

  // Função para reprovar um projeto
  const handleReject = async (id: number) => {
    setIsSubmitting(true);
    await fetch(getApiEndpoint(`/api/artefatos/${id}/reprovar`), {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (pendentesUrl) mutate(pendentesUrl);
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <main className="container mx-auto p-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg className="animate-spin w-12 h-12 text-uniguacu-blue mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Carregando projetos...</h3>
          <p className="text-gray-500">Buscando projetos pendentes de aprovação</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar</h3>
          <p className="text-red-600 mb-4">{error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-8">
      {/* Header do Admin */}
      <div className="bg-gradient-to-r from-uniguacu-blue to-uniguacu-red text-white p-6 rounded-lg shadow-lg mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Painel do Administrador</h1>
            <p className="text-white/90">Bem-vindo, {user?.nomeCompleto}</p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-white/80">Usuário</p>
              <p className="font-semibold">{user?.email}</p>
              <p className="text-xs text-white/70">Administrador</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-6">
          <svg className="w-6 h-6 text-uniguacu-blue mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700">Projetos Pendentes de Aprovação</h2>
        </div>
        {pendentes && pendentes.length > 0 ? (
          <ul className="space-y-4">
            {pendentes.map((artefato) => (
              <li key={artefato.id} className="border p-4 rounded-md flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <Link href={`/artefatos/${artefato.id}`} className="font-bold text-uniguacu-blue hover:underline" target="_blank">
                    {artefato.titulo}
                  </Link>
                  <p className="text-sm text-gray-500">Autor: {artefato.autor} | Curso: {artefato.curso}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(artefato.id)}
                    disabled={isSubmitting}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:bg-gray-400"
                  >
                    Aprovar
                  </button>
                  <button
                    onClick={() => handleReject(artefato.id)}
                    disabled={isSubmitting}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:bg-gray-400"
                  >
                    Reprovar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum projeto pendente</h3>
            <p className="text-gray-500 mb-4">Todos os projetos foram analisados e aprovados.</p>
            <Link href="/" className="bg-uniguacu-blue text-white px-6 py-2 rounded-lg hover:bg-opacity-80 transition-colors">
              Ver Projetos Aprovados
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}