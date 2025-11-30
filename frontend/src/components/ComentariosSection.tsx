'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useAuth } from '@/context/AuthContext';
import { StarRating } from './StarRating'; // Importa o componente de estrelas
import { getApiEndpoint } from '@/lib/api';

interface ComentarioDTO {
    id: number;
    artefatoId: number;
    nome: string;
    funcaoEmpresa?: string;
    texto: string;
    avaliacaoSolucao?: number;
    avaliacaoVideo?: number;
    avaliacaoImpacto?: number;
    dataCriacao: string;
}

interface ComentariosSectionProps {
    artefatoId: number;
}

const fetcher = (url: string) => fetch(url).then(res => {
    if(!res.ok) throw new Error("Falha ao buscar comentários.");
    return res.json();
});

export function ComentariosSection({ artefatoId }: ComentariosSectionProps) {
    const { token, user } = useAuth(); // Pega o usuário logado para preencher o nome
    const comentariosUrl = getApiEndpoint(`/api/artefatos/${artefatoId}/comentarios`);

    const { data: comentarios, error, isLoading } = useSWR<ComentarioDTO[]>(comentariosUrl, fetcher);

    // Estados do formulário de novo comentário
    const [nome, setNome] = useState(user?.nomeCompleto || '');
    const [funcaoEmpresa, setFuncaoEmpresa] = useState('');
    const [texto, setTexto] = useState('');
    const [avaliacaoSolucao, setAvaliacaoSolucao] = useState(0);
    const [avaliacaoVideo, setAvaliacaoVideo] = useState(0);
    const [avaliacaoImpacto, setAvaliacaoImpacto] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

     // Atualiza o nome no formulário se o usuário logado mudar (ex: após login)
    useState(() => {
        if (user) {
            setNome(user.nomeCompleto);
        }
    });


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setIsSubmitting(true);

        const newComentario = {
            nome,
            funcaoEmpresa,
            texto,
            avaliacaoSolucao: avaliacaoSolucao || null,
            avaliacaoVideo: avaliacaoVideo || null,
            avaliacaoImpacto: avaliacaoImpacto || null,
        };

        try {
            const response = await fetch(comentariosUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // Descomentar se endpoint for protegido
                },
                body: JSON.stringify(newComentario),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Falha ao enviar comentário.');
            }

            // Limpa o formulário e reseta as estrelas
            // Mantém o nome se o usuário estiver logado
            setFuncaoEmpresa('');
            setTexto('');
            setAvaliacaoSolucao(0);
            setAvaliacaoVideo(0);
            setAvaliacaoImpacto(0);

            // Revalida a lista de comentários usando mutate do SWR
            mutate(comentariosUrl);

        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="border-t pt-8 mt-8">
            <h2 className="text-2xl font-semibold text-uniguacu-blue mb-6">COMENTÁRIOS E AVALIAÇÕES</h2>

            {/* ** INVERSÃO: Lista de Comentários Existentes AGORA VEM PRIMEIRO ** */}
            <h3 className="text-lg font-semibold mb-4">Comentários Recebidos:</h3>
            {isLoading && <p>Carregando comentários...</p>}
            {error && <p className="text-red-500">Erro ao carregar comentários.</p>}
            {!isLoading && comentarios && comentarios.length === 0 && (
                <p className="text-gray-500 italic mb-6">Nenhum comentário ainda.</p>
            )}
            {!isLoading && comentarios && comentarios.length > 0 && (
                <div className="space-y-6 mb-8"> {/* Adiciona margem inferior */}
                    {comentarios.map(comentario => (
                        <div key={comentario.id} className="p-4 border rounded-md bg-white shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-semibold text-uniguacu-blue">{comentario.nome}</p>
                                    {comentario.funcaoEmpresa && <p className="text-xs text-gray-500">{comentario.funcaoEmpresa}</p>}
                                </div>
                                <span className="text-xs text-gray-400">
                                    {new Date(comentario.dataCriacao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric'})}
                                </span>
                            </div>
                            <p className="text-gray-700 mb-3 text-sm">{comentario.texto}</p>
                            {/* Exibição das avaliações (se houver) */}
                            {(comentario.avaliacaoSolucao || comentario.avaliacaoVideo || comentario.avaliacaoImpacto) && (
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-xs text-gray-600 border-t pt-2 mt-2">
                                    {comentario.avaliacaoSolucao && <div className="flex items-center gap-1 my-1 sm:my-0"><StarRating rating={comentario.avaliacaoSolucao} readOnly /> <span className="hidden sm:inline">- Solução</span></div>}
                                    {comentario.avaliacaoVideo && <div className="flex items-center gap-1 my-1 sm:my-0"><StarRating rating={comentario.avaliacaoVideo} readOnly /> <span className="hidden sm:inline">- Mídia</span></div>}
                                    {comentario.avaliacaoImpacto && <div className="flex items-center gap-1 my-1 sm:my-0"><StarRating rating={comentario.avaliacaoImpacto} readOnly /> <span className="hidden sm:inline">- Impacto</span></div>}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

             {/* ** INVERSÃO: Formulário para Novo Comentário AGORA VEM DEPOIS ** */}
            <form onSubmit={handleSubmit} className="p-6 bg-gray-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Deixe seu comentário:</h3>
                {formError && <p className="text-red-500 text-sm mb-3">{formError}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="filter-select bg-white"
                        required
                        disabled={!!user} // Desabilita se o usuário estiver logado (nome já preenchido)
                        aria-label="Nome do comentarista"
                    />
                    <input
                        type="text"
                        placeholder="Função/Empresa (Opcional)"
                        value={funcaoEmpresa}
                        onChange={(e) => setFuncaoEmpresa(e.target.value)}
                        className="filter-select bg-white"
                        aria-label="Função ou Empresa do comentarista"
                    />
                </div>
                <textarea
                    placeholder="Escreva seu comentário aqui..."
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    className="filter-select bg-white w-full h-24 mb-4"
                    required
                    aria-label="Campo de texto do comentário"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                     <div className="flex items-center justify-between">
                        <label className="text-gray-700 text-sm">Qualidade da Solução:</label>
                        <StarRating rating={avaliacaoSolucao} setRating={setAvaliacaoSolucao} />
                    </div>
                     <div className="flex items-center justify-between">
                        <label className="text-gray-700 text-sm">Qualidade do Vídeo/Mídia:</label>
                        <StarRating rating={avaliacaoVideo} setRating={setAvaliacaoVideo} />
                    </div>
                     <div className="flex items-center justify-between">
                        <label className="text-gray-700 text-sm">Impacto na Comunidade:</label>
                        <StarRating rating={avaliacaoImpacto} setRating={setAvaliacaoImpacto} />
                    </div>
                    <div className="md:col-start-2 flex justify-end">
                         <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded disabled:bg-gray-400 transition-colors"
                        >
                            {isSubmitting ? 'Enviando...' : 'Enviar Comentário'}
                        </button>
                    </div>
                </div>
            </form>

        </div>
    );
}