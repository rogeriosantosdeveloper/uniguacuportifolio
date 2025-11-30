# Configuração para Vercel (Frontend)

## Problema Resolvido: CORS

O backend estava configurado apenas para aceitar requisições de `localhost:3000`. Agora ele aceita:
- ✅ `http://localhost:3000` (desenvolvimento local)
- ✅ Domínio do Vercel (configurável via variável de ambiente)

## Configuração no Render

No painel do seu serviço backend no Render, adicione a variável de ambiente:

### Variável: `FRONTEND_URL`

**Valor**: O domínio completo do seu frontend no Vercel

Exemplos:
- Se seu app está em: `https://uniguacu-portfolio.vercel.app`
- Adicione: `FRONTEND_URL` = `https://uniguacu-portfolio.vercel.app`

Se tiver múltiplos domínios (ex: preview deployments), separe por vírgula:
- `FRONTEND_URL` = `https://uniguacu-portfolio.vercel.app,https://uniguacu-portfolio-git-main.vercel.app`

## Passos

1. No Render Dashboard, vá no seu serviço backend
2. Vá em **"Environment"**
3. Clique em **"Add Environment Variable"**
4. Adicione:
   - **KEY**: `FRONTEND_URL`
   - **VALUE**: `https://seu-dominio.vercel.app` (substitua pelo seu domínio real)
5. Clique em **"Save, rebuild, and deploy"**

## Verificação

Após o deploy, o backend vai aceitar requisições do Vercel sem erros de CORS.

## Nota

Se você não configurar `FRONTEND_URL`, o backend ainda vai funcionar, mas só vai aceitar requisições de `localhost:3000`. Para produção, é importante configurar o domínio do Vercel.

