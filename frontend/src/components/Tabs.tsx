'use client';
import { PhotoIcon, UsersIcon } from '@heroicons/react/24/outline'; 

type TabsProps = {
  activeTab: 'projetos' | 'alunos';
  setActiveTab: (tab: 'projetos' | 'alunos') => void;
};

export const Tabs = ({ activeTab, setActiveTab }: TabsProps) => {
  return (
    <div className="border-b border-gray-200">
      {/* ================== CORREÇÃO: CENTRALIZAR AS ABAS ================== */}
      <div className="container mx-auto px-4 -mb-px flex justify-center">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('projetos')}
            className={`py-4 px-1 inline-flex items-center gap-2 text-lg font-medium transition-all duration-300 ${
              activeTab === 'projetos'
                ? 'border-b-2 border-uniguacu-red text-uniguacu-red'
                : 'border-b-2 border-transparent text-gray-500 hover:text-uniguacu-red'
            }`}
          >
            {/* ================== ÍCONE PhotoIcon ================== */}
            <PhotoIcon className="h-6 w-6" /> {/* Ícone de foto */}
            PROJETOS
          </button>
          
          <button
            onClick={() => setActiveTab('alunos')}
            className={`py-4 px-1 inline-flex items-center gap-2 text-lg font-medium transition-all duration-300 ${
              activeTab === 'alunos'
                ? 'border-b-2 border-uniguacu-red text-uniguacu-red'
                : 'border-b-2 border-transparent text-gray-500 hover:text-uniguacu-red'
            }`}
          >
            {/* ================== ÍCONE UsersIcon ================== */}
            <UsersIcon className="h-6 w-6" /> {/* Ícone de pessoas */}
            ALUNOS
          </button>
        </nav>
      </div>
    </div>
  );
};