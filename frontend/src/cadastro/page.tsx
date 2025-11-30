"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const cursosDisponiveis = [
  "Administração",
  "Análise e Desenvolvimento de Sistemas",
  "Ciências Contábeis",
  "Direito",
  "Educação Física",
  "Enfermagem",
  "Engenharia Agronômica",
  "Engenharia Civil",
  "Engenharia de Software",
  "Fisioterapia",
  "Gestão de Recursos Humanos",
  "Medicina Veterinária",
  "Pedagogia",
  "Psicologia",
  "Terapia Ocupacional",
  "Zootecnia",
];
const turnosDisponiveis = ["Matutino", "Noturno"];

export default function CadastroPage() {
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    email: "",
    password: "",
    confirmPassword: "",
    curso: "",
    turno: "",
  });

  // Estados de feedback para o usuário
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Função única para lidar com a mudança em qualquer campo do formulário
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    // 1. Validação de senha no frontend antes de enviar
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      setIsSubmitting(false);
      return;
    }

    // 2. Validação para garantir que curso e turno foram selecionados
    if (!formData.curso || !formData.turno) {
      setError("Por favor, selecione seu curso e turno.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Envia apenas os dados que o backend espera
        body: JSON.stringify({
          nomeCompleto: formData.nomeCompleto,
          email: formData.email,
          password: formData.password,
          curso: formData.curso,
          turno: formData.turno,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Falha ao registrar.");
      }

      setMessage(
        "Usuário registrado com sucesso! Você será redirecionado para o login em 3 segundos."
      );
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro desconhecido.");
      }
    } finally {
      // Apenas para de submeter se houver erro, pois em caso de sucesso há o redirecionamento
      if (error) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <main className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
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

      {/* Container principal */}
      <div className="w-full max-w-7xl relative z-10 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Card de cadastro */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Header com gradiente */}
            <div className="bg-gradient-to-r from-uniguacu-blue to-uniguacu-red px-8 py-6 text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Criar Conta</h1>
              <p className="text-white/90 text-sm">Junte-se à nossa comunidade acadêmica</p>
            </div>

            {/* Formulário */}
            <div className="px-10 py-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Mensagem de erro */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
                    <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-semibold text-red-800">Erro no cadastro</h3>
                      <p className="text-sm text-red-600 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {/* Mensagem de sucesso */}
                {message && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-semibold text-green-800">Sucesso!</h3>
                      <p className="text-sm text-green-600 mt-1">{message}</p>
                    </div>
                  </div>
                )}

                {/* Campo Nome Completo */}
                <div className="space-y-2">
                  <label htmlFor="nomeCompleto" className="block text-sm font-semibold text-gray-700">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input 
                      type="text" 
                      id="nomeCompleto" 
                      name="nomeCompleto"
                      value={formData.nomeCompleto}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-uniguacu-blue focus:ring-2 focus:ring-uniguacu-blue/20 transition-all duration-200 bg-gray-50 focus:bg-white" 
                      placeholder="Seu nome completo"
                      required 
                    />
                  </div>
                </div>

                {/* Campo Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input 
                      type="email" 
                      id="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-uniguacu-blue focus:ring-2 focus:ring-uniguacu-blue/20 transition-all duration-200 bg-gray-50 focus:bg-white" 
                      placeholder="seu@email.com"
                      required 
                    />
                  </div>
                </div>

                {/* Grid para Curso e Turno */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Campo Curso */}
                  <div className="space-y-2">
                    <label htmlFor="curso" className="block text-sm font-semibold text-gray-700">
                      Curso
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <select
                        id="curso"
                        name="curso"
                        value={formData.curso}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-uniguacu-blue focus:ring-2 focus:ring-uniguacu-blue/20 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                        required
                      >
                        <option value="" disabled>Selecione seu curso</option>
                        {cursosDisponiveis.map((curso) => (
                          <option key={curso} value={curso}>{curso}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Campo Turno */}
                  <div className="space-y-2">
                    <label htmlFor="turno" className="block text-sm font-semibold text-gray-700">
                      Turno
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <select
                        id="turno"
                        name="turno"
                        value={formData.turno}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-uniguacu-blue focus:ring-2 focus:ring-uniguacu-blue/20 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                        required
                      >
                        <option value="" disabled>Selecione seu turno</option>
                        {turnosDisponiveis.map((turno) => (
                          <option key={turno} value={turno}>{turno}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Campo Senha */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Senha
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input 
                      type="password" 
                      id="password" 
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-uniguacu-blue focus:ring-2 focus:ring-uniguacu-blue/20 transition-all duration-200 bg-gray-50 focus:bg-white" 
                      placeholder="Sua senha"
                      required 
                    />
                  </div>
                </div>

                {/* Campo Confirmar Senha */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <input 
                      type="password" 
                      id="confirmPassword" 
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-uniguacu-blue focus:ring-2 focus:ring-uniguacu-blue/20 transition-all duration-200 bg-gray-50 focus:bg-white" 
                      placeholder="Confirme sua senha"
                      required 
                    />
                  </div>
                </div>

                {/* Botão de cadastro */}
                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-uniguacu-blue to-uniguacu-red hover:from-uniguacu-red hover:to-uniguacu-blue text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Cadastrar
                    </>
                  )}
                </button>
              </form>

              {/* Divisor */}
              <div className="mt-8 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">ou</span>
                  </div>
                </div>
              </div>

              {/* Link para login */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Já tem uma conta? 
                  <Link 
                    href="/login" 
                    className="ml-1 text-uniguacu-blue hover:text-uniguacu-red font-semibold transition-colors duration-200"
                  >
                    Faça login
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Seção informativa */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-10 shadow-lg border border-white/20">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-uniguacu-blue to-uniguacu-red rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Junte-se à Comunidade</h2>
                  <p className="text-gray-600">Faculdade Uniguaçu</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-uniguacu-blue/10 rounded-lg flex items-center justify-center mr-3 mt-1">
                    <svg className="w-4 h-4 text-uniguacu-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Acesso Completo</h3>
                    <p className="text-sm text-gray-600">Participe de projetos e conecte-se com outros estudantes</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-uniguacu-red/10 rounded-lg flex items-center justify-center mr-3 mt-1">
                    <svg className="w-4 h-4 text-uniguacu-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Compartilhe Projetos</h3>
                    <p className="text-sm text-gray-600">Apresente seus trabalhos e conquiste reconhecimento</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-uniguacu-blue/10 rounded-lg flex items-center justify-center mr-3 mt-1">
                    <svg className="w-4 h-4 text-uniguacu-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Networking</h3>
                    <p className="text-sm text-gray-600">Conecte-se com profissionais e expanda sua rede</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Card de estatísticas */}
            <div className="bg-gradient-to-r from-uniguacu-blue/10 to-uniguacu-red/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Nossa Comunidade</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-uniguacu-blue">500+</div>
                  <div className="text-sm text-gray-600">Projetos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-uniguacu-red">1000+</div>
                  <div className="text-sm text-gray-600">Estudantes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
