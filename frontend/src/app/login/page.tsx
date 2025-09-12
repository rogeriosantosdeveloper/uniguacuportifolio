'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {

      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // Se a resposta não for OK, tenta ler a mensagem de erro do backend
        const errorData = await response.json().catch(() => ({ message: 'Credenciais inválidas ou erro no servidor.' }));
        throw new Error(errorData.message || 'Credenciais inválidas.');
      }

      const data = await response.json();
      
      login(data.accessToken);
      router.push('/');
      
    } catch (err: unknown) {
      console.error('Erro durante o login:', err); //Logar o erro completo
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro desconhecido.');
      }
    } finally {
      setIsSubmitting(false); // Finaliza o carregamento, com sucesso ou erro
    }
  };

  return (
    <main className="flex justify-center items-center py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-uniguacu-blue mb-6">Fazer Login</h1>
        <form onSubmit={handleSubmit}>
          {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" required />
          </div>
          <div className="mb-2">
            <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Senha</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" required />
          </div>
          <div className="text-right mb-6">
            <Link href="/esqueci-senha">Esqueceu sua senha?</Link>
          </div>
          <button 
            type="submit" 
            className="w-full bg-uniguacu-blue hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
            disabled={isSubmitting} // Desativa o botão durante o envio
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">
          Não tem uma conta? <Link href="/cadastro">Cadastre-se</Link>
        </p>
      </div>
    </main>
  );
}