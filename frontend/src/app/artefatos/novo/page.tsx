'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { mutate } from 'swr';

const filterOptions = {
    cursos: [ 'Administração', 'Análise e Desenvolvimento de Sistemas', 'Ciências Contábeis', 'Direito', 'Educação Física', 'Enfermagem', 'Engenharia Agronômica', 'Engenharia Civil', 'Engenharia de Software', 'Fisioterapia', 'Gestão de Recursos Humanos', 'Medicina Veterinária', 'Pedagogia', 'Psicologia', 'Terapia Ocupacional', 'Zootecnia'],
    campus: ['São Miguel do Iguaçu', 'Cascavel', 'Foz do Iguaçu'],
    categorias: ['Pesquisa', 'Extensão', 'Inovação Tecnológica', 'TCC'],
};

export default function NovoArtefatoPage() {
    const { token } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        titulo: '',
        autor: '',
        descricao: '',
        curso: '',
        campus: '',
        categoria: '',
        semestre: '',
        dataInicial: '',
        dataFinal: '',
    });
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        const semestreNumerico = parseInt(formData.semestre, 10);
        if (formData.semestre && semestreNumerico > 10) {
            setError('O semestre não pode ser maior que 10.');
            return;
        }

        if (formData.dataInicial && formData.dataFinal && new Date(formData.dataFinal) < new Date(formData.dataInicial)) {
            setError('A data final não pode ser anterior à data inicial.');
            return;
        }

        if (!file || !formData.curso || !formData.categoria || !formData.campus || !formData.dataInicial || !formData.dataFinal) {
            setError('Por favor, preencha todos os campos obrigatórios, incluindo as datas e a imagem.');
            return;
        }
        setIsSubmitting(true);

        try {
            const fileFormData = new FormData();
            fileFormData.append('file', file);
            const uploadResponse = await fetch('http://localhost:8080/api/files/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: fileFormData,
            });
            if (!uploadResponse.ok) throw new Error('Falha no upload da imagem.');
            const uploadResult = await uploadResponse.json();
            
            const artefatoData = { 
                ...formData, 
                urlImagem: uploadResult.filename,
                semestre: semestreNumerico || null,
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
                const errorBody = await createResponse.text();
                throw new Error(errorBody || 'Falha ao criar o projeto.');
            }
            
            mutate((key) => typeof key === 'string' && key.startsWith('http://localhost:8080/api/artefatos'));
            router.push('/');

        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError('Ocorreu um erro desconhecido.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="container mx-auto p-4 sm:p-8 max-w-3xl">
            <Link href="/" className="mb-6 inline-block text-uniguacu-blue hover:underline">&larr; Voltar para a lista</Link>
            <h1 className="text-3xl font-bold text-uniguacu-blue mb-6">Adicionar Novo Projeto</h1>
            
            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-lg shadow-md space-y-6">
                {error && <p className="bg-red-100 text-red-700 p-3 rounded">{error}</p>}
                
                {/* Campos Principais */}
                <div>
                    <label htmlFor="titulo" className="block text-gray-700 font-bold mb-2">Título do Projeto</label>
                    <input type="text" id="titulo" name="titulo" value={formData.titulo} onChange={handleChange} className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700" required />
                </div>
                <div>
                    <label htmlFor="autor" className="block text-gray-700 font-bold mb-2">Autor(es)</label>
                    <input type="text" id="autor" name="autor" value={formData.autor} onChange={handleChange} className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700" placeholder="Ex: João Silva, Maria Oliveira" required />
                </div>
                <div>
                    <label htmlFor="descricao" className="block text-gray-700 font-bold mb-2">Descrição</label>
                    <textarea id="descricao" name="descricao" value={formData.descricao} onChange={handleChange} className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 h-32" required />
                </div>

                {/* ======================= ESTRUTURA DO GRID CORRIGIDA ======================= */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 border-t border-gray-200 pt-6">
                    
                    {/* Linha 1: Datas */}
                    <div>
                        <label htmlFor="dataInicial" className="block text-gray-700 font-bold mb-2">Data de Início</label>
                        <input type="date" id="dataInicial" name="dataInicial" value={formData.dataInicial} onChange={handleChange} className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700" required />
                    </div>
                    <div>
                        <label htmlFor="dataFinal" className="block text-gray-700 font-bold mb-2">Data de Término</label>
                        <input type="date" id="dataFinal" name="dataFinal" value={formData.dataFinal} onChange={handleChange} className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700" required />
                    </div>

                    {/* Linha 2: Curso e Campus */}
                    <div>
                        <label htmlFor="curso" className="block text-gray-700 font-bold mb-2">Curso</label>
                        <select id="curso" name="curso" value={formData.curso} onChange={handleChange} className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700" required>
                            <option value="" disabled>Selecione um curso</option>
                            {filterOptions.cursos.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="campus" className="block text-gray-700 font-bold mb-2">Campus</label>
                        <select id="campus" name="campus" value={formData.campus} onChange={handleChange} className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700" required>
                            <option value="" disabled>Selecione um campus</option>
                            {filterOptions.campus.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Linha 3: Categoria e Semestre */}
                    <div>
                        <label htmlFor="categoria" className="block text-gray-700 font-bold mb-2">Categoria</label>
                        <select id="categoria" name="categoria" value={formData.categoria} onChange={handleChange} className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700" required>
                            <option value="" disabled>Selecione uma categoria</option>
                            {filterOptions.categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="semestre" className="block text-gray-700 font-bold mb-2">Semestre</label>
                        <input type="number" id="semestre" name="semestre" value={formData.semestre} onChange={handleChange} className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700" min="1" max="10" required />
                    </div>
                </div>

                {/* Campo de Imagem */}
                <div className="border-t border-gray-200 pt-6">
                    <label htmlFor="file" className="block text-gray-700 font-bold mb-2">Imagem do Projeto</label>
                    <input type="file" id="file" onChange={handleFileChange} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-uniguacu-blue hover:file:bg-blue-100" accept="image/*" required />
                </div>
                
                <button type="submit" disabled={isSubmitting} className="w-full bg-uniguacu-blue hover:bg-opacity-80 text-white font-bold py-3 px-4 rounded disabled:bg-gray-400">
                    {isSubmitting ? 'Salvando...' : 'Salvar Projeto'}
                </button>
            </form>
        </main>
    );
}