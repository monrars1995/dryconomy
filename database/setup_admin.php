<?php
/**
 * Script para configuração inicial do banco de dados e criação de usuário administrador
 * 
 * Este script deve ser executado após a instalação do banco de dados
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/users.php';

// Função para instalar o banco de dados
function setupDatabase() {
    global $db_config;
    
    try {
        // Conectar ao MySQL sem selecionar um banco de dados
        $dsn = "mysql:host={$db_config['host']};charset={$db_config['charset']};port={$db_config['port']}";
        $pdo = new PDO($dsn, $db_config['username'], $db_config['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
        
        // Criar o banco de dados se não existir
        $pdo->exec("CREATE DATABASE IF NOT EXISTS {$db_config['dbname']} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        
        // Selecionar o banco de dados
        $pdo->exec("USE {$db_config['dbname']}");
        
        // Ler o arquivo SQL
        $sql = file_get_contents(__DIR__ . '/schema.sql');
        
        // Executar o script SQL
        $pdo->exec($sql);
        
        return ['success' => true, 'message' => 'Banco de dados instalado com sucesso!'];
    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Erro ao instalar o banco de dados: ' . $e->getMessage()];
    }
}

// Função para criar usuário administrador
function createAdminUser($name, $email, $password) {
    // Verificar se já existe algum usuário admin
    try {
        $db = getDbConnection();
        $stmt = $db->prepare("SELECT COUNT(*) FROM users WHERE role = 'admin'");
        $stmt->execute();
        $adminCount = $stmt->fetchColumn();
        
        if ($adminCount > 0) {
            return ['success' => false, 'message' => 'Já existe pelo menos um usuário administrador no sistema.'];
        }
        
        // Criar o usuário administrador
        $userId = createUser($name, $email, $password, 'admin');
        
        if ($userId) {
            return ['success' => true, 'message' => 'Usuário administrador criado com sucesso!', 'userId' => $userId];
        } else {
            return ['success' => false, 'message' => 'Erro ao criar usuário administrador.'];
        }
    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Erro ao verificar/criar usuário administrador: ' . $e->getMessage()];
    }
}

// Verificar se o formulário foi enviado
$message = null;
$db_status = null;
$admin_status = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        if ($_POST['action'] === 'setup_database') {
            // Instalar banco de dados
            $db_status = setupDatabase();
        } else if ($_POST['action'] === 'create_admin') {
            // Criar usuário administrador
            if (isset($_POST['name'], $_POST['email'], $_POST['password'])) {
                $admin_status = createAdminUser(
                    $_POST['name'],
                    $_POST['email'],
                    $_POST['password']
                );
            } else {
                $admin_status = ['success' => false, 'message' => 'Todos os campos são obrigatórios.'];
            }
        }
    }
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configuração Inicial Dryconomy</title>
    <style>
        body {
            font-family: 'Poppins', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        h1, h2 {
            color: #00337A;
        }
        .container {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
        }
        input[type="text"],
        input[type="email"],
        input[type="password"] {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
        }
        button {
            background-color: #00337A;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
        }
        button:hover {
            background-color: #002255;
        }
        .alert {
            padding: 10px 15px;
            border-radius: 4px;
            margin-bottom: 15px;
        }
        .alert-success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .alert-danger {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .steps {
            margin-top: 20px;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
        .step {
            margin-bottom: 30px;
        }
        .step-number {
            display: inline-block;
            width: 30px;
            height: 30px;
            background-color: #00337A;
            color: white;
            border-radius: 50%;
            text-align: center;
            line-height: 30px;
            margin-right: 10px;
        }
    </style>
</head>
<body>
    <h1>Configuração Inicial Dryconomy</h1>
    
    <div class="container">
        <h2>1. Configuração do Banco de Dados</h2>
        
        <?php if ($db_status): ?>
            <div class="alert <?php echo $db_status['success'] ? 'alert-success' : 'alert-danger'; ?>">
                <?php echo $db_status['message']; ?>
            </div>
        <?php endif; ?>
        
        <p>Este passo irá criar o banco de dados e todas as tabelas necessárias para o funcionamento do sistema.</p>
        
        <form method="post" action="">
            <input type="hidden" name="action" value="setup_database">
            <button type="submit">Configurar Banco de Dados</button>
        </form>
    </div>
    
    <div class="container">
        <h2>2. Criar Usuário Administrador</h2>
        
        <?php if ($admin_status): ?>
            <div class="alert <?php echo $admin_status['success'] ? 'alert-success' : 'alert-danger'; ?>">
                <?php echo $admin_status['message']; ?>
            </div>
        <?php endif; ?>
        
        <p>Crie um usuário administrador para acessar o painel administrativo do sistema.</p>
        
        <form method="post" action="">
            <input type="hidden" name="action" value="create_admin">
            
            <div class="form-group">
                <label for="name">Nome:</label>
                <input type="text" id="name" name="name" required>
            </div>
            
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>
            </div>
            
            <div class="form-group">
                <label for="password">Senha:</label>
                <input type="password" id="password" name="password" required>
            </div>
            
            <button type="submit">Criar Usuário Administrador</button>
        </form>
    </div>
    
    <div class="container">
        <h2>Próximos Passos</h2>
        <p>Após configurar o banco de dados e criar um usuário administrador, você pode:</p>
        <ul>
            <li>Acessar o <a href="/login">painel administrativo</a> com as credenciais criadas</li>
            <li>Configurar os parâmetros do sistema</li>
            <li>Começar a utilizar o simulador Dryconomy</li>
        </ul>
    </div>
</body>
</html>