'use client';
    
import { useState, useCallback } from 'react';
import Link from 'next/link';
import useSWR from 'swr'; // 1. Importando o hook principal da SWR

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

// 2. Função "Fetcher": Uma função simples que a SWR usará para buscar os dados.
//    Ela pode ser definida aqui ou em um arquivo de utilitários separado.
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Home() {
  const [activeTab, setActiveTab] = useState<'projetos' | 'alunos'>('projetos');
  
  // Estados para controlar os filtros, gerenciados por esta página
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    curso: '',
    campus: '',
    categoria: '',
    semestre: '',
    dataInicial: '',
    dataFinal: '',
  });

  // 3. Usando SWR: Substituímos o useEffect e vários useStates por um único hook.
  //    Ele nos dá os dados, o estado de erro e o estado de carregamento (isLoading).
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
  
  // A SWR é reativa. Apenas mudando os filtros (e consequentemente a URL),
  // a busca será refeita. A função handleSearch pode ser usada para outras lógicas se necessário.
  const handleSearch = () => {
    // No futuro, poderíamos adicionar lógicas aqui, como salvar a busca no histórico.
    // A SWR já cuida da re-validação dos dados quando a URL muda.
  };

  return (
    <main>
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
            
            {/* Lógica de exibição com base no estado da SWR */}
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
          <AlunoList />
        )}
      </div>
    </main>
  );
}