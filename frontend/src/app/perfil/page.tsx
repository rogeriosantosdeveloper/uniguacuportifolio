'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Para o formulário, criamos uma lista de opções que podem ser reutilizadas
const cursosDisponiveis = ['Engenharia de Software', 'Direito', 'Agronomia', 'Medicina Veterinária', 'Psicologia', 'Administração'];
const turnosDisponiveis = ['Matutino', 'Noturno'];

export default function PerfilPage() {
  const { user, token, login } = useAuth(); // Usamos a função 'login' para forçar a atualização dos dados do usuário
  const router = useRouter();

  // Estados do formulário
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [curso, setCurso] = useState('');
  const [turno, setTurno] = useState('');
  
  // Estados para o upload da imagem
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Estados de feedback para o usuário
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Preenche o formulário com os dados do usuário quando o componente carrega
  useEffect(() => {
    if (user) {
      setNomeCompleto(user.nomeCompleto);
      setEmail(user.email);
      setCurso(user.curso || ''); // Usa o curso do usuário ou uma string vazia
      setTurno(user.turno || ''); // Usa o turno do usuário ou uma string vazia
      setPreviewImage(user.fotoUrl ? `http://localhost:8080/api/files/${user.fotoUrl}` : '/avatar-placeholder.png');
    }
  }, [user]); // Este efeito roda sempre que o objeto 'user' do contexto mudar

  // Lida com a seleção de um novo arquivo de imagem
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file)); // Cria uma URL temporária para a pré-visualização
    }
  };

  // Lida com o envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);

    try {
      // Passo 1: Se uma nova foto foi selecionada, faz o upload dela primeiro
      if (selectedFile) {
        const fileFormData = new FormData();
        fileFormData.append('file', selectedFile);
        
        // CORREÇÃO: Adicionamos o cabeçalho de autorização aqui
        const photoResponse = await fetch('http://localhost:8080/api/users/me/photo', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }, // <<-- LINHA ADICIONADA
          body: fileFormData,
        });

        if (!photoResponse.ok) {
          throw new Error('Falha no upload da foto.');
        }
      }

      // Passo 2: Atualiza os outros dados do usuário
      const dataResponse = await fetch('http://localhost:8080/api/users/me', {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ nomeCompleto, email, curso, turno }),
      });

      if (!dataResponse.ok) {
          throw new Error('Falha ao atualizar os dados do perfil.');
      }

      // Passo 3: Força a atualização dos dados no contexto
      if (token) {
          await login(token);
      }

      setMessage('Perfil atualizado com sucesso!');
      setTimeout(() => setMessage(''), 3000);

    } catch (err: unknown) {
        if (err instanceof Error) { setError(err.message); }
        else { setError('Ocorreu um erro desconhecido.'); }
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-uniguacu-blue mb-6">Meu Perfil</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
        {message && <p className="bg-green-100 text-green-700 p-3 rounded">{message}</p>}
        {error && <p className="bg-red-100 text-red-700 p-3 rounded">{error}</p>}

        <div className="flex flex-col items-center gap-4">
          <img 
            src={previewImage || '/avatar-placeholder.png'} 
            alt="Foto de perfil"
            className="w-32 h-32 rounded-full object-cover border-4 border-uniguacu-blue"
          />
          <input 
            type="file" 
            accept="image/*"
            onChange={handleFileChange}
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-uniguacu-blue hover:file:bg-blue-100"
          />
        </div>

        <div>
          <label htmlFor="nomeCompleto" className="block text-gray-700 font-bold mb-2">Nome Completo</label>
          <input type="text" id="nomeCompleto" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" required />
        </div>

        <div>
          <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" required />
        </div>

        <div>
          <label htmlFor="curso" className="block text-gray-700 font-bold mb-2">Curso</label>
          <select id="curso" value={curso} onChange={(e) => setCurso(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700">
            <option value="">Não especificado</option>
            {cursosDisponiveis.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="turno" className="block text-gray-700 font-bold mb-2">Turno</label>
          <select id="turno" value={turno} onChange={(e) => setTurno(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700">
            <option value="">Não especificado</option>
            {turnosDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        
        <button 
            type="submit" 
            className="w-full bg-uniguacu-blue hover:bg-opacity-80 text-white font-bold py-3 px-4 rounded disabled:bg-gray-400"
            disabled={isSubmitting}
        >
          {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </main>
  );
}