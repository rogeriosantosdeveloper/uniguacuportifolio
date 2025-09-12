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

  return (
    <section className="bg-white p-6 rounded-lg shadow-md mb-8">
      <form onSubmit={handleSubmit}>
        {/* Barra de Busca Principal */}
        <div className="flex flex-col md:flex-row items-center border-2 border-gray-200 rounded-full focus-within:border-uniguacu-blue transition-all duration-300">
          <input
            type="text"
            placeholder="Pesquisar por título ou autor do projeto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 px-6 text-gray-700 leading-tight focus:outline-none bg-transparent rounded-full md:rounded-l-full md:rounded-r-none border-none"
          />
          <button
            type="submit"
            className="w-full md:w-auto bg-uniguacu-blue hover:bg-uniguacu-red text-white font-bold py-3 px-8 rounded-full m-1 transition-colors duration-300 flex-shrink-0"
          >
            Buscar
          </button>
        </div>
        
        {/* ======================= ESTRUTURA DOS FILTROS ======================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
          
          {/* Filtro de Cursos */}
          <div className="flex flex-col">
            <label htmlFor="curso" className="text-xs text-gray-500 mb-1 ml-2">Cursos</label>
            <select id="curso" name="curso" value={filters.curso} onChange={handleInputChange} className="filter-select w-full">
              <option value="">Todos os Cursos</option>
              {filterOptions.cursos.map((curso) => (<option key={curso} value={curso}>{curso}</option>))}
            </select>
          </div>

          {/* Filtro de Campus */}
          <div className="flex flex-col">
            <label htmlFor="campus" className="text-xs text-gray-500 mb-1 ml-2">Campus</label>
            <select id="campus" name="campus" value={filters.campus} onChange={handleInputChange} className="filter-select w-full">
              <option value="">Todos os Campus</option>
              {filterOptions.campus.map((campus) => (<option key={campus} value={campus}>{campus}</option>))}
            </select>
          </div>

          {/* Filtro de Categorias */}
          <div className="flex flex-col">
            <label htmlFor="categoria" className="text-xs text-gray-500 mb-1 ml-2">Categorias</label>
            <select id="categoria" name="categoria" value={filters.categoria} onChange={handleInputChange} className="filter-select w-full">
              <option value="">Todas as Categorias</option>
              {filterOptions.categorias.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
          </div>

          {/* Filtro de Semestre */}
          <div className="flex flex-col">
            <label htmlFor="semestre" className="text-xs text-gray-500 mb-1 ml-2">Semestre</label>
            <select id="semestre" name="semestre" value={filters.semestre} onChange={handleInputChange} className="filter-select w-full">
              <option value="">Qualquer Semestre</option>
              {filterOptions.semestres.map((sem) => (<option key={sem} value={sem}>{sem}º Semestre</option>))}
            </select>
          </div>

          {/* Filtro de Data Inicial */}
          <div className="flex flex-col">
            <label htmlFor="dataInicial" className="text-xs text-gray-500 mb-1 ml-2">Data Inicial</label>
            <input
              type="date"
              id="dataInicial"
              name="dataInicial"
              value={filters.dataInicial}
              onChange={handleInputChange}
              className="filter-select w-full"
            />
          </div>

          {/* Filtro de Data Final */}
          <div className="flex flex-col">
            <label htmlFor="dataFinal" className="text-xs text-gray-500 mb-1 ml-2">Data Final</label>
            <input
              type="date"
              id="dataFinal"
              name="dataFinal"
              value={filters.dataFinal}
              onChange={handleInputChange}
              className="filter-select w-full"
            />
          </div>
        </div>
      </form>
    </section>
  );
}