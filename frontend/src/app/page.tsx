'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import Image from 'next/image'; // Importe o componente de Imagem

import { SearchAndFilter } from '@/components/SearchAndFilter';
import { Tabs } from '@/components/Tabs';
import { AlunoList } from '@/components/AlunoList';

// Tipos para nossos dados
type Artefato = {
  id: number;
  titulo: string;
  descricao: string;
  urlImagem: string;
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
  // Se houver um token, adicione ao cabeçalho. Adapte conforme necessário.
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
  } = useSWR<Artefato[]>(`http://localhost:8080/api/artefatos?${params.toString()}`, fetcher);

  const handleSearch = () => {
    // A lógica de revalidação já é cuidada pelo SWR quando `params` muda
  };

  return (
    <main>
      {/* IMAGEM DO BANNER ADICIONADA AQUI */}
      <div className="w-full mb-8">
        <Image
          src="/banner-uniguacu.jpg" // Nome do arquivo na pasta /public
          alt="Faculdade Uniguaçu - Nota máxima no MEC"
          width={1920}
          height={640}
          layout="responsive"
          priority
        />
      </div>

      {/* ABAS MOVIDAS PARA BAIXO DA IMAGEM */}
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="container mx-auto px-4 py-8">
        {activeTab === 'projetos' && (
          <>
            <SearchAndFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filters={filters}
              setFilters={setFilters}
              onSearch={handleSearch}
            />

            {isLoading && <p className="text-center py-10">Carregando projetos...</p>}
            {error && <p className="text-center text-uniguacu-red py-10">Falha ao carregar os projetos.</p>}
            
            {!isLoading && artefatos && artefatos.length === 0 && (
              <p className="text-center text-gray-500 py-10">Nenhum projeto encontrado com os filtros selecionados.</p>
            )}

            {!isLoading && artefatos && artefatos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artefatos.map((artefato) => (
                  <Link key={artefato.id} href={`/artefatos/${artefato.id}`} className="group block">
                    <div className="border rounded-lg shadow-lg h-full bg-white transition-all duration-300 group-hover:shadow-xl group-hover:scale-105 overflow-hidden">
                      {artefato.urlImagem && (
                        <img
                          src={`http://localhost:8080/api/files/${artefato.urlImagem}`}
                          alt={artefato.titulo}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-5">
                        <h3 className="font-bold text-sm text-uniguacu-red uppercase">{artefato.curso || 'Sem curso'}</h3>
                        <h2 className="text-xl font-semibold mb-2 text-uniguacu-blue truncate" title={artefato.titulo}>{artefato.titulo}</h2>
                        <p className="text-sm text-gray-500">Autor: {artefato.autor}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'alunos' && (
          // Ação Importante: Certifique-se que este componente busca os dados
          // do novo endpoint: /api/users/alunos
          <AlunoList />
        )}
      </div>
    </main>
  );
}