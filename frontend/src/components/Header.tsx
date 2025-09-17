'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext'; // Seu hook de autenticação

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
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
              {/* ================== LINK DE ADMIN ADICIONADO ================== */}
              {/* O link só aparece se o usuário tiver a role de ADMIN */}
              {user.role === 'ROLE_ADMIN' && (
                <Link href="/admin" className="text-sm font-semibold text-uniguacu-red hover:underline">
                  Painel Admin
                </Link>
              )}

              <Link href="/artefatos/novo" className="bg-uniguacu-blue hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded transition-all duration-300">
                + Adicionar Projeto
              </Link>
              
              <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-700 hidden sm:block">{user.nomeCompleto}</span>
                  <Link href="/perfil" className="cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-uniguacu-blue/10 flex items-center justify-center relative overflow-hidden border-2 border-uniguacu-blue">
                      {user.fotoUrl ? (
                        <Image
                          src={`http://localhost:8080/api/files/${user.fotoUrl}`}
                          alt={`Foto de ${user.nomeCompleto}`}
                          layout="fill"
                          objectFit="cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-uniguacu-blue">
                          {user.nomeCompleto.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
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