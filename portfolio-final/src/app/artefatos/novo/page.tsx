'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function NovoArtefato() {
  const { token } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({ titulo: '', autor: '', descricao: '' });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      alert('Por favor, selecione uma imagem.');
      return;
    }
    setIsSubmitting(true);

    // 1. Fazer o upload da imagem primeiro
    const fileFormData = new FormData();
    fileFormData.append('file', file);

    const uploadResponse = await fetch('http://localhost:8080/api/files/upload', {
      method: 'POST',
      body: fileFormData,
    });

    if (!uploadResponse.ok) {
      alert('Falha no upload da imagem.');
      setIsSubmitting(false);
      return;
    }

    const uploadResult = await uploadResponse.json();
    const imageUrl = uploadResult.filename; // O nome do arquivo salvo no backend

    // 2. Criar o artefato com a URL da imagem
    const artefatoData = { ...formData, urlImagem: imageUrl };

    await fetch('http://localhost:8080/api/artefatos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(artefatoData),
    });

    await fetch('http://localhost:8080/api/artefatos', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // <<-- LINHA CRÍTICA
      },
      body: JSON.stringify(artefatoData),
    });

    router.push('/');
  };

  return (
    <main className="container mx-auto p-8">
      <Link href="/" className="text-blue-500 hover:underline mb-6 block">&larr; Voltar para a lista</Link>
      <h1 className="text-3xl font-bold mb-6">Criar Novo Projeto</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        {/* ... campos de título, autor, descrição ... */}
         <div className="mb-4">
             <label htmlFor="titulo" className="block text-gray-700 font-bold mb-2">Título</label>
             <input type="text" id="titulo" name="titulo" onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" required />
         </div>
         <div className="mb-4">
             <label htmlFor="autor" className="block text-gray-700 font-bold mb-2">Autor</label>
             <input type="text" id="autor" name="autor" onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" required />
         </div>
         <div className="mb-4">
             <label htmlFor="descricao" className="block text-gray-700 font-bold mb-2">Descrição</label>
             <textarea id="descricao" name="descricao" onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 h-32" required />
         </div>

        {/* NOVO CAMPO DE UPLOAD */}
        <div className="mb-6">
          <label htmlFor="file" className="block text-gray-700 font-bold mb-2">Imagem do Projeto</label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-uniguacu-blue hover:file:bg-blue-100"
            accept="image/*"
            required
          />
        </div>

        <button type="submit" disabled={isSubmitting} className="bg-uniguacu-blue text-white font-bold py-2 px-4 rounded disabled:bg-gray-400">
          {isSubmitting ? 'Salvando...' : 'Salvar Projeto'}
        </button>
      </form>
    </main>
  );
}