# Guia de Deploy do Simulador Dryconomy

Este guia contém instruções passo a passo para fazer o deploy do Simulador Dryconomy em um servidor de hospedagem.

## Requisitos do Servidor

- PHP 7.4 ou superior
- MySQL 5.7 ou superior
- Suporte a mod_rewrite (Apache) ou equivalente (Nginx)
- HTTPS configurado (recomendado para produção)

## 1. Preparação dos Arquivos

### 1.1 Arquivos Frontend (React)

Os arquivos do frontend já estão compilados na pasta `dist`. Estes são os arquivos estáticos que devem ser copiados para o servidor:

- Todo o conteúdo da pasta `dist/`
- O arquivo `.htaccess` da raiz do projeto

### 1.2 Arquivos Backend (PHP)

Os seguintes arquivos e pastas devem ser copiados para o servidor:

- Pasta `database/` completa

## 2. Upload dos Arquivos

1. Conecte-se ao seu servidor de hospedagem via FTP ou através do gerenciador de arquivos do painel de controle
2. Crie uma pasta para o projeto (ex: `dryconomy` ou use a pasta raiz do domínio)
3. Faça upload de todos os arquivos mencionados acima para esta pasta

## 3. Configuração do Banco de Dados

1. Acesse o painel de controle da sua hospedagem
2. Crie um novo banco de dados MySQL
3. Crie um usuário MySQL e conceda todos os privilégios ao banco de dados criado
4. Anote as informações de conexão (host, nome do banco, usuário e senha)

## 4. Atualização das Configurações

1. Edite o arquivo `database/config.php` e atualize as seguintes informações:

```php
$db_config = [
    'host'     => 'seu_host_mysql',     // Endereço do servidor MySQL da hospedagem
    'dbname'   => 'seu_banco_de_dados',  // Nome do banco de dados criado
    'username' => 'seu_usuario_mysql',   // Nome de usuário MySQL
    'password' => 'sua_senha_mysql',     // Senha do MySQL
    'charset'  => 'utf8mb4',             // Manter como está
    'port'     => '3306'                 // Porta do MySQL (geralmente 3306)
];
```

## 5. Instalação do Banco de Dados

1. Acesse o script de instalação pelo navegador:
   ```
   https://seu-dominio.com/database/setup_admin.php
   ```

2. Siga as instruções na tela para:
   - Configurar o banco de dados (criação das tabelas)
   - Criar um usuário administrador

## 6. Configuração do Servidor Web

### Para Apache

O arquivo `.htaccess` já contém as regras necessárias para o funcionamento correto da aplicação. Certifique-se de que o mod_rewrite está habilitado no servidor.

### Para Nginx

Se estiver usando Nginx, você precisará configurar o servidor com regras semelhantes às do arquivo `src/dist/nginx.conf`.

## 7. Teste da Aplicação

1. Acesse o site pelo navegador: `https://seu-dominio.com`
2. Verifique se a página inicial carrega corretamente
3. Teste o simulador para garantir que está funcionando
4. Acesse a área administrativa: `https://seu-dominio.com/login`

## 8. Solução de Problemas

### Problemas de Conexão com o Banco de Dados

- Verifique se as credenciais no arquivo `config.php` estão corretas
- Confirme se o usuário MySQL tem permissões suficientes
- Verifique se o host do MySQL está correto (algumas hospedagens usam um host específico)

### Problemas com Rotas (404 Not Found)

- Verifique se o mod_rewrite está habilitado (Apache)
- Confirme se o arquivo `.htaccess` foi transferido corretamente
- Para Nginx, verifique se as regras de reescrita estão configuradas corretamente

### Problemas de CORS

- Se a API estiver em um domínio diferente do frontend, você precisará ajustar os headers CORS no arquivo `database/api.php`

## 9. Considerações de Segurança

- Altere a senha do usuário administrador para uma senha forte
- Considere restringir o acesso aos arquivos na pasta `database/` exceto para o arquivo `api.php`
- Mantenha o PHP e o MySQL atualizados
- Configure HTTPS para o seu domínio