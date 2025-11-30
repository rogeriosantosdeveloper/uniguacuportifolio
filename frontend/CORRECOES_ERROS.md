# Correções para Erros no Projeto

## Problemas Identificados

1. **Erro 404 em `/cadastro` e `/login`**: Rotas estão fora do App Router
2. **Erro `ERR_CONNECTION_REFUSED`**: Variável de ambiente `NEXT_PUBLIC_API_URL` não configurada

## Soluções

### 1. Mover Rotas para App Router

As rotas precisam estar em `src/app/` ao invés de `src/`:

**Estrutura atual (ERRADA):**
```
src/
├── cadastro/
│   └── page.tsx
├── login/
│   └── page.tsx
├── perfil/
│   └── page.tsx
├── admin/
│   └── page.tsx
└── artefatos/
    └── ...
```

**Estrutura correta (App Router):**
```
src/
└── app/
    ├── cadastro/
    │   └── page.tsx
    ├── login/
    │   └── page.tsx
    ├── perfil/
    │   └── page.tsx
    ├── admin/
    │   └── page.tsx
    └── artefatos/
        └── ...
```

### 2. Configurar Variável de Ambiente

Crie um arquivo `.env.local` na pasta `frontend/` com:

```env
NEXT_PUBLIC_API_URL=https://seu-backend.onrender.com
```

Substitua `https://seu-backend.onrender.com` pela URL real do seu backend.

### 3. Para Deploy no Vercel

No painel do Vercel, configure a variável de ambiente:
- **Name**: `NEXT_PUBLIC_API_URL`
- **Value**: URL do seu backend (ex: `https://seu-backend.onrender.com`)
- **Environments**: Production, Preview, Development

## Passos para Corrigir

1. Mover todas as rotas de `src/` para `src/app/`
2. Criar arquivo `.env.local` com a URL do backend
3. Reiniciar o servidor de desenvolvimento (`npm run dev`)
4. No Vercel, configurar a variável de ambiente `NEXT_PUBLIC_API_URL`

## Comandos PowerShell para Mover Arquivos

```powershell
# Mover cadastro
Copy-Item -Path "frontend\src\cadastro" -Destination "frontend\src\app\cadastro" -Recurse -Force

# Mover login
Copy-Item -Path "frontend\src\login" -Destination "frontend\src\app\login" -Recurse -Force

# Mover perfil
Copy-Item -Path "frontend\src\perfil" -Destination "frontend\src\app\perfil" -Recurse -Force

# Mover admin
Copy-Item -Path "frontend\src\admin" -Destination "frontend\src\app\admin" -Recurse -Force

# Mover artefatos
Copy-Item -Path "frontend\src\artefatos" -Destination "frontend\src\app\artefatos" -Recurse -Force

# Depois, deletar as pastas antigas
Remove-Item -Path "frontend\src\cadastro" -Recurse -Force
Remove-Item -Path "frontend\src\login" -Recurse -Force
Remove-Item -Path "frontend\src\perfil" -Recurse -Force
Remove-Item -Path "frontend\src\admin" -Recurse -Force
Remove-Item -Path "frontend\src\artefatos" -Recurse -Force
```

