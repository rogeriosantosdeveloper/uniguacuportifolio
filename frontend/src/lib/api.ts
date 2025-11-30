/**
 * Configuração centralizada da URL da API
 * 
 * A URL base da API é obtida da variável de ambiente NEXT_PUBLIC_API_URL.
 * Se não estiver definida, usa localhost:8080 como fallback para desenvolvimento local.
 */

export const getApiUrl = (): string => {
  // NEXT_PUBLIC_ prefix é necessário para expor a variável no cliente no Next.js
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  return apiUrl;
};

/**
 * Retorna a URL completa para um endpoint da API
 * @param endpoint - O endpoint da API (ex: '/api/artefatos')
 * @returns URL completa (ex: 'http://localhost:8080/api/artefatos' ou 'https://backend.onrender.com/api/artefatos')
 */
export const getApiEndpoint = (endpoint: string): string => {
  const baseUrl = getApiUrl();
  // Remove barra inicial do endpoint se existir e adiciona do baseUrl se necessário
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${cleanBaseUrl}${cleanEndpoint}`;
};

/**
 * Retorna a URL para acessar arquivos estáticos do backend
 * @param filename - Nome do arquivo (ex: 'image.jpg')
 * @returns URL completa para o arquivo
 */
export const getFileUrl = (filename: string | null | undefined): string | null => {
  if (!filename) return null;
  const baseUrl = getApiUrl();
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${cleanBaseUrl}/api/files/${filename}`;
};

