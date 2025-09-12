'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // Hook para autenticação

type Artefato = {
  id: number;
  titulo: string;
  descricao: string;
  urlImagem: string;
  autor: string;
  curso: string;
};

export default function ArtefatoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  
  // Usando AuthContext para pegar o status de login e o token
  const { isAuthenticated, token } = useAuth();

  const [artefato, setArtefato] = useState<Artefato | null>(null);
  const [loading, setLoading] = useState(true);

  // Busca os dados do artefato na API
  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8080/api/artefatos/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setArtefato(data);
          setLoading(false);
        });
    }
  }, [id]);

  // Função para deletar o projeto
  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja deletar este projeto?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/artefatos/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}` // Enviando o token para o backend
          }
        });

        if (!response.ok) {
          throw new Error('Você não tem permissão para deletar este projeto.');
        }
        
        router.push('/');
      } catch (err: unknown) {
        if (err instanceof Error) {
          alert(err.message);
        } else {
          alert('Ocorreu um erro desconhecido.');
        }
      }
    }
  };

  if (loading) return <p className="text-center mt-10">Carregando detalhes...</p>;
  if (!artefato) return <p className="text-center mt-10">Projeto não encontrado.</p>;

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">&larr; Voltar para a lista</Link>

        <article className="bg-white shadow-xl rounded-lg overflow-hidden">
          {artefato.urlImagem && (
            <img 
              src={`http://localhost:8080/api/files/${artefato.urlImagem}`} 
              alt={artefato.titulo}
              className="w-full h-96 object-cover"
            />
          )}

          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{artefato.titulo}</h1>
            <p className="text-lg text-gray-600 mb-6">Criado por: {artefato.autor}</p>
            <div className="prose max-w-none">
              <p className="text-gray-800">{artefato.descricao}</p>
            </div>
            <hr className="my-8" />

            {isAuthenticated && (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleDelete}
                  className="bg-uniguacu-red hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                  Deletar Projeto
                </button>
                <Link 
                  href={`/artefatos/${id}/editar`} 
                  className="bg-uniguacu-blue hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                  Editar
                </Link>
              </div>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}