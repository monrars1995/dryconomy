# Simulador Dryconomy

Aplicativo de simulação para cálculo de economia de água.

## Configuração do Ambiente

1. **Variáveis de Ambiente**
   - Copie o arquivo `.env.example` para `.env` na raiz do projeto:
     ```bash
     cp .env.example .env
     ```
   - Preencha as variáveis de ambiente necessárias no arquivo `.env`:
     ```
     VITE_SUPABASE_URL=sua-url-do-supabase
     VITE_SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase
     ```

2. **Instalação de Dependências**
   ```bash
   npm install
   ```

3. **Executando o Projeto**
   ```bash
   npm run dev
   ```
   O aplicativo estará disponível em `http://localhost:9001`

## Configuração do Supabase

1. **Crie um projeto no Supabase**
   - Acesse [https://app.supabase.com](https://app.supabase.com)
   - Crie um novo projeto
   - Vá para as configurações do projeto > API
   - Copie a URL e a chave anônima para o seu arquivo `.env`

2. **Configuração do Banco de Dados**
   - Importe o esquema do banco de dados fornecido
   - Configure as políticas de RLS (Row Level Security) conforme necessário

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Constrói a aplicação para produção
- `npm run preview` - Visualiza a versão de produção localmente
- `npm run init-db` - Inicializa o banco de dados com dados iniciais

## Solução de Problemas

### Erro 403 ao acessar o Supabase
1. Verifique se as variáveis de ambiente estão corretamente configuradas
2. Confirme se o token de autenticação não expirou
3. Verifique as políticas de RLS no painel do Supabase

### Problemas de Autenticação
1. Limpe o localStorage do navegador
2. Verifique se o usuário tem as permissões necessárias
3. Confirme se o domínio está na lista de domínios permitidos no Supabase
