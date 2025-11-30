# Guia de Deploy no Vercel - Frontend

Este guia explica como fazer o deploy do frontend Next.js no Vercel.

## Pré-requisitos

- ✅ Código já commitado e enviado para o GitHub
- ✅ Conta no Vercel (gratuita)
- ✅ URL do backend já configurada (ex: Render, Vercel, etc.)

## Passo a Passo

### 1. Criar Novo Projeto no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New..."** → **"Project"**
3. Conecte seu repositório GitHub se ainda não estiver conectado
4. Selecione o repositório: `rogeriosantosdeveloper/uniguacuportifolio`
5. Configure o projeto:
   - **Framework Preset**: Next.js (deve detectar automaticamente)
   - **Root Directory**: `frontend` ⚠️ **IMPORTANTE**
   - **Build Command**: `npm run build` (padrão)
   - **Output Directory**: `.next` (padrão)
   - **Install Command**: `npm install` (padrão)

### 2. Configurar Variáveis de Ambiente

No painel do Vercel, antes de fazer o deploy, configure as variáveis de ambiente:

**Variável obrigatória:**
- `NEXT_PUBLIC_API_URL` = URL do seu backend (ex: `https://seu-backend.onrender.com`)

**Como adicionar:**
1. Na página de configuração do projeto, vá em **"Environment Variables"**
2. Adicione:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: URL completa do seu backend (sem barra no final)
   - **Environments**: Marque todas (Production, Preview, Development)

### 3. Configurações Importantes

#### Root Directory
⚠️ **CRÍTICO**: Configure o **Root Directory** como `frontend` no Vercel, pois o projeto Next.js está dentro da pasta `frontend/`.

**Como configurar:**
1. No painel do projeto Vercel, vá em **Settings** → **General**
2. Em **Root Directory**, clique em **Edit**
3. Digite: `frontend`
4. Salve

### 4. Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar
3. O Vercel irá:
   - Instalar dependências (`npm install`)
   - Executar o build (`npm run build`)
   - Fazer o deploy

### 5. Verificar o Deploy

Após o deploy:
1. Acesse a URL fornecida pelo Vercel (ex: `seu-projeto.vercel.app`)
2. Verifique se a aplicação carrega corretamente
3. Teste a conexão com o backend

## Estrutura do Projeto

```
uniguacu/
├── frontend/          ← Projeto Next.js (Root Directory no Vercel)
│   ├── src/
│   │   └── app/      ← App Router (layout.tsx e page.tsx)
│   ├── package.json
│   ├── next.config.js
│   └── vercel.json
└── backend/          ← Backend Spring Boot (não usado no Vercel)
```

## Troubleshooting

### Erro: "Build failed"
- Verifique se o **Root Directory** está configurado como `frontend`
- Verifique se todas as dependências estão no `package.json`
- Verifique os logs do build no Vercel

### Erro: "Cannot find module"
- Verifique se o `package.json` está na pasta `frontend/`
- Execute `npm install` localmente para verificar dependências

### Erro: "API URL not found"
- Verifique se a variável `NEXT_PUBLIC_API_URL` está configurada
- Verifique se a URL do backend está correta e acessível

### Build trava ou demora muito
- Verifique se não há loops infinitos no código
- Verifique se o `localStorage` está sendo usado apenas no cliente
- Verifique os logs do build no Vercel

## Configuração Automática

O arquivo `vercel.json` já está configurado com:
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`

## Próximos Passos

Após o deploy bem-sucedido:
1. Configure um domínio personalizado (opcional)
2. Configure variáveis de ambiente adicionais se necessário
3. Configure preview deployments para branches
4. Configure webhooks se necessário

## Suporte

Se encontrar problemas:
1. Verifique os logs do build no dashboard do Vercel
2. Verifique se o backend está acessível
3. Verifique se todas as variáveis de ambiente estão configuradas

