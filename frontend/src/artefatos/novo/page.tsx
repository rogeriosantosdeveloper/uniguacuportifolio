'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import useSWR, { mutate } from 'swr';
import { getApiEndpoint } from '@/lib/api';

// --- Tipos e Constantes ---
type UsuarioDTO = {
    id: number;
    nomeCompleto: string;
    email: string;
};

// Define como os dados de PDF serão armazenados
type PdfData = {
    nome: string; // O nome original do arquivo (ex: "meu_documento.pdf")
    url: string;  // O nome único salvo no servidor (ex: "uuid-1234.pdf")
};

// Função Fetcher para SWR (para buscar a lista de usuários)
const fetcher = (url: string, token: string | null) =>
    fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(res => res.ok ? res.json() : Promise.reject('Falha ao buscar dados'));

// Listas de opções para os <select>
const filterOptions = {
    cursos: ['Engenharia de Software', 'Direito', 'Agronomia', 'Medicina Veterinária', 'Psicologia', 'Administração'],
    campus: ['São Miguel do Iguaçu', 'Cascavel', 'Foz do Iguaçu'],
    categorias: ['Pesquisa', 'Extensão', 'Inovação Tecnológica', 'TCC'],
};

const ADMIN_EMAIL = 'admin@uniguacu.edu.br'; // Email do admin a ser filtrado

// --- Função Auxiliar de Upload ---
// Esta função faz o upload de um único arquivo para a API e retorna o nome do arquivo salvo
async function uploadFile(file: File, token: string | null): Promise<string> {
    const fileFormData = new FormData();
    fileFormData.append('file', file);
    
    const response = await fetch(getApiEndpoint('/api/files/upload'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fileFormData,
    });
    
    if (!response.ok) {
        throw new Error(`Falha no upload do arquivo: ${file.name}`);
    }
    const result = await response.json();
    return result.filename; // Retorna o nome único do arquivo salvo (ex: "uuid.jpg")
}


export default function NovoArtefato() {
    const { token, user } = useAuth();
    const router = useRouter();

    // --- Estados do Formulário ---
    const [formData, setFormData] = useState({
        titulo: '',
        autor: '', // Autor principal (será preenchido automaticamente pelo usuário logado)
        descricao: '',
        curso: '',
        campus: '',
        categoria: '',
        semestre: '',
    });
    
    // --- Estados de Mídia ---
    const [imageFiles, setImageFiles] = useState<File[]>([]); // Armazena os ARQUIVOS de imagem
    const [pdfFiles, setPdfFiles] = useState<File[]>([]); // Armazena os ARQUIVOS de PDF
    const [videoYoutubeUrl, setVideoYoutubeUrl] = useState(''); // Armazena o LINK do vídeo

    // --- Estados de Coautores ---
    const [coautores, setCoautores] = useState<string[]>([]);
    const [showCoautorSelect, setShowCoautorSelect] = useState<boolean>(false);
    const [currentCoautor, setCurrentCoautor] = useState<string>('');

    // --- Estados de UI (Feedback) ---
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Busca a lista de usuários para o select de coautores
    const usuariosUrl = token ? getApiEndpoint('/api/users') : null;
    const { data: usuarios, error: usuariosError } = useSWR<UsuarioDTO[]>(
        usuariosUrl ? [usuariosUrl, token] : null,
        ([url, tokenValue]) => fetcher(url, tokenValue as string | null)
    );

    // Define o autor principal automaticamente quando o usuário logado é carregado
    useEffect(() => {
        if (user) {
            setFormData(prev => ({ ...prev, autor: user.nomeCompleto }));
        }
    }, [user]); // Roda sempre que 'user' mudar

    // Handler genérico para inputs de texto, textarea e selects
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handlers para os inputs de múltiplos arquivos
    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImageFiles(Array.from(e.target.files)); // Converte FileList para Array
        }
    };
    
    const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setPdfFiles(Array.from(e.target.files)); // Converte FileList para Array
        }
    };

    // --- Funções de Coautores (Lógica de adicionar/remover) ---
    const handleAddCoautor = () => {
         if (currentCoautor && !coautores.includes(currentCoautor) && currentCoautor !== formData.autor) {
             const selectedUser = usuarios?.find(u => u.nomeCompleto === currentCoautor);
             if (selectedUser?.email === ADMIN_EMAIL) {
                 alert("O administrador não pode ser adicionado como coautor.");
                 return;
             }
            setCoautores(prev => [...prev, currentCoautor]);
            setCurrentCoautor('');
            setShowCoautorSelect(false);
        } else if (currentCoautor === formData.autor) {
            alert("O autor principal não pode ser adicionado como coautor.");
        } else if (coautores.includes(currentCoautor)) {
            alert("Este coautor já foi adicionado.");
        }
    };
    const handleRemoveCoautor = (coautorToRemove: string) => {
        setCoautores(prev => prev.filter(c => c !== coautorToRemove));
    };
    // --- Fim das Funções de Coautores ---


    // --- Lógica de Envio Principal ---
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(null);

        // Validações
        if (!user || !formData.autor) {
             setFormError('Erro ao identificar o autor. Tente recarregar a página.');
             return;
        }
        if (!formData.curso || !formData.categoria || !formData.campus) {
            setFormError('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        if (imageFiles.length === 0) {
            setFormError('Você deve adicionar pelo menos uma imagem de projeto.');
            return;
        }
        setIsSubmitting(true);

        try {
            // --- Upload de Mídias em Paralelo ---
            let uploadedImageUrls: string[] = [];
            let uploadedPdfData: PdfData[] = [];

            // 1. Upload das Imagens (em paralelo)
            const imageUploadPromises = imageFiles.map(file => uploadFile(file, token));
            uploadedImageUrls = await Promise.all(imageUploadPromises);

            // 2. Upload dos PDFs (em paralelo)
            const pdfUploadPromises = pdfFiles.map(file => uploadFile(file, token));
            const uploadedPdfUrls = await Promise.all(pdfUploadPromises);
            
            // Mapeia os nomes originais dos arquivos PDF com suas novas URLs salvas
            uploadedPdfData = pdfFiles.map((file, index) => ({
                nome: file.name,
                url: uploadedPdfUrls[index]
            }));

            // --- Preparação dos Dados do Artefato ---
            const todosAutores = [formData.autor, ...coautores].join(', ');

            const artefatoData = {
                ...formData,
                autor: todosAutores,
                semestre: parseInt(formData.semestre, 10) || null,
                
                // Novos campos de mídia
                urlImagemPrincipal: uploadedImageUrls[0] || null, // A primeira imagem é a principal
                listaImagens: JSON.stringify(uploadedImageUrls), // Salva o array de URLs como JSON string
                listaDocumentos: JSON.stringify(uploadedPdfData), // Salva o array de {nome, url} como JSON string
                videoYoutubeUrl: videoYoutubeUrl || null,
                
                // Status e Data são definidos pelo backend
            };

            // --- Envio do Artefato para o Backend ---
            const createResponse = await fetch(getApiEndpoint('/api/artefatos'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(artefatoData),
            });
            if (!createResponse.ok) {
                 const errorBody = await createResponse.text();
                 throw new Error(`Falha ao criar o projeto: ${errorBody}`);
            }

            // --- Sucesso ---
            // Invalida o cache da SWR para a home page buscar os dados atualizados
            const apiUrl = getApiEndpoint('/api/artefatos');
            mutate((key) => typeof key === 'string' && key.startsWith(apiUrl));
            router.push('/'); // Navega de volta para a home

        } catch (err: unknown) {
            setFormError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
            setIsSubmitting(false);
        }
    };
    
    // Lista filtrada de coautores para o select
    const availableCoautores = usuarios?.filter(
        u => u.nomeCompleto !== formData.autor &&
             !coautores.includes(u.nomeCompleto) &&
             u.email !== ADMIN_EMAIL
    ) || [];

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
            {/* Elementos decorativos de fundo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Círculos decorativos */}
                <div className="absolute top-20 left-10 w-32 h-32 bg-uniguacu-blue/10 rounded-full blur-3xl"></div>
                <div className="absolute top-40 right-20 w-24 h-24 bg-uniguacu-red/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-uniguacu-blue/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-uniguacu-red/5 rounded-full blur-2xl"></div>
                
                {/* Padrão de linhas sutis */}
                <div className="absolute inset-0 opacity-5">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-7xl relative z-10 py-8">
                {/* Link de voltar */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-uniguacu-blue hover:text-uniguacu-red transition-colors duration-200 group">
                        <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Voltar para a lista
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="mb-8">
                        <div className="w-20 h-20 bg-gradient-to-r from-uniguacu-blue to-uniguacu-red rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-uniguacu-blue to-uniguacu-red bg-clip-text text-transparent mb-4">
                            Adicionar Novo Projeto
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            Compartilhe seu trabalho acadêmico com a comunidade e inspire outros estudantes
                        </p>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 backdrop-blur-sm">
                    <div className="p-12 space-y-12">
                        {formError && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
                                <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                    <div>
                                    <h3 className="text-sm font-semibold text-red-800">Erro no formulário</h3>
                                    <p className="text-sm text-red-600 mt-1">{formError}</p>
                                </div>
                            </div>
                        )}

                        {/* --- Seção 1: Informações Básicas --- */}
                        <div className="bg-gradient-to-r from-uniguacu-blue/5 to-uniguacu-red/5 rounded-2xl p-10 border border-uniguacu-blue/10">
                            <div className="flex items-center mb-8">
                                <div className="w-12 h-12 bg-gradient-to-r from-uniguacu-blue to-uniguacu-red rounded-full flex items-center justify-center mr-4 shadow-lg">
                                    <span className="text-white font-bold text-lg">1</span>
                    </div>
                        <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Informações do Projeto</h3>
                                    <p className="text-gray-600">Dados básicos sobre seu trabalho acadêmico</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <label htmlFor="titulo" className="block text-sm font-bold text-gray-800">
                                    Título do Projeto <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400 group-focus-within:text-uniguacu-blue transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                    </div>
                                    <input 
                                        type="text" 
                                        id="titulo" 
                                        name="titulo" 
                                        value={formData.titulo} 
                                        onChange={handleChange} 
                                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-uniguacu-blue focus:ring-4 focus:ring-uniguacu-blue/10 transition-all duration-300 bg-white hover:bg-gray-50 focus:bg-white shadow-sm hover:shadow-md focus:shadow-lg" 
                                        placeholder="Digite o título do seu projeto"
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label htmlFor="descricao" className="block text-sm font-bold text-gray-800">
                                    Descrição Completa <span className="text-red-500">*</span>
                                </label>
                                <textarea 
                                    id="descricao" 
                                    name="descricao" 
                                    value={formData.descricao} 
                                    onChange={handleChange} 
                                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-uniguacu-blue focus:ring-4 focus:ring-uniguacu-blue/10 transition-all duration-300 bg-white hover:bg-gray-50 focus:bg-white shadow-sm hover:shadow-md focus:shadow-lg resize-none" 
                                    rows={6}
                                    placeholder="Descreva detalhadamente seu projeto, objetivos, metodologia e resultados..."
                                    required 
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label htmlFor="curso" className="block text-sm font-bold text-gray-800">
                                        Curso <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400 group-focus-within:text-uniguacu-blue transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <select 
                                            id="curso" 
                                            name="curso" 
                                            value={formData.curso} 
                                            onChange={handleChange} 
                                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-uniguacu-blue focus:ring-4 focus:ring-uniguacu-blue/10 transition-all duration-300 bg-white hover:bg-gray-50 focus:bg-white shadow-sm hover:shadow-md focus:shadow-lg appearance-none" 
                                            required
                                        >
                                <option value="" disabled>Selecione um curso</option>
                                {filterOptions.cursos.map(curso => <option key={curso} value={curso}>{curso}</option>)}
                            </select>
                        </div>
                                </div>

                                <div className="space-y-3">
                                    <label htmlFor="campus" className="block text-sm font-bold text-gray-800">
                                        Campus <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400 group-focus-within:text-uniguacu-blue transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <select 
                                            id="campus" 
                                            name="campus" 
                                            value={formData.campus} 
                                            onChange={handleChange} 
                                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-uniguacu-blue focus:ring-4 focus:ring-uniguacu-blue/10 transition-all duration-300 bg-white hover:bg-gray-50 focus:bg-white shadow-sm hover:shadow-md focus:shadow-lg appearance-none" 
                                            required
                                        >
                                <option value="" disabled>Selecione um campus</option>
                                {filterOptions.campus.map(campus => <option key={campus} value={campus}>{campus}</option>)}
                            </select>
                        </div>
                    </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label htmlFor="categoria" className="block text-sm font-bold text-gray-800">
                                        Categoria <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400 group-focus-within:text-uniguacu-blue transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                        </div>
                                        <select 
                                            id="categoria" 
                                            name="categoria" 
                                            value={formData.categoria} 
                                            onChange={handleChange} 
                                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-uniguacu-blue focus:ring-4 focus:ring-uniguacu-blue/10 transition-all duration-300 bg-white hover:bg-gray-50 focus:bg-white shadow-sm hover:shadow-md focus:shadow-lg appearance-none" 
                                            required
                                        >
                                <option value="" disabled>Selecione uma categoria</option>
                                {filterOptions.categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                                </div>

                                <div className="space-y-3">
                                    <label htmlFor="semestre" className="block text-sm font-bold text-gray-800">
                                        Semestre
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400 group-focus-within:text-uniguacu-blue transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <input 
                                            type="number" 
                                            id="semestre" 
                                            name="semestre" 
                                            value={formData.semestre} 
                                            onChange={handleChange} 
                                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-uniguacu-blue focus:ring-4 focus:ring-uniguacu-blue/10 transition-all duration-300 bg-white hover:bg-gray-50 focus:bg-white shadow-sm hover:shadow-md focus:shadow-lg" 
                                            min="1" 
                                            max="12" 
                                            placeholder="Ex: 6"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                {/* --- Seção 2: Autores --- */}
                        <div className="bg-gradient-to-r from-uniguacu-red/5 to-uniguacu-blue/5 rounded-2xl p-10 border border-uniguacu-red/10">
                            <div className="flex items-center mb-8">
                                <div className="w-12 h-12 bg-gradient-to-r from-uniguacu-red to-uniguacu-blue rounded-full flex items-center justify-center mr-4 shadow-lg">
                                    <span className="text-white font-bold text-lg">2</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Autores</h3>
                                    <p className="text-gray-600">Defina quem participou do desenvolvimento do projeto</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-gray-800">
                                    Autor Principal (Você)
                                </label>
                                <div className="bg-gradient-to-r from-uniguacu-blue/10 to-uniguacu-red/10 border-2 border-uniguacu-blue/20 rounded-2xl p-6 shadow-sm">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-gradient-to-r from-uniguacu-blue to-uniguacu-red rounded-full flex items-center justify-center mr-4 shadow-lg">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                    <div>
                                            <p className="font-bold text-gray-900 text-lg">
                                                {formData.autor || 'Carregando...'}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {user && user.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                        <input type="hidden" name="autor" value={formData.autor} required />
                    </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-gray-800">
                                    Coautor(es)
                                </label>
                                
                        {coautores.length > 0 && (
                                    <div className="space-y-3 mb-6">
                                {coautores.map((coautor, index) => (
                                            <div key={index} className="flex justify-between items-center bg-white border-2 border-gray-200 rounded-2xl px-6 py-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                    <span className="font-semibold text-gray-900 text-lg">{coautor}</span>
                                                </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCoautor(coautor)}
                                                    className="w-10 h-10 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                                            title="Remover coautor"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                        )}
                        
                        {!showCoautorSelect && availableCoautores.length > 0 && (
                            <button 
                                type="button" 
                                onClick={() => setShowCoautorSelect(true)}
                                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-uniguacu-blue to-uniguacu-red hover:from-uniguacu-red hover:to-uniguacu-blue text-white rounded-2xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                                disabled={!formData.autor}
                            >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Adicionar Coautor
                            </button>
                        )}

                        {showCoautorSelect && (
                                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <select 
                                                    id="coautorSelect" 
                                                    value={currentCoautor} 
                                                    onChange={(e) => setCurrentCoautor(e.target.value)} 
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-uniguacu-blue focus:ring-4 focus:ring-uniguacu-blue/10 transition-all duration-300 bg-white hover:bg-gray-50 focus:bg-white shadow-sm hover:shadow-md focus:shadow-lg appearance-none"
                                                >
                                    <option value="" disabled>Selecione um coautor</option>
                                    {availableCoautores.map((user) => (
                                        <option key={user.id} value={user.nomeCompleto}>
                                            {user.nomeCompleto} ({user.email})
                                        </option>
                                    ))}
                                </select>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={handleAddCoautor} 
                                                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                                                disabled={!currentCoautor}
                                            >
                                                Adicionar
                                </button>
                                            <button 
                                                type="button" 
                                                onClick={() => { setCurrentCoautor(''); setShowCoautorSelect(false); }} 
                                                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-2xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                                            >
                                    Cancelar
                                </button>
                            </div>
                                    </div>
                                )}

                                {availableCoautores.length === 0 && formData.autor && (
                                    <p className="text-sm text-gray-500 bg-gray-50 border-2 border-gray-200 rounded-2xl p-4">
                                        Todos os outros autores já foram adicionados.
                                    </p>
                                )}
                                
                                {usuariosError && (
                                    <p className="text-red-500 text-sm bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                                        Erro ao carregar lista de autores.
                                    </p>
                                )}
                            </div>
                    </div>

                        {/* --- Seção 3: Mídias --- */}
                        <div className="bg-gradient-to-r from-uniguacu-blue/5 to-uniguacu-red/5 rounded-2xl p-10 border border-uniguacu-blue/10">
                            <div className="flex items-center mb-8">
                                <div className="w-12 h-12 bg-gradient-to-r from-uniguacu-blue to-uniguacu-red rounded-full flex items-center justify-center mr-4 shadow-lg">
                                    <span className="text-white font-bold text-lg">3</span>
                                </div>
                    <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Mídias</h3>
                                    <p className="text-gray-600">Adicione imagens, documentos e vídeos do seu projeto</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label htmlFor="images" className="block text-sm font-bold text-gray-800">
                                    Imagens do Projeto (Carrossel) <span className="text-red-500">*</span>
                                </label>
                                <p className="text-sm text-gray-600 mb-6">A primeira imagem que você selecionar será a capa do projeto.</p>
                                
                                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-uniguacu-blue hover:bg-uniguacu-blue/5 transition-all duration-300 relative group">
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-gradient-to-r from-uniguacu-blue/10 to-uniguacu-red/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                            <svg className="w-8 h-8 text-uniguacu-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-700 font-semibold text-lg mb-2">Clique para selecionar imagens</p>
                                        <p className="text-sm text-gray-500">PNG, JPG, JPEG até 10MB cada</p>
                                    </div>
                        <input
                            type="file"
                            id="images"
                            onChange={handleImageFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            accept="image/*"
                            multiple 
                            required 
                        />
                                </div>
                                
                        {imageFiles.length > 0 && (
                                    <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mt-6">
                                        <div className="flex items-center">
                                            <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-green-700 font-semibold text-lg">
                                                {imageFiles.length} imagem(ns) selecionada(s)
                                            </span>
                                        </div>
                                    </div>
                        )}
                    </div>
                    
                            <div className="space-y-4">
                                <label htmlFor="pdfs" className="block text-sm font-bold text-gray-800">
                                    Documentos (.pdf)
                                </label>
                                
                                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-uniguacu-red hover:bg-uniguacu-red/5 transition-all duration-300 relative group">
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-gradient-to-r from-uniguacu-red/10 to-uniguacu-blue/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                            <svg className="w-8 h-8 text-uniguacu-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-700 font-semibold text-lg mb-2">Clique para selecionar documentos PDF</p>
                                        <p className="text-sm text-gray-500">PDF até 10MB cada</p>
                                    </div>
                        <input
                            type="file"
                            id="pdfs"
                            onChange={handlePdfFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            accept=".pdf"
                            multiple
                        />
                                </div>
                                
                         {pdfFiles.length > 0 && (
                                    <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mt-6">
                                        <div className="flex items-center">
                                            <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-green-700 font-semibold text-lg">
                                                {pdfFiles.length} documento(s) selecionado(s)
                                            </span>
                                        </div>
                                    </div>
                        )}
                    </div>

                            <div className="space-y-4">
                                <label htmlFor="videoYoutubeUrl" className="block text-sm font-bold text-gray-800">
                                    Link de Vídeo (YouTube)
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400 group-focus-within:text-uniguacu-blue transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1M9 10v6a2 2 0 002 2h2a2 2 0 002-2v-6" />
                                        </svg>
                                    </div>
                        <input
                            type="url"
                            id="videoYoutubeUrl"
                            name="videoYoutubeUrl"
                            value={videoYoutubeUrl}
                            onChange={(e) => setVideoYoutubeUrl(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-uniguacu-blue focus:ring-4 focus:ring-uniguacu-blue/10 transition-all duration-300 bg-white hover:bg-gray-50 focus:bg-white shadow-sm hover:shadow-md focus:shadow-lg"
                                        placeholder="https://www.youtube.com/watch?v=..."
                        />
                    </div>
                            </div>
                        </div>
                
                        {/* Botão de envio */}
                        <div className="pt-8 border-t-2 border-gray-200">
                <button
                    type="submit"
                    disabled={isSubmitting || !formData.autor}
                                className="w-full bg-gradient-to-r from-uniguacu-blue to-uniguacu-red hover:from-uniguacu-red hover:to-uniguacu-blue text-white font-bold py-6 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center text-lg"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Salvando Projeto...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Salvar e Enviar para Aprovação
                                    </>
                                )}
                </button>
                        </div>
                    </div>
            </form>
            </div>
        </main>
    );
}