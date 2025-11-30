'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // Hook para autenticação
import useSWR, { mutate } from 'swr'; // Importando SWR e mutate
import { ComentariosSection } from '@/components/ComentariosSection'; // Importa a nova seção
import { StarRating } from '@/components/StarRating'; // Importar se for usar diretamente aqui
import { getApiEndpoint, getFileUrl } from '@/lib/api';

// Tipo para o objeto Artefato
type Artefato = {
  id: number;
  titulo: string;
  descricao: string;
  urlImagemPrincipal: string;
  autor: string; // Pode conter múltiplos nomes separados por vírgula
  curso: string;
  campus: string;
  categoria: string;
  semestre: number;
  dataCriacao: string; // Assumindo formato YYYY-MM-DD
  status: string;
  listaImagens: string; // JSON string com array de imagens
  listaDocumentos: string; // JSON string com array de documentos
  videoYoutubeUrl: string | null;
};

// Fetcher para SWR
const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) {
        if (res.status === 404) throw new Error('Projeto não encontrado.');
        throw new Error('Falha ao buscar dados do projeto.');
    }
    return res.json();
});

export default function ArtefatoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string; // Garante que id seja string
  // Pegamos também isAdmin do contexto
  const { isAuthenticated, token, isAdmin } = useAuth();
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Função para fechar modal com ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown);
      // Previne scroll do body quando modal está aberto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  // Busca os dados do artefato usando SWR
  // O SWR lida com loading, error e data automaticamente
  const artefatoUrl = id ? getApiEndpoint(`/api/artefatos/${id}`) : null;
  const { data: artefato, error, isLoading, mutate: mutateArtefato } = useSWR<Artefato>(
      artefatoUrl,
      fetcher
  );

  // Função para Deletar (Somente Admin)
  const handleDelete = async () => {
      // Verifica se o artefato existe, se o usuário está logado e se é admin
      if (!artefato || !token || !isAdmin) {
          setActionError("Apenas administradores podem deletar projetos.");
          return;
      }
      // Confirmação com o usuário
      if (window.confirm('Tem certeza que deseja deletar este projeto? Esta ação não pode ser desfeita.')) {
          setActionError(null);
          try {
              const response = await fetch(getApiEndpoint(`/api/artefatos/${id}`), {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${token}` }
              });
              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Falha ao deletar o projeto. Verifique suas permissões.');
              }

              // Invalida cache da lista principal e redireciona
              const apiUrl = getApiEndpoint('/api/artefatos');
              mutate((key) => typeof key === 'string' && key.startsWith(apiUrl));
              router.push('/');

          } catch (err) {
              setActionError(err instanceof Error ? err.message : 'Erro desconhecido ao deletar');
          }
      }
  };

  // Função para Aprovar (Somente Admin e se Pendente)
  const handleApprove = async () => {
      setActionError(null);
       // Verifica se o artefato existe, se está pendente, se o usuário está logado e se é admin
      if (!token || !artefato || artefato.status !== 'PENDENTE' || !isAdmin) {
           setActionError("Apenas administradores podem aprovar projetos pendentes.");
           return;
      }

      try {
          const response = await fetch(getApiEndpoint(`/api/artefatos/${artefato.id}/aprovar`), {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Falha ao aprovar o projeto.');
          }

          // Atualiza o cache local da SWR para *este* artefato imediatamente
          mutateArtefato({ ...artefato, status: 'APROVADO' }, false);

          // Invalida o cache da lista principal para a home atualizar
          const apiUrl = getApiEndpoint('/api/artefatos');
          mutate((key) => typeof key === 'string' && key.startsWith(apiUrl));
          alert('Projeto aprovado com sucesso!');

      } catch (err) {
          setActionError(err instanceof Error ? err.message : 'Erro desconhecido ao aprovar');
      }
  };

  // --- Renderização ---

  // Estado de Carregamento
  if (isLoading) return (
    <main className="container mx-auto p-8 text-center">
      <p>Carregando detalhes do projeto...</p>
    </main>
  );

  // Estado de Erro na Busca
  if (error) return (
     <main className="container mx-auto p-8 text-center">
       <p className="text-uniguacu-red">{error.message}</p>
       <Link href="/" className="mt-4 inline-block underline">Voltar para a lista</Link>
     </main>
  );

  // Estado de Projeto Não Encontrado (caso a API retorne null ou SWR não tenha dados)
  if (!artefato) return (
     <main className="container mx-auto p-8 text-center">
       <p>Projeto não encontrado.</p>
       <Link href="/" className="mt-4 inline-block underline">Voltar para a lista</Link>
     </main>
  );

  // Separa a string de autores em um array para exibição na lista
  const autoresList = artefato?.autor ? artefato.autor.split(',').map(name => name.trim()) : [];

  // Processa as listas de imagens e documentos do JSON
  const imagensList = artefato?.listaImagens ? JSON.parse(artefato.listaImagens) : [];
  const documentosList = artefato?.listaDocumentos ? JSON.parse(artefato.listaDocumentos) : [];

  // Debug: log do estado selectedImage e dados do artefato
  console.log('selectedImage state:', selectedImage);
  console.log('artefato.urlImagemPrincipal:', artefato?.urlImagemPrincipal);
  console.log('URL completa da imagem:', getFileUrl(artefato?.urlImagemPrincipal) || 'N/A');

  // Lógica para determinar se os botões de Edição/Deleção devem aparecer
  // APENAS ADMIN pode editar/deletar projetos (seja qual for o status).
  const canAdminActions = isAdmin;

  // --- JSX Principal ---
  return (
    <main>
      {/* Seção da Imagem de Destaque */}
      <section className="relative h-80 md:h-[500px] overflow-hidden">
        {artefato.urlImagemPrincipal ? (
          <>
            <img
              src={getFileUrl(artefato.urlImagemPrincipal) || ''}
              alt={`Imagem do projeto ${artefato.titulo}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.log('Erro ao carregar imagem principal:', artefato.urlImagemPrincipal);
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => {
                console.log('Imagem principal carregada com sucesso:', artefato.urlImagemPrincipal);
              }}
            />
            {/* Overlay gradiente mais elegante */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-uniguacu-blue to-uniguacu-red flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="text-white text-2xl font-semibold">Sem Imagem</span>
            </div>
          </div>
        )}
        
        {/* Conteúdo sobreposto melhorado */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-6 pb-8">
            <div className="max-w-4xl">
              {/* Badge do curso */}
              <div className="mb-4">
                <span className="bg-white/90 backdrop-blur-sm text-uniguacu-red text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                  {artefato.curso || 'Sem curso'}
                </span>
              </div>
              
              {/* Título principal */}
              <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-2xl mb-4 leading-tight">
                {artefato.titulo}
              </h1>
              
              {/* Informações adicionais */}
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{artefato.autor}</span>
                </div>
                {artefato.campus && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>{artefato.campus}</span>
                  </div>
                )}
                {artefato.semestre && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span>{artefato.semestre}º Semestre</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Principal com Duas Colunas */}
      <section className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Coluna Esquerda: Informações Contextuais e Ações */}
        <aside className="lg:col-span-1 space-y-6">
           {/* Autores */}
           <div>
               <h2 className="text-lg font-semibold text-uniguacu-blue mb-2 border-b pb-1">PESSOAS NO PROJETO</h2>
               <h3 className="text-sm font-bold text-gray-600 mb-1 uppercase">Autor(es)</h3>
               <ul className="space-y-1 text-gray-700">
                   {autoresList.map((nome, index) => (
                       <li key={index} className="flex items-center gap-2 text-sm">
                           <span className="flex items-center justify-center w-6 h-6 bg-uniguacu-blue text-white rounded-full text-xs font-bold flex-shrink-0">
                               {nome.substring(0, 1).toUpperCase()}
                           </span>
                           {nome}
                       </li>
                   ))}
               </ul>
           </div>
           {/* Semestre */}
           <div>
               <h3 className="text-sm font-bold text-gray-600 mb-1 uppercase">Semestre</h3>
               <p className="text-gray-700">{artefato.semestre ? `${artefato.semestre}º` : 'Não informado'}</p>
           </div>
           {/* Campus */}
           <div>
               <h3 className="text-sm font-bold text-gray-600 mb-1 uppercase">Campus</h3>
               <p className="text-gray-700">{artefato.campus || 'Não informado'}</p>
           </div>
            {/* Status e Ações Administrativas */}
            <div className="bg-gray-50 p-4 rounded border sticky top-24"> {/* sticky top para fixar ao rolar */}
                 <h3 className="text-sm font-bold text-gray-600 mb-2 uppercase">Status</h3>
                 <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-4 ${
                    artefato.status === 'APROVADO' ? 'bg-green-100 text-green-800' :
                    artefato.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800' // Adicionando um estilo para REJEITADO, se houver
                 }`}>
                    {artefato.status}
                </span>

                {/* Botões de Ação só aparecem se o usuário estiver logado */}
                {isAuthenticated && (
                  <div className="mt-4 space-y-2">
                     {actionError && <p className="text-red-500 text-xs mb-2">{actionError}</p>}

                    {/* Botão Aprovar: Somente Admin e se PENDENTE */}
                    {isAdmin && artefato.status === 'PENDENTE' && (
                        <button
                            onClick={handleApprove}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors"
                        >
                            Aprovar Projeto
                        </button>
                    )}

                    {/* Botões Editar/Deletar: Apenas Admin pode executar */}
                    {isAdmin && ( // Verifica se é Admin
                        <>
                            <Link
                              href={`/artefatos/${id}/editar`}
                              className="block w-full text-center bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors"
                            >
                              Editar Informações
                            </Link>
                            <button
                              onClick={handleDelete}
                              className="w-full bg-uniguacu-red hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors"
                            >
                              Deletar Projeto
                            </button>
                        </>
                    )}
                  </div>
                )}
                 {/* Mensagem para usuário não logado */}
                 {!isAuthenticated && (
                     <p className="text-xs text-gray-500 mt-4">Faça login como administrador para gerenciar este projeto.</p>
                 )}
            </div>
            <Link href="/" className="text-sm hover:underline mt-4 inline-block">&larr; Voltar para a lista</Link>
        </aside>

        {/* Coluna Direita: Detalhes do Projeto */}
        <section className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-uniguacu-blue mb-3 border-b pb-2">SOBRE O PROJETO</h2>
                {/* Usando prose para melhor formatação de texto longo */}
                <div className="prose prose-sm max-w-none text-gray-700 space-y-3">
                    <p dangerouslySetInnerHTML={{ __html: artefato.descricao.replace(/\n/g, '<br />') }} />
                </div>
            </div>
             <div>
                <h3 className="text-sm font-bold text-gray-600 mb-1 uppercase">Curso Envolvido</h3>
                <p className="text-gray-700">{artefato.curso || 'Não informado'}</p>
            </div>
             <div>
                <h3 className="text-sm font-bold text-gray-600 mb-1 uppercase">Categoria</h3>
                <p className="text-gray-700">{artefato.categoria || 'Não informada'}</p>
            </div>
             <div>
                <h3 className="text-sm font-bold text-gray-600 mb-1 uppercase">Data de Criação</h3>
                {/* Formatando a data de forma mais segura */}
                <p className="text-gray-700">
                    {artefato.dataCriacao
                        ? new Date(artefato.dataCriacao + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' })
                        : 'Não informada'}
                </p>
            </div>

                {/* Seção de Mídias */}
                <div className="border-t pt-8">
                    <h2 className="text-2xl font-bold text-uniguacu-blue mb-6 flex items-center">
                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Galeria de Mídias
                    </h2>
                    {imagensList.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {imagensList.map((imagem: string, index: number) => (
                                <div 
                                    key={index} 
                                    className="relative group cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                                    onClick={() => {
                                        console.log('Clique na imagem:', imagem);
                                        setSelectedImage(getFileUrl(imagem) || '');
                                    }}
                                >
                                    <div className="aspect-square overflow-hidden">
                                        <img
                                            src={getFileUrl(imagem) || ''}
                                            alt={`Imagem ${index + 1} do projeto`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    
                                    {/* Overlay com ícone de zoom */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                                                <svg className="w-6 h-6 text-uniguacu-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Número da imagem */}
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold text-uniguacu-blue shadow-sm">
                                        {index + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-gray-500 text-lg font-medium">Nenhuma mídia adicionada ainda</p>
                            <p className="text-gray-400 text-sm mt-2">As imagens do projeto aparecerão aqui</p>
                        </div>
                    )}
                
                {/* Vídeo do YouTube */}
                {artefato.videoYoutubeUrl && (
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold text-uniguacu-blue mb-2">Vídeo do Projeto</h3>
                        <div className="aspect-video">
                            <iframe
                                src={`https://www.youtube.com/embed/${artefato.videoYoutubeUrl.split('v=')[1]?.split('&')[0] || artefato.videoYoutubeUrl.split('/').pop()}`}
                                title="Vídeo do projeto"
                                className="w-full h-full rounded-lg"
                                allowFullScreen
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Seção de Documentos */}
            <div className="border-t pt-6">
                <h2 className="text-xl font-semibold text-uniguacu-blue mb-3">DOCUMENTOS DO PROJETO</h2>
                {documentosList.length > 0 ? (
                    <div className="space-y-3">
                        {documentosList.map((doc: {nome: string, url: string}, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-gray-700 font-medium">{doc.nome}</span>
                                </div>
                                <a
                                    href={getFileUrl(doc.url) || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1 bg-uniguacu-blue text-white text-sm rounded hover:bg-opacity-80 transition-colors"
                                >
                                    Baixar
                                </a>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic text-sm">Nenhum documento adicionado ainda.</p>
                )}
            </div>

             {/* NOVA SEÇÃO DE COMENTÁRIOS */}
             <ComentariosSection artefatoId={artefato.id} />

        </section>
      </section>

          {/* Modal de Ampliação de Imagem */}
          {selectedImage && (
            <div 
              className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => {
                console.log('Fechando modal');
                setSelectedImage(null);
              }}
            >
              <div className="relative max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
                <img
                  src={selectedImage}
                  alt="Imagem ampliada"
                  className="max-w-full max-h-[80vh] object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
                
                {/* Botão de fechar melhorado */}
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                {/* Instrução de uso */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                  Pressione ESC ou clique fora para fechar
                </div>
              </div>
            </div>
          )}
    </main>
  );
}
