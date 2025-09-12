'use client';
    
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { SearchAndFilter } from '@/components/SearchAndFilter';
import { Tabs } from '@/components/Tabs';
import { AlunoList } from '@/components/AlunoList';

type Artefato = { id: number; titulo: string; descricao: string; urlImagem: string; autor: string; curso: string; };
type FilterState = { curso: string; campus: string; categoria: string; semestre: string; dataInicial: string; dataFinal: string; };

export default function Home() {
  const [artefatos, setArtefatos] = useState<Artefato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({ curso: '', campus: '', categoria: '', semestre: '', dataInicial: '', dataFinal: '', });
  const [activeTab, setActiveTab] = useState<'projetos' | 'alunos'>('projetos');

  const fetchArtefatos = useCallback(async () => { 
    setLoading(true);
    const params = new URLSearchParams({ busca: searchTerm, ...filters });
    try {
      const response = await fetch(`http://localhost:8080/api/artefatos?${params.toString()}`);
      if (!response.ok) throw new Error('Falha ao buscar projetos');
      const data = await response.json();
      setArtefatos(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters]);
  
  useEffect(() => { 
    if (activeTab === 'projetos') {
      fetchArtefatos();
    }
  }, [activeTab, fetchArtefatos]);

  const handleSearch = () => { 
    fetchArtefatos();
  };

  return (
    <>
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
            {loading && <p className="text-center py-10">Carregando...</p>}
            {error && <p className="text-center text-uniguacu-red py-10">{error}</p>}
            {!loading && artefatos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artefatos.map((artefato) => (
                  <Link key={artefato.id} href={`/artefatos/${artefato.id}`} className="group block">
                    <div className="border rounded-lg shadow-lg h-full bg-white transition-all duration-300 group-hover:shadow-xl group-hover:scale-105 overflow-hidden">
                      <img src={`http://localhost:8080/api/files/${artefato.urlImagem}`} alt={artefato.titulo} className="w-full h-48 object-cover"/>
                      <div className="p-5">
                        <h3 className="font-bold text-sm text-uniguacu-red uppercase">{artefato.curso}</h3>
                        <h2 className="text-xl font-semibold mb-2 text-uniguacu-blue truncate">{artefato.titulo}</h2>
                        <p className="text-sm text-gray-500">Autor: {artefato.autor}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {!loading && !error && artefatos.length === 0 && (
              <p className="text-center text-gray-500 py-10">Nenhum projeto encontrado.</p>
            )}
          </>
        )}
        {activeTab === 'alunos' && (
          <AlunoList />
        )}
      </div>
    </>
  );
}