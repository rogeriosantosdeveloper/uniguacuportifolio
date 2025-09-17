'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

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
  const { token } = useAuth();
  
  // Usamos SWR para buscar os projetos do endpoint de pendentes
  const { data: pendentes, error, isLoading } = useSWR<Artefato[]>(
    token ? 'http://localhost:8080/api/artefatos/pendentes' : null, // Só busca se o token existir
    (url: string) => fetcher(url, token)
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Função para aprovar um projeto
  const handleApprove = async (id: number) => {
    setIsSubmitting(true);
    await fetch(`http://localhost:8080/api/artefatos/${id}/aprovar`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    // Avisa ao SWR para recarregar a lista de projetos pendentes
    mutate('http://localhost:8080/api/artefatos/pendentes');
    setIsSubmitting(false);
  };

  // Função para reprovar um projeto
  const handleReject = async (id: number) => {
    setIsSubmitting(true);
    await fetch(`http://localhost:8080/api/artefatos/${id}/reprovar`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    mutate('http://localhost:8080/api/artefatos/pendentes');
    setIsSubmitting(false);
  };

  if (isLoading) return <p className="text-center p-8">Carregando projetos para aprovação...</p>;
  if (error) return <p className="text-center p-8 text-red-500">{error.message}</p>;

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-uniguacu-blue mb-6">Painel do Administrador</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Projetos Pendentes de Aprovação</h2>
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
          <p className="text-gray-500">Nenhum projeto pendente no momento.</p>
        )}
      </div>
    </main>
  );
}