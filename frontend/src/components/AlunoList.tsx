'use client';

import useSWR from 'swr';
import Image from 'next/image';

type Aluno = {
  id: number;
  nomeCompleto: string;
  email: string;
  fotoUrl: string | null;
  curso: string;
  turno: string;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Ocorreu um erro ao buscar os dados.');
  }
  return res.json();
};

export const AlunoList = () => {
  const { data: alunos, error, isLoading } = useSWR<Aluno[]>('http://localhost:8080/api/users/alunos', fetcher);

  if (isLoading) {
    return <p className="text-center py-10">Carregando alunos...</p>;
  }

  if (error) {
    return <p className="text-center text-uniguacu-red py-10">Falha ao carregar a lista de alunos.</p>;
  }

  if (!alunos || alunos.length === 0) {
    return <p className="text-center text-gray-500 py-10">Nenhum aluno cadastrado ainda.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {alunos.map((aluno) => (
        <div key={aluno.id} className="border rounded-lg shadow-lg bg-white p-5 text-center flex flex-col items-center transition-transform duration-300 hover:scale-105">
          
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4 relative bg-uniguacu-blue/10 flex items-center justify-center">
            {aluno.fotoUrl ? (
              // Se tiver foto, mostra a imagem
              <Image
                src={`http://localhost:8080/api/files/${aluno.fotoUrl}`}
                alt={`Foto de ${aluno.nomeCompleto}`}
                layout="fill"
                objectFit="cover"
              />
            ) : (
              // Se NÃO tiver foto, mostra a primeira letra do nome
              <span className="text-4xl font-bold text-uniguacu-blue">
                {aluno.nomeCompleto.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <h2 className="text-lg font-semibold text-uniguacu-blue">{aluno.nomeCompleto}</h2>
          <p className="text-sm text-gray-600">{aluno.curso}</p>
          <p className="text-xs text-gray-400 mt-2">{aluno.email}</p>
        </div>
      ))}
    </div>
  );
};