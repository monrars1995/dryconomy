<?php

// Database configuration for MySQL connection
// Update these values with your actual database credentials

// Database connection parameters
define('DB_HOST', 'localhost');
define('DB_NAME', 'dryconomy_db');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_PORT', 3306);
define('DB_CHARSET', 'utf8mb4');

// PDO options for better error handling and security
$pdo_options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET
];

/**
 * Get database connection
 * @return PDO Database connection object
 * @throws Exception If connection fails
 */
function getDbConnection() {
    global $pdo_options;
    
    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $pdo_options);
        return $pdo;
    } catch (PDOException $e) {
        error_log('Database connection failed: ' . $e->getMessage());
        throw new Exception('Erro de conexão com o banco de dados: ' . $e->getMessage());
    }
}

/**
 * Test database connection
 * @return array Connection test result
 */
function testDbConnection() {
    try {
        $pdo = getDbConnection();
        
        // Test with a simple query
        $stmt = $pdo->query("SELECT 1 as test");
        $result = $stmt->fetch();
        
        if ($result && $result['test'] == 1) {
            return [
                'success' => true,
                'message' => 'Conexão com o banco de dados estabelecida com sucesso.',
                'host' => DB_HOST,
                'database' => DB_NAME,
                'port' => DB_PORT
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Falha no teste de consulta ao banco de dados.'
            ];
        }
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'Erro ao testar conexão: ' . $e->getMessage()
        ];
    }
}

/**
 * Initialize database connection for legacy scripts
 * This maintains compatibility with older code that expects a global $pdo variable
 */
try {
    $pdo = getDbConnection();
} catch (Exception $e) {
    error_log('Failed to initialize database connection: ' . $e->getMessage());
    $pdo = null;
}

?>