'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import Image from 'next/image';

import { SearchAndFilter } from '@/components/SearchAndFilter';
import { Tabs } from '@/components/Tabs';
import { AlunoList } from '@/components/AlunoList';
import { getApiEndpoint, getFileUrl } from '@/lib/api';


type Artefato = {
  id: number;
  titulo: string;
  descricao: string;
  urlImagemPrincipal: string;
  autor: string;
  curso: string;
};

type FilterState = {
  curso: string;
  campus: string;
  categoria: string;
  semestre: string;
  dataInicial: string;
  dataFinal: string;
};

const fetcher = (url: string) => {
  // NOTA: O token não é necessário aqui, pois a busca de artefatos é pública.
  // Deixei seu código, mas idealmente o token só é enviado em requisições protegidas.
  const token = localStorage.getItem('token');
  return fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }).then(res => {
    if (!res.ok) {
      throw new Error('Falha ao buscar dados');
    }
    return res.json();
  });
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'projetos' | 'alunos'>('projetos');

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    curso: '',
    campus: '',
    categoria: '',
    semestre: '',
    dataInicial: '',
    dataFinal: '',
  });

  const params = new URLSearchParams();
  if (searchTerm) params.append('busca', searchTerm);
  Object.entries(filters).forEach(([key, value]) => {
      if (value) {
          params.append(key, value);
      }
  });

  const {
    data: artefatos,
    error,
    isLoading
  } = useSWR<Artefato[]>(getApiEndpoint(`/api/artefatos?${params.toString()}`), fetcher);

  const handleSearch = () => {
    // A lógica de revalidação já é cuidada pelo SWR quando `params` muda
  };

  return (
    <>
      {/* Hero Section com Banner */}
      <section className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
        {/* Banner de fundo */}
        <div className="absolute inset-0">
          <Image
            src="/banner-uniguacu.jpg"
            alt="Banner Uniguaçu"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

        <div className="container mx-auto px-6 py-20 relative z-10 h-full flex items-center justify-center">
          {/* Título da seção */}
          <div className="text-center w-full">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 drop-shadow-2xl">
              Portfólio Acadêmico
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-white/90 max-w-4xl mx-auto drop-shadow-lg">
              Explore os projetos e conheça os alunos da Faculdade Uniguaçu
            </p>
          </div>
        </div>
      </section>

      {/* Seção de Navegação */}
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-6 py-12">
        {activeTab === 'projetos' && (
          <>
            <SearchAndFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filters={filters}
              setFilters={setFilters}
              onSearch={handleSearch}
            />

            {/* Estados de Loading e Erro */}
            {isLoading && (
              <div className="text-center py-16">
                <div className="inline-flex items-center px-6 py-3 bg-white rounded-2xl shadow-lg">
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-uniguacu-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-lg font-semibold text-gray-700">Carregando projetos...</span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="text-center py-16">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
                  <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar</h3>
                  <p className="text-red-600">{error.message}</p>
                </div>
              </div>
            )}
            
            {!isLoading && artefatos && artefatos.length === 0 && (
              <div className="text-center py-16">
                <div className="bg-white rounded-2xl shadow-lg p-12 max-w-lg mx-auto">
                  <svg className="w-20 h-20 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 5c-2.34 0-4.29 1.009-5.824 2.709" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum projeto encontrado</h3>
                  <p className="text-gray-500 mb-6">Tente ajustar os filtros de busca para encontrar mais projetos.</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilters({
                        curso: '',
                        campus: '',
                        categoria: '',
                        semestre: '',
                        dataInicial: '',
                        dataFinal: '',
                      });
                    }}
                    className="bg-gradient-to-r from-uniguacu-blue to-uniguacu-red text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            )}

            {/* Grid de Projetos */}
            {!isLoading && artefatos && artefatos.length > 0 && (
              <div className="space-y-8">
                {/* Contador de resultados */}
                <div className="text-center">
                  <p className="text-lg text-gray-600">
                    <span className="font-semibold text-uniguacu-blue">{artefatos.length}</span> 
                    {artefatos.length === 1 ? ' projeto encontrado' : ' projetos encontrados'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {artefatos.map((artefato) => (
                    <Link key={artefato.id} href={`/artefatos/${artefato.id}`} className="group block">
                      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-2 overflow-hidden border border-gray-100">
                        {/* Container da imagem com overlay gradiente */}
                        <div className="relative h-56 overflow-hidden">
                          {artefato.urlImagemPrincipal ? (
                            <>
                              <img
                                src={getFileUrl(artefato.urlImagemPrincipal) || ''}
                                alt={artefato.titulo}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              {/* Overlay gradiente sutil */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-uniguacu-blue/20 to-uniguacu-red/20 flex items-center justify-center">
                              <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-uniguacu-blue to-uniguacu-red rounded-full flex items-center justify-center mx-auto mb-2">
                                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                  </svg>
                                </div>
                                <p className="text-gray-500 text-sm">Sem imagem</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Badge do curso */}
                          <div className="absolute top-4 left-4">
                            <span className="bg-white/90 backdrop-blur-sm text-uniguacu-red text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                              {artefato.curso || 'Sem curso'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Conteúdo do card */}
                        <div className="p-6">
                          <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-uniguacu-blue transition-colors duration-300" title={artefato.titulo}>
                            {artefato.titulo}
                          </h2>
                          
                          <div className="flex items-center text-gray-600 mb-4">
                            <svg className="w-4 h-4 mr-2 text-uniguacu-blue" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">{artefato.autor}</span>
                          </div>
                          
                          {/* Botão de ação sutil */}
                          <div className="flex items-center justify-between">
                            <span className="text-uniguacu-blue text-sm font-semibold group-hover:text-uniguacu-red transition-colors duration-300">
                              Ver detalhes
                            </span>
                            <svg className="w-5 h-5 text-uniguacu-blue group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'alunos' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <AlunoList />
          </div>
        )}
      </div>
    </>
  );
}