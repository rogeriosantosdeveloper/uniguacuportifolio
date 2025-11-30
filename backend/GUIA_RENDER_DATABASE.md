# Guia: Criar Banco de Dados PostgreSQL no Render

## Passo 1: Criar o Banco de Dados

1. Acesse o [Render Dashboard](https://dashboard.render.com/)
2. Clique em **"New +"** no topo da página
3. Selecione **"PostgreSQL"**
4. Preencha os campos:
   - **Name**: `uniguacu-db` (ou o nome que preferir)
   - **Database**: `uniguacu_db` (nome do banco)
   - **User**: `uniguacu_db_user` (nome do usuário)
   - **Region**: Escolha a mesma região do seu serviço (ex: Oregon, Frankfurt)
   - **PostgreSQL Version**: Deixe a versão mais recente
   - **Plan**: Escolha o plano (Free tier funciona para desenvolvimento)
5. Clique em **"Create Database"**

## Passo 2: Aguardar a Criação

- O Render vai criar o banco (leva alguns minutos)
- Anote a **senha** que será gerada automaticamente (você só verá uma vez!)

## Passo 3: Conectar o Banco ao Seu Serviço

### Opção A: Conexão Automática (Recomendado)

1. No painel do seu **serviço web** (não do banco), vá em **"Environment"**
2. Procure por **"Add Database"** ou **"Link Database"**
3. Selecione o banco que você acabou de criar
4. O Render vai adicionar automaticamente a variável `DATABASE_URL` com todas as informações

### Opção B: Configuração Manual

Se a conexão automática não funcionar, adicione manualmente:

1. No painel do seu **serviço web**, vá em **"Environment"**
2. Clique em **"Add Environment Variable"**
3. Adicione a variável `DATABASE_URL` com o valor que você encontra no painel do banco:
   - Vá no painel do banco PostgreSQL
   - Na seção **"Connections"**, copie a **"Internal Database URL"** (se o serviço estiver na mesma região) ou **"External Connection String"**
   - O formato será: `postgresql://uniguacu_db_user:SENHA@HOST:PORTA/uniguacu_db`

## Passo 4: Configurar Variáveis Adicionais (Opcional)

Se quiser usar variáveis separadas ao invés de `DATABASE_URL`, adicione:

- `DATABASE_USERNAME` = `uniguacu_db_user`
- `DATABASE_PASSWORD` = (a senha do banco)
- `DDL_AUTO` = `update` (para produção, use `update` ao invés de `create-drop`)

## Passo 5: Fazer Deploy

1. Faça commit e push das mudanças
2. O Render vai fazer deploy automaticamente
3. Verifique os logs para confirmar que a conexão funcionou

## Verificação

Após o deploy, verifique os logs do serviço. Você deve ver:
- ✅ Conexão com o banco estabelecida
- ✅ Schema criado/atualizado pelo Hibernate
- ✅ Aplicação iniciada com sucesso

## Importante: Estratégia DDL

- **Desenvolvimento**: `create-drop` (apaga e recria tudo)
- **Produção**: `update` (atualiza sem apagar dados)

Para produção, configure a variável `DDL_AUTO=update` no Render.

