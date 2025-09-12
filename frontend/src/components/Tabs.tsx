'use client';

interface TabsProps {
  activeTab: string;
  setActiveTab: (tab: 'projetos' | 'alunos') => void;
}

export function Tabs({ activeTab, setActiveTab }: TabsProps) {
  const activeClass = 'border-b-2 border-uniguacu-red text-uniguacu-red';
  const inactiveClass = 'text-gray-500 hover:text-uniguacu-blue';

  return (
    <section className="mb-8 border-b-2 border-gray-200">
      <div className="container mx-auto flex gap-8 px-4"> {/* Adicione px-4 para consistência */}
        <button
          onClick={() => setActiveTab('projetos')}
          className={`py-3 px-4 font-semibold transition-colors duration-300 ${activeTab === 'projetos' ? activeClass : inactiveClass}`}
        >
          Projetos
        </button>
        <button
          onClick={() => setActiveTab('alunos')}
          className={`py-3 px-4 font-semibold transition-colors duration-300 ${activeTab === 'alunos' ? activeClass : inactiveClass}`}
        >
          Alunos
        </button>
      </div>
    </section>
  );
}