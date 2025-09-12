'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // Hook para autenticação

// Tipo para o formulário
type ArtefatoFormData = {
  titulo: string;
  autor: string;
  descricao: string;
  urlImagem: string;
  curso: string;
  campus: string;
  categoria: string;
  semestre: number | string; // pode ser string do form
  dataCriacao: string;
};

export default function EditarArtefatoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const { token } = useAuth(); // Pegando o token para enviar na requisição

  const [formData, setFormData] = useState<ArtefatoFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Busca os dados atuais para preencher o formulário
  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8080/api/artefatos/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Projeto não encontrado');
          return res.json();
        })
        .then(data => {
            // Garante que a data esteja no formato YYYY-MM-DD para o input
            if(data.dataCriacao) {
                data.dataCriacao = data.dataCriacao.split('T')[0];
            }
            setFormData(data);
        })
        .catch(err => setError((err as Error).message))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => prevData ? { ...prevData, [name]: value } : null);
  };

  // Envia os dados atualizados para a API
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData) return;

    try {
      const response = await fetch(`http://localhost:8080/api/artefatos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Enviando o token para o backend
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar o projeto. Verifique suas permissões.');
      }

      router.push(`/artefatos/${id}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Ocorreu um erro desconhecido.');
      }
    }
  };

  if (loading) return <p className="text-center mt-12">Carregando formulário...</p>;
  if (error) return <p className="text-center mt-12 text-uniguacu-red">Erro: {error}</p>;
  if (!formData) return <p className="text-center mt-12">Dados do projeto não encontrados.</p>;

  return (
    <main className="container mx-auto p-8">
      <Link href={`/artefatos/${id}`} className="text-blue-500 hover:underline mb-6 block">&larr; Cancelar e Voltar</Link>
      <h1 className="text-3xl font-bold mb-6">Editar Projeto</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        {/* Adicione todos os campos do seu formulário aqui, similar à página de criação */}
        {/* Exemplo para o campo Título */}
        <div className="mb-4">
          <label htmlFor="titulo" className="block text-gray-700 font-bold mb-2">Título</label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>
        
        {/* ... adicione os outros campos (autor, descricao, curso, etc.) ... */}

        <button type="submit" className="bg-uniguacu-blue hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded">
          Salvar Alterações
        </button>
      </form>
    </main>
  );
}