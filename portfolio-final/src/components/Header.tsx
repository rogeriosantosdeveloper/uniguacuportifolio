'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export function Header() {
  const { isAuthenticated, user, logout } = useAuth(); // Agora pegamos o 'user'

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <Image
            src="/logo-uniguacu.png"
            alt="Logo da Faculdade Uniguaçu"
            width={180}
            height={45}
            priority
          />
        </Link>
        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            // Se o usuário ESTÁ logado
            <>
              <Link href="/artefatos/novo" className="bg-uniguacu-blue hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded transition-all duration-300">
                + Adicionar Projeto
              </Link>
              
              {/* Menu do Usuário */}
              <div className="flex items-center gap-3">
                 <span className="font-semibold text-gray-700 hidden sm:block">{user.nomeCompleto}</span>
                 <Link href="/perfil"> {/* Link para a futura página de perfil */}
                     <img
                         src={user.fotoUrl ? `http://localhost:8080/api/files/${user.fotoUrl}` : '/avatar-placeholder.png'}
                         alt={`Foto de ${user.nomeCompleto}`}
                         className="w-10 h-10 rounded-full object-cover border-2 border-uniguacu-blue cursor-pointer"
                     />
                 </Link>
              </div>

              <button onClick={logout} className="text-uniguacu-red font-semibold hover:underline">
                Logout
              </button>
            </>
          ) : (
            // Se o usuário NÃO ESTÁ logado
            <>
              <Link href="/login">Fazer Login</Link>
              <Link href="/cadastro" className="bg-uniguacu-red hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-md">
                Cadastre-se
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}