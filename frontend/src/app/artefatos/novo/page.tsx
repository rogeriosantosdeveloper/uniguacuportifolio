'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { mutate } from 'swr'; // Importando a função 'mutate' da SWR

// Estas listas podem ser movidas para um arquivo de constantes no futuro
const filterOptions = {
    cursos: ['Engenharia de Software', 'Direito', 'Agronomia', 'Medicina Veterinária', 'Psicologia', 'Administração'],
    campus: ['São Miguel do Iguaçu', 'Cascavel', 'Foz do Iguaçu'],
    categorias: ['Pesquisa', 'Extensão', 'Inovação Tecnológica', 'TCC'],
};

export default function NovoArtefatoPage() {
    const { token } = useAuth();
    const router = useRouter();

    // Estado para todos os campos do formulário
    const [formData, setFormData] = useState({
        titulo: '',
        autor: '',
        descricao: '',
        curso: '',
        campus: '',
        categoria: '',
        semestre: '',
    });
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Lida com a mudança em inputs de texto e selects
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Lida com a seleção do arquivo de imagem
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        
        if (!file || !formData.curso || !formData.categoria || !formData.campus) {
            setError('Por favor, preencha todos os campos obrigatórios e selecione uma imagem.');
            return;
        }
        setIsSubmitting(true);

        try {
            // 1. Fazer o upload da imagem primeiro, com o token de autenticação
            const fileFormData = new FormData();
            fileFormData.append('file', file);

            const uploadResponse = await fetch('http://localhost:8080/api/files/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: fileFormData,
            });

            if (!uploadResponse.ok) {
                throw new Error('Falha no upload da imagem. Verifique se está logado.');
            }

            const uploadResult = await uploadResponse.json();
            const imageUrl = uploadResult.filename;

            // 2. Preparar os dados do projeto para enviar ao backend
            const artefatoData = { 
                ...formData, 
                urlImagem: imageUrl,
                semestre: parseInt(formData.semestre, 10) || 0, // Converte semestre para número
                dataCriacao: new Date().toISOString().split('T')[0] // Adiciona a data atual no formato YYYY-MM-DD
            };

            const createResponse = await fetch('http://localhost:8080/api/artefatos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(artefatoData),
            });

            if (!createResponse.ok) {
                throw new Error('Falha ao criar o projeto.');
            }
            
            // 3. A SOLUÇÃO DEFINITIVA:
            // Avisa à SWR que os dados da lista de projetos estão desatualizados.
            // Isso fará com que a página inicial busque a lista nova.
            mutate((key) => typeof key === 'string' && key.startsWith('http://localhost:8080/api/artefatos'));

            // 4. Navega de volta para a home.
            router.push('/');

        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocorreu um erro desconhecido.');
            }
            setIsSubmitting(false); // Garante que o botão seja reativado em caso de erro
        }
    };

    return (
        <main className="container mx-auto p-8 max-w-2xl">
            <Link href="/" className="mb-6 inline-block">&larr; Voltar para a lista</Link>
            <h1 className="text-3xl font-bold text-uniguacu-blue mb-6">Adicionar Novo Projeto</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
                {error && <p className="bg-red-100 text-red-700 p-3 rounded">{error}</p>}
                
                <div>
                    <label htmlFor="titulo" className="block text-gray-700 font-bold mb-2">Título do Projeto</label>
                    <input type="text" id="titulo" name="titulo" value={formData.titulo} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" required />
                </div>
                <div>
                    <label htmlFor="autor" className="block text-gray-700 font-bold mb-2">Autor(es)</label>
                    <input type="text" id="autor" name="autor" value={formData.autor} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" placeholder="Ex: João Silva, Maria Oliveira" required />
                </div>
                <div>
                    <label htmlFor="descricao" className="block text-gray-700 font-bold mb-2">Descrição</label>
                    <textarea id="descricao" name="descricao" value={formData.descricao} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 h-32" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="curso" className="block text-gray-700 font-bold mb-2">Curso</label>
                        <select id="curso" name="curso" value={formData.curso} onChange={handleChange} className="filter-select bg-white" required>
                            <option value="" disabled>Selecione um curso</option>
                            {filterOptions.cursos.map(curso => <option key={curso} value={curso}>{curso}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="campus" className="block text-gray-700 font-bold mb-2">Campus</label>
                        <select id="campus" name="campus" value={formData.campus} onChange={handleChange} className="filter-select bg-white" required>
                            <option value="" disabled>Selecione um campus</option>
                            {filterOptions.campus.map(campus => <option key={campus} value={campus}>{campus}</option>)}
                        </select>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="categoria" className="block text-gray-700 font-bold mb-2">Categoria</label>
                        <select id="categoria" name="categoria" value={formData.categoria} onChange={handleChange} className="filter-select bg-white" required>
                            <option value="" disabled>Selecione uma categoria</option>
                            {filterOptions.categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="semestre" className="block text-gray-700 font-bold mb-2">Semestre</label>
                        <input type="number" id="semestre" name="semestre" value={formData.semestre} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" min="1" max="12" required />
                    </div>
                </div>
                <div>
                    <label htmlFor="file" className="block text-gray-700 font-bold mb-2">Imagem do Projeto</label>
                    <input
                        type="file"
                        id="file"
                        onChange={handleFileChange}
                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-uniguacu-blue hover:file:bg-blue-100"
                        accept="image/*"
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full bg-uniguacu-blue hover:bg-opacity-80 text-white font-bold py-3 px-4 rounded disabled:bg-gray-400"
                >
                    {isSubmitting ? 'Salvando...' : 'Salvar Projeto'}
                </button>
            </form>
        </main>
    );
}
