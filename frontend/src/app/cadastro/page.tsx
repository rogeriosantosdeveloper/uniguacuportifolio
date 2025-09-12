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
    <main className="flex justify-center items-center py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-uniguacu-blue mb-6">
          Criar Conta
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="bg-red-100 text-red-700 p-3 rounded">{error}</p>
          )}
          {message && (
            <p className="bg-green-100 text-green-700 p-3 rounded">{message}</p>
          )}

          <div>
            <label
              htmlFor="nomeCompleto"
              className="block text-gray-700 font-bold mb-2"
            >
              Nome Completo
            </label>
            <input
              type="text"
              id="nomeCompleto"
              name="nomeCompleto"
              value={formData.nomeCompleto}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 font-bold mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            />
          </div>

          <div>
            <label
              htmlFor="curso"
              className="block text-gray-700 font-bold mb-2"
            >
              Curso
            </label>
            <select
              id="curso"
              name="curso"
              value={formData.curso}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white"
              required
            >
              <option value="" disabled>
                Selecione seu curso
              </option>
              {cursosDisponiveis.map((curso) => (
                <option key={curso} value={curso}>
                  {curso}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="turno"
              className="block text-gray-700 font-bold mb-2"
            >
              Turno
            </label>
            <select
              id="turno"
              name="turno"
              value={formData.turno}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white"
              required
            >
              <option value="" disabled>
                Selecione seu turno
              </option>
              {turnosDisponiveis.map((turno) => (
                <option key={turno} value={turno}>
                  {turno}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-gray-700 font-bold mb-2"
            >
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-gray-700 font-bold mb-2"
            >
              Confirmar Senha
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-uniguacu-blue hover:bg-opacity-80 text-white font-bold py-3 px-4 rounded disabled:bg-gray-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registrando..." : "Cadastrar"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">
          Já tem uma conta? <Link href="/login">Faça login</Link>
        </p>
      </div>
    </main>
  );
}
