'use client';

import { useState, useEffect } from 'react';

type Aluno = {
  id: number;
  nome: string;
  curso: string;
  campus: string;
  semestre: number;
};

export function AlunoList() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/alunos');
        const data = await response.json();
        setAlunos(data);
      } catch (error) {
        console.error("Falha ao buscar alunos", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlunos();
  }, []);

  if (loading) return <p className="text-center mt-8">Carregando alunos...</p>;
  if (alunos.length === 0) return <p className="text-center mt-8 text-gray-500">Nenhum aluno cadastrado.</p>;


  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {alunos.map((aluno) => (
          <div key={aluno.id} className="bg-white p-5 rounded-lg shadow-md text-center hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-bold text-uniguacu-blue mb-1">{aluno.nome}</h3>
            <p className="text-gray-700 text-sm">{aluno.curso}</p>
            <p className="text-gray-500 text-xs mt-1">{aluno.campus} - {aluno.semestre}º Semestre</p>
          </div>
        ))}
      </div>
    </section>
  );
}