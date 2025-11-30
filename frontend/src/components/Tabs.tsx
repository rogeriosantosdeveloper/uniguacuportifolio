'use client';
import { PhotoIcon, UsersIcon } from '@heroicons/react/24/outline'; 

type TabsProps = {
  activeTab: 'projetos' | 'alunos';
  setActiveTab: (tab: 'projetos' | 'alunos') => void;
};

export const Tabs = ({ activeTab, setActiveTab }: TabsProps) => {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6 py-6">
        <div className="flex justify-center">
          <nav className="flex bg-gray-100 rounded-3xl p-2 shadow-inner">
            <button
              onClick={() => setActiveTab('projetos')}
              className={`flex items-center gap-4 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                activeTab === 'projetos'
                  ? 'bg-white text-uniguacu-blue shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-uniguacu-blue hover:bg-white/50'
              }`}
            >
              <div className={`p-3 rounded-xl ${
                activeTab === 'projetos' 
                  ? 'bg-uniguacu-blue/10 text-uniguacu-blue' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                <PhotoIcon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <div className="font-bold">Projetos</div>
                <div className="text-sm font-normal opacity-75">Trabalhos acadêmicos</div>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('alunos')}
              className={`flex items-center gap-4 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                activeTab === 'alunos'
                  ? 'bg-white text-uniguacu-blue shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-uniguacu-blue hover:bg-white/50'
              }`}
            >
              <div className={`p-3 rounded-xl ${
                activeTab === 'alunos' 
                  ? 'bg-uniguacu-blue/10 text-uniguacu-blue' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                <UsersIcon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <div className="font-bold">Alunos</div>
                <div className="text-sm font-normal opacity-75">Perfis dos estudantes</div>
              </div>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};