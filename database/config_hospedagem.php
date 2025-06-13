<?php
/**
 * Script para configurar as credenciais do banco de dados para a hospedagem
 * 
 * Este script atualiza o arquivo config.php com as credenciais da hospedagem
 */

// Verificar se o formulário foi enviado
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['host'], $_POST['dbname'], $_POST['username'], $_POST['password'], $_POST['port'])) {
        // Obter os valores do formulário
        $host = $_POST['host'];
        $dbname = $_POST['dbname'];
        $username = $_POST['username'];
        $password = $_POST['password'];
        $port = $_POST['port'];
        
        // Ler o arquivo config.php atual
        $configFile = __DIR__ . '/config.php';
        $configContent = file_get_contents($configFile);
        
        // Atualizar as configurações do banco de dados
        $pattern = "/\\\$db_config\s*=\s*\[\s*'host'\s*=>\s*'[^']*',\s*\/\/[^\n]*\s*'dbname'\s*=>\s*'[^']*',\s*\/\/[^\n]*\s*'username'\s*=>\s*'[^']*',\s*\/\/[^\n]*\s*'password'\s*=>\s*'[^']*',\s*\/\/[^\n]*\s*'charset'\s*=>\s*'[^']*',\s*\/\/[^\n]*\s*'port'\s*=>\s*'[^']*'/";
        $replacement = "$db_config = [\n    'host'     => '$host',     // Endereço do servidor MySQL\n    'dbname'   => '$dbname',  // Nome do banco de dados\n    'username' => '$username',          // Nome de usuário do MySQL\n    'password' => '$password',              // Senha do MySQL\n    'charset'  => 'utf8mb4',       // Charset da conexão\n    'port'     => '$port'";
        
        $newConfigContent = preg_replace($pattern, $replacement, $configContent);
        
        // Salvar o arquivo atualizado
        if (file_put_contents($configFile, $newConfigContent)) {
            $message = ['success' => true, 'text' => 'Configurações do banco de dados atualizadas com sucesso!'];
            
            // Testar a conexão com o banco de dados
            require_once __DIR__ . '/config.php';
            $testResult = testDbConnection();
            if ($testResult === true) {
                $message['text'] .= ' A conexão com o banco de dados foi testada e está funcionando corretamente.';
            } else {
                $message['success'] = false;
                $message['text'] .= ' No entanto, não foi possível conectar ao banco de dados. Erro: ' . $testResult;
            }
        } else {
            $message = ['success' => false, 'text' => 'Não foi possível salvar as configurações. Verifique as permissões de escrita do arquivo.'];
        }
    } else {
        $message = ['success' => false, 'text' => 'Todos os campos são obrigatórios.'];
    }
}

// Obter as configurações atuais
require_once __DIR__ . '/config.php';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configuração do Banco de Dados - Dryconomy</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #00337A;
            margin-bottom: 20px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
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
            background: #00337A;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background: #002255;
        }
        .alert {
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
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
        .note {
            background-color: #fff3cd;
            border: 1px solid #ffeeba;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Configuração do Banco de Dados - Dryconomy</h1>
        
        <?php if (isset($message)): ?>
            <div class="alert <?php echo $message['success'] ? 'alert-success' : 'alert-danger'; ?>">
                <?php echo $message['text']; ?>
            </div>
        <?php endif; ?>
        
        <div class="note">
            <p><strong>Nota:</strong> Este script atualiza as configurações de conexão com o banco de dados para a hospedagem. Preencha os campos abaixo com as informações fornecidas pelo seu provedor de hospedagem.</p>
        </div>
        
        <form method="post" action="">
            <div class="form-group">
                <label for="host">Host do MySQL:</label>
                <input type="text" id="host" name="host" value="<?php echo htmlspecialchars($db_config['host']); ?>" required>
            </div>
            
            <div class="form-group">
                <label for="dbname">Nome do Banco de Dados:</label>
                <input type="text" id="dbname" name="dbname" value="<?php echo htmlspecialchars($db_config['dbname']); ?>" required>
            </div>
            
            <div class="form-group">
                <label for="username">Usuário do MySQL:</label>
                <input type="text" id="username" name="username" value="<?php echo htmlspecialchars($db_config['username']); ?>" required>
            </div>
            
            <div class="form-group">
                <label for="password">Senha do MySQL:</label>
                <input type="password" id="password" name="password" value="<?php echo htmlspecialchars($db_config['password']); ?>" required>
            </div>
            
            <div class="form-group">
                <label for="port">Porta do MySQL:</label>
                <input type="text" id="port" name="port" value="<?php echo htmlspecialchars($db_config['port']); ?>" required>
            </div>
            
            <button type="submit">Atualizar Configurações</button>
        </form>
        
        <div style="margin-top: 20px;">
            <p>Após configurar o banco de dados, você pode:</p>
            <ul>
                <li><a href="setup_admin.php">Configurar o banco de dados e criar um usuário administrador</a></li>
                <li><a href="../">Voltar para a página inicial</a></li>
            </ul>
        </div>
    </div>
</body>
</html>