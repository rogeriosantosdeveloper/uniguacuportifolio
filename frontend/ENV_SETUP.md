# Configuração de Variáveis de Ambiente

## Problema: ERR_CONNECTION_REFUSED

O erro `ERR_CONNECTION_REFUSED` ocorre porque a variável de ambiente `NEXT_PUBLIC_API_URL` não está configurada, então o frontend tenta se conectar ao `localhost:8080` que não está disponível.

## Solução

### Para Desenvolvimento Local

Crie um arquivo `.env.local` na pasta `frontend/` com o seguinte conteúdo:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Para Produção (Vercel)

No painel do Vercel:

1. Vá em **Settings** → **Environment Variables**
2. Adicione uma nova variável:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: URL do seu backend (ex: `https://seu-backend.onrender.com`)
   - **Environments**: Marque todas (Production, Preview, Development)
3. Salve e faça um novo deploy

### Exemplo de Valores

- **Desenvolvimento local**: `http://localhost:8080`
- **Backend no Render**: `https://seu-backend.onrender.com`
- **Backend no Vercel**: `https://seu-backend.vercel.app`

## Importante

- O prefixo `NEXT_PUBLIC_` é obrigatório para expor a variável no cliente no Next.js
- Após criar/modificar o `.env.local`, reinicie o servidor de desenvolvimento (`npm run dev`)
- O arquivo `.env.local` não deve ser commitado no Git (já está no `.gitignore`)
