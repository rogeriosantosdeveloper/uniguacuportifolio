# Configuração de Variáveis de Ambiente

Este projeto precisa de uma variável de ambiente para se conectar ao backend.

## Configuração para Desenvolvimento Local

1. Crie um arquivo `.env.local` na raiz do projeto (mesmo nível do `package.json`)
2. Adicione a seguinte linha:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Configuração para Produção (Vercel/Render)

### No Vercel

1. Acesse o dashboard do seu projeto no Vercel
2. Vá em **Settings** > **Environment Variables**
3. Adicione uma nova variável:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: A URL do seu backend no Render (ex: `https://seu-backend.onrender.com`)
   - **Environments**: Selecione Production, Preview e Development
4. Faça um novo deploy para que as variáveis sejam aplicadas

### No Render (se necessário)

Se você precisar definir variáveis de ambiente no Render também, acesse:
- Seu serviço no Render
- Vá em **Environment**
- Adicione a variável `NEXT_PUBLIC_API_URL` com o valor da URL do backend

## Verificação

Para verificar se a variável está configurada corretamente:

1. No código, a função `getApiUrl()` em `src/lib/api.ts` usa:
   - A variável de ambiente `NEXT_PUBLIC_API_URL` se estiver definida
   - Caso contrário, usa `http://localhost:8080` como fallback

2. No console do navegador (após o build), você pode verificar qual URL está sendo usada

## Importante

- O prefixo `NEXT_PUBLIC_` é necessário para que a variável seja acessível no cliente (browser)
- Sem essa variável configurada em produção, o frontend tentará se conectar ao localhost, causando erros 404
- Após alterar variáveis de ambiente no Vercel, você precisa fazer um novo deploy

