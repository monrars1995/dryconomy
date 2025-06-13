<?php
/**
 * Instalador do Banco de Dados Dryconomy
 * 
 * Este script permite instalar o banco de dados e testar a conexão
 */

require_once __DIR__ . '/config.php';

// Função para executar o script SQL
function installDatabase() {
    global $db_config;
    
    try {
        // Conectar ao MySQL sem selecionar um banco de dados
        $dsn = "mysql:host={$db_config['host']};charset={$db_config['charset']};port={$db_config['port']}";
        $pdo = new PDO($dsn, $db_config['username'], $db_config['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
        
        // Ler o arquivo SQL
        $sql = file_get_contents(__DIR__ . '/schema.sql');
        
        // Executar o script SQL
        $pdo->exec($sql);
        
        return ['success' => true, 'message' => 'Banco de dados instalado com sucesso!'];
    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Erro ao instalar o banco de dados: ' . $e->getMessage()];
    }
}

// Verificar se o formulário foi enviado
$message = null;
$connection_status = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        if ($_POST['action'] === 'test_connection') {
            // Atualizar configurações do banco de dados
            if (isset($_POST['host'], $_POST['dbname'], $_POST['username'], $_POST['password'], $_POST['port'])) {
                $db_config['host'] = $_POST['host'];
                $db_config['dbname'] = $_POST['dbname'];
                $db_config['username'] = $_POST['username'];
                $db_config['password'] = $_POST['password'];
                $db_config['port'] = $_POST['port'];
                
                // Salvar configurações no arquivo
                $config_content = "<?php\n/**\n * Configuração de conexão com o banco de dados MySQL\n * \n * Este arquivo contém as configurações necessárias para conectar ao banco de dados MySQL\n * Edite as variáveis abaixo com as informações do seu servidor\n */\n\n// Configurações do banco de dados\n\$db_config = [\n    'host'     => '{$db_config['host']}',     // Endereço do servidor MySQL\n    'dbname'   => '{$db_config['dbname']}',  // Nome do banco de dados\n    'username' => '{$db_config['username']}',          // Nome de usuário do MySQL\n    'password' => '{$db_config['password']}',              // Senha do MySQL\n    'charset'  => '{$db_config['charset']}',       // Charset da conexão\n    'port'     => '{$db_config['port']}'           // Porta do MySQL (padrão: 3306)\n];\n\n/**\n * Função para criar uma conexão PDO com o banco de dados\n * \n * @return PDO Objeto de conexão PDO\n */\nfunction getDbConnection() {\n    global \$db_config;\n    \n    try {\n        \$dsn = \"mysql:host={\$db_config['host']};dbname={\$db_config['dbname']};charset={\$db_config['charset']};port={\$db_config['port']}\";\n        \n        \$options = [\n            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,\n            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,\n            PDO::ATTR_EMULATE_PREPARES   => false,\n        ];\n        \n        return new PDO(\$dsn, \$db_config['username'], \$db_config['password'], \$options);\n    } catch (PDOException \$e) {\n        // Em ambiente de produção, você deve registrar o erro em um log\n        // e exibir uma mensagem genérica para o usuário\n        die('Erro de conexão com o banco de dados: ' . \$e->getMessage());\n    }\n}\n\n/**\n * Função para testar a conexão com o banco de dados\n * \n * @return bool|string true se a conexão for bem-sucedida, mensagem de erro caso contrário\n */\nfunction testDbConnection() {\n    try {\n        \$conn = getDbConnection();\n        return true;\n    } catch (Exception \$e) {\n        return \$e->getMessage();\n    }\n}\n";
                
                file_put_contents(__DIR__ . '/config.php', $config_content);
            }
            
            // Testar conexão
            $connection_test = testDbConnection();
            if ($connection_test === true) {
                $connection_status = ['success' => true, 'message' => 'Conexão com o banco de dados estabelecida com sucesso!'];
            } else {
                $connection_status = ['success' => false, 'message' => 'Erro ao conectar ao banco de dados: ' . $connection_test];
            }
        } else if ($_POST['action'] === 'install_database') {
            // Instalar banco de dados
            $result = installDatabase();
            $message = $result;
        }
    }
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instalador do Banco de Dados Dryconomy</title>
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
    <h1>Instalador do Banco de Dados Dryconomy</h1>
    
    <div class="container">
        <h2>Configuração da Conexão</h2>
        
        <?php if ($connection_status): ?>
            <div class="alert <?php echo $connection_status['success'] ? 'alert-success' : 'alert-danger'; ?>">
                <?php echo $connection_status['message']; ?>
            </div>
        <?php endif; ?>
        
        <form method="post" action="">
            <input type="hidden" name="action" value="test_connection">
            
            <div class="form-group">
                <label for="host">Host:</label>
                <input type="text" id="host" name="host" value="<?php echo $db_config['host']; ?>" required>
            </div>
            
            <div class="form-group">
                <label for="dbname">Nome do Banco de Dados:</label>
                <input type="text" id="dbname" name="dbname" value="<?php echo $db_config['dbname']; ?>" required>
            </div>
            
            <div class="form-group">
                <label for="username">Usuário:</label>
                <input type="text" id="username" name="username" value="<?php echo $db_config['username']; ?>" required>
            </div>
            
            <div class="form-group">
                <label for="password">Senha:</label>
                <input type="password" id="password" name="password" value="<?php echo $db_config['password']; ?>">
            </div>
            
            <div class="form-group">
                <label for="port">Porta:</label>
                <input type="text" id="port" name="port" value="<?php echo $db_config['port']; ?>" required>
            </div>
            
            <button type="submit">Testar Conexão</button>
        </form>
    </div>
    
    <div class="container">
        <h2>Instalação do Banco de Dados</h2>
        
        <?php if ($message): ?>
            <div class="alert <?php echo $message['success'] ? 'alert-success' : 'alert-danger'; ?>">
                <?php echo $message['message']; ?>
            </div>
        <?php endif; ?>
        
        <p>Clique no botão abaixo para criar o banco de dados e as tabelas necessárias:</p>
        
        <form method="post" action="">
            <input type="hidden" name="action" value="install_database">
            <button type="submit">Instalar Banco de Dados</button>
        </form>
    </div>
    
    <div class="container steps">
        <h2>Passos para Instalação</h2>
        
        <div class="step">
            <span class="step-number">1</span>
            <strong>Configure a conexão com o banco de dados</strong>
            <p>Preencha os dados de conexão com o seu servidor MySQL e clique em "Testar Conexão".</p>
        </div>
        
        <div class="step">
            <span class="step-number">2</span>
            <strong>Instale o banco de dados</strong>
            <p>Após confirmar que a conexão está funcionando, clique em "Instalar Banco de Dados" para criar as tabelas necessárias.</p>
        </div>
        
        <div class="step">
            <span class="step-number">3</span>
            <strong>Configure o backend</strong>
            <p>Após a instalação bem-sucedida, você pode começar a usar o backend do Dryconomy.</p>
        </div>
    </div>
</body>
</html>