'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo melhorado */}
          <Link href="/" className="group">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Image
                  src="/logo-uniguacu.png"
                  alt="Logo da Faculdade Uniguaçu"
                  width={200}
                  height={50}
                  priority
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-uniguacu-blue">Portfólio</h1>
                <p className="text-sm text-gray-600">Projetos Acadêmicos</p>
              </div>
            </div>
          </Link>

          {/* Navegação do usuário */}
          <div className="flex items-center gap-6">
            {isAuthenticated && user ? (
              // Usuário logado
              <>
                {/* Link Admin */}
                {user.role === 'ROLE_ADMIN' && (
                  <Link 
                    href="/admin" 
                    className="hidden md:flex items-center px-4 py-2 text-sm font-semibold text-uniguacu-red hover:text-uniguacu-blue transition-colors duration-200 bg-red-50 hover:bg-red-100 rounded-lg"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Painel Admin
                  </Link>
                )}

                {/* Botão Adicionar Projeto */}
                <Link 
                  href="/artefatos/novo" 
                  className="bg-gradient-to-r from-uniguacu-blue to-uniguacu-red hover:from-uniguacu-red hover:to-uniguacu-blue text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="hidden sm:inline">Adicionar Projeto</span>
                  <span className="sm:hidden">+</span>
                </Link>
                
                {/* Perfil do usuário */}
                <div className="flex items-center gap-4">
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-semibold text-gray-900">{user.nomeCompleto}</p>
                    <p className="text-xs text-gray-500">{user.role === 'ROLE_ADMIN' ? 'Administrador' : 'Usuário'}</p>
                  </div>
                  
                  <Link href="/perfil" className="group">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-uniguacu-blue to-uniguacu-red p-0.5 group-hover:scale-110 transition-transform duration-300">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center relative overflow-hidden">
                        {user.fotoUrl ? (
                          <Image
                            src={`http://localhost:8080/api/files/${user.fotoUrl}`}
                            alt={`Foto de ${user.nomeCompleto}`}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-full"
                          />
                        ) : (
                          <span className="text-lg font-bold text-uniguacu-blue">
                            {user.nomeCompleto.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Botão Logout */}
                  <button 
                    onClick={logout} 
                    className="flex items-center px-4 py-2 text-sm font-semibold text-gray-600 hover:text-uniguacu-red transition-colors duration-200 bg-gray-50 hover:bg-red-50 rounded-lg"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden sm:inline">Sair</span>
                  </button>
                </div>
              </>
            ) : (
              // Usuário não logado
              <div className="flex items-center gap-4">
                <Link 
                  href="/login" 
                  className="text-sm font-semibold text-gray-700 hover:text-uniguacu-blue transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Entrar
                </Link>
                <Link 
                  href="/cadastro" 
                  className="bg-gradient-to-r from-uniguacu-blue to-uniguacu-red hover:from-uniguacu-red hover:to-uniguacu-blue text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Cadastre-se
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}