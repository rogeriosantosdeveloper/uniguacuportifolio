'use client';

import React from 'react';

type FilterState = {
  curso: string;
  campus: string;
  categoria: string;
  semestre: string;
  dataInicial: string;
  dataFinal: string;
};

interface SearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onSearch: () => void;
}

const filterOptions = {
    cursos: ['Administração', 'Análise e Desenvolvimento de Sistemas', 'Ciências Contábeis', 'Direito', 'Educação Física', 'Enfermagem', 'Engenharia Agronômica', 'Engenharia Civil', 'Engenharia de Software', 'Fisioterapia', 'Gestão de Recursos Humanos', 'Medicina Veterinária', 'Pedagogia', 'Psicologia', 'Terapia Ocupacional', 'Zootecnia'],
    campus: ['São Miguel do Iguaçu', 'Cascavel', 'Foz do Iguaçu'],
    categorias: ['Pesquisa', 'Extensão', 'Inovação Tecnológica', 'TCC'],
    semestres: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
};

export function SearchAndFilter({ searchTerm, setSearchTerm, filters, setFilters, onSearch }: SearchAndFilterProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev: FilterState) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      curso: '',
      campus: '',
      categoria: '',
      semestre: '',
      dataInicial: '',
      dataFinal: '',
    });
  };

  const hasActiveFilters = searchTerm || Object.values(filters).some(value => value !== '');

  return (
    <section className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
      {/* Header da seção */}
      <div className="bg-gradient-to-r from-uniguacu-blue to-uniguacu-red px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-xl font-bold text-white">Buscar Projetos</h2>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      <div className="p-8">
        <form onSubmit={handleSubmit}>
          {/* Barra de Busca Principal Melhorada */}
          <div className="relative mb-8">
            <div className="flex items-center bg-gray-50 rounded-2xl border-2 border-gray-200 focus-within:border-uniguacu-blue focus-within:bg-white transition-all duration-300 shadow-sm hover:shadow-md">
              <div className="flex-1 px-6 py-4">
                <input
                  type="text"
                  placeholder="Pesquisar por título ou autor do projeto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-gray-700 leading-tight focus:outline-none bg-transparent placeholder-gray-500 text-lg"
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-uniguacu-blue to-uniguacu-red hover:from-uniguacu-red hover:to-uniguacu-blue text-white font-bold py-4 px-8 rounded-r-2xl transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar
              </button>
            </div>
          </div>
          
          {/* Filtros Organizados */}
          <div className="space-y-6">
            {/* Primeira linha - Filtros principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Filtro de Cursos */}
              <div className="space-y-2">
                <label htmlFor="curso" className="block text-sm font-semibold text-gray-700 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-uniguacu-blue" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM6.18 17.901a1 1 0 001.78 0l5.5-11a1 1 0 00-1.78-1.78L6.18 17.901z" />
                  </svg>
                  Curso
                </label>
                <select 
                  id="curso" 
                  name="curso" 
                  value={filters.curso} 
                  onChange={handleInputChange} 
                  className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-uniguacu-blue focus:ring-2 focus:ring-uniguacu-blue/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                >
                  <option value="">Todos os Cursos</option>
                  {filterOptions.cursos.map((curso) => (
                    <option key={curso} value={curso}>{curso}</option>
                  ))}
                </select>
              </div>

              {/* Filtro de Campus */}
              <div className="space-y-2">
                <label htmlFor="campus" className="block text-sm font-semibold text-gray-700 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-uniguacu-blue" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Campus
                </label>
                <select 
                  id="campus" 
                  name="campus" 
                  value={filters.campus} 
                  onChange={handleInputChange} 
                  className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-uniguacu-blue focus:ring-2 focus:ring-uniguacu-blue/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                >
                  <option value="">Todos os Campus</option>
                  {filterOptions.campus.map((campus) => (
                    <option key={campus} value={campus}>{campus}</option>
                  ))}
                </select>
              </div>

              {/* Filtro de Categorias */}
              <div className="space-y-2">
                <label htmlFor="categoria" className="block text-sm font-semibold text-gray-700 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-uniguacu-blue" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Categoria
                </label>
                <select 
                  id="categoria" 
                  name="categoria" 
                  value={filters.categoria} 
                  onChange={handleInputChange} 
                  className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-uniguacu-blue focus:ring-2 focus:ring-uniguacu-blue/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                >
                  <option value="">Todas as Categorias</option>
                  {filterOptions.categorias.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Filtro de Semestre */}
              <div className="space-y-2">
                <label htmlFor="semestre" className="block text-sm font-semibold text-gray-700 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-uniguacu-blue" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  Semestre
                </label>
                <select 
                  id="semestre" 
                  name="semestre" 
                  value={filters.semestre} 
                  onChange={handleInputChange} 
                  className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-uniguacu-blue focus:ring-2 focus:ring-uniguacu-blue/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                >
                  <option value="">Qualquer Semestre</option>
                  {filterOptions.semestres.map((sem) => (
                    <option key={sem} value={sem}>{sem}º Semestre</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Segunda linha - Filtros de data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Filtro de Data Inicial */}
              <div className="space-y-2">
                <label htmlFor="dataInicial" className="block text-sm font-semibold text-gray-700 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-uniguacu-blue" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  Data Inicial
                </label>
                <input
                  type="date"
                  id="dataInicial"
                  name="dataInicial"
                  value={filters.dataInicial}
                  onChange={handleInputChange}
                  className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-uniguacu-blue focus:ring-2 focus:ring-uniguacu-blue/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                />
              </div>

              {/* Filtro de Data Final */}
              <div className="space-y-2">
                <label htmlFor="dataFinal" className="block text-sm font-semibold text-gray-700 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-uniguacu-blue" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  Data Final
                </label>
                <input
                  type="date"
                  id="dataFinal"
                  name="dataFinal"
                  value={filters.dataFinal}
                  onChange={handleInputChange}
                  className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-uniguacu-blue focus:ring-2 focus:ring-uniguacu-blue/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}