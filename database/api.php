<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
/**
 * API RESTful para o Simulador Dryconomy
 * 
 * Este arquivo implementa endpoints da API para interação com o banco de dados
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/users.php';
require_once __DIR__ . '/leads.php';
require_once __DIR__ . '/simulations.php';
require_once __DIR__ . '/reports.php';
require_once __DIR__ . '/calculation_variables.php';

// Configurações de CORS para permitir acesso da aplicação frontend
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Se for uma requisição OPTIONS (preflight), retornar apenas os headers
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Obter o caminho da URL após /api/
$request_uri = $_SERVER['REQUEST_URI'];
$base_path = '/api/';
$path = substr($request_uri, strpos($request_uri, $base_path) + strlen($base_path));
$path = parse_url($path, PHP_URL_PATH);

// Dividir o caminho em segmentos
$segments = explode('/', trim($path, '/'));
$resource = $segments[0] ?? '';
$id = $segments[1] ?? null;
$action = $segments[2] ?? null;

// Obter o método HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Obter dados da requisição
$data = json_decode(file_get_contents('php://input'), true);

// Função para responder com JSON
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

// Função para verificar autenticação
function authenticate() {
    $headers = getallheaders();
    $auth_header = $headers['Authorization'] ?? '';
    
    if (empty($auth_header) || !preg_match('/Bearer\s+(\S+)/', $auth_header, $matches)) {
        jsonResponse(['error' => 'Unauthorized'], 401);
    }
    
    $token = $matches[1];
    
    // Implementar verificação de token JWT aqui
    // Por enquanto, vamos usar uma verificação simples
    if ($token !== 'dryconomy_test_token') {
        jsonResponse(['error' => 'Invalid token'], 401);
    }
    
    return true;
}

// Roteamento da API
switch ($resource) {
    case 'auth':
        handleAuthRequests($method, $data);
        break;
        
    case 'users':
        authenticate();
        handleUserRequests($method, $id, $action, $data);
        break;
        
    case 'leads':
        authenticate();
        handleLeadRequests($method, $id, $action, $data);
        break;
        
    case 'simulations':
        authenticate();
        handleSimulationRequests($method, $id, $action, $data);
        break;
        
    case 'reports':
        authenticate();
        handleReportRequests($method, $id, $action, $data);
        break;
        
    case 'cities':
        handleCityRequests($method, $id, $data);
        break;

    case 'calculation-variables':
        // As rotas de calculation-variables não requerem autenticação por enquanto, 
        // conforme o frontend não envia token para este endpoint específico.
        // Se for necessário, adicionar authenticate(); aqui.
        handleCalculationVariableRequests($method, $id, $data);
        break;
        
    default:
        jsonResponse(['error' => 'Resource not found'], 404);
}

/**
 * Manipular requisições de autenticação
 */
function handleAuthRequests($method, $data) {
    if ($method !== 'POST') {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }
    
    if (empty($data['email']) || empty($data['password'])) {
        jsonResponse(['error' => 'Email and password are required'], 400);
    }
    
    $user = authenticateUser($data['email'], $data['password']);
    
    if (!$user) {
        jsonResponse(['error' => 'Invalid credentials'], 401);
    }
    
    // Gerar token JWT (implementação simplificada)
    $token = 'dryconomy_test_token';
    
    jsonResponse([
        'token' => $token,
        'user' => $user
    ]);
}

/**
 * Manipular requisições de usuários
 */
function handleUserRequests($method, $id, $action, $data) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $user = getUserById($id);
                if (!$user) {
                    jsonResponse(['error' => 'User not found'], 404);
                }
                jsonResponse($user);
            } else {
                $users = getAllUsers();
                jsonResponse($users);
            }
            break;
            
        case 'POST':
            if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
                jsonResponse(['error' => 'Name, email and password are required'], 400);
            }
            
            $userId = createUser(
                $data['name'],
                $data['email'],
                $data['password'],
                $data['role'] ?? 'user'
            );
            
            if (!$userId) {
                jsonResponse(['error' => 'Failed to create user or email already exists'], 400);
            }
            
            jsonResponse(['id' => $userId], 201);
            break;
            
        case 'PUT':
            if (!$id) {
                jsonResponse(['error' => 'User ID is required'], 400);
            }
            
            $success = updateUser($id, $data);
            
            if (!$success) {
                jsonResponse(['error' => 'Failed to update user'], 400);
            }
            
            jsonResponse(['success' => true]);
            break;
            
        case 'DELETE':
            // Implementar exclusão de usuário
            jsonResponse(['error' => 'Not implemented'], 501);
            break;
            
        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }
}



/**
 * Manipular requisições de leads
 */
function handleLeadRequests($method, $id, $action, $data) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $lead = getLeadById($id);
                if (!$lead) {
                    jsonResponse(['error' => 'Lead not found'], 404);
                }
                jsonResponse($lead);
            } else if ($action === 'statistics') {
                $stats = getLeadStatistics();
                jsonResponse($stats);
            } else {
                $limit = $_GET['limit'] ?? null;
                $offset = $_GET['offset'] ?? null;
                $leads = getAllLeads($limit, $offset);
                jsonResponse($leads);
            }
            break;
            
        case 'POST':
            if (empty($data['name']) || empty($data['email'])) {
                jsonResponse(['error' => 'Name and email are required'], 400);
            }
            
            $leadId = saveLead($data);
            
            if (!$leadId) {
                jsonResponse(['error' => 'Failed to save lead'], 400);
            }
            
            jsonResponse(['id' => $leadId], 201);
            break;
            
        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }
}



/**
 * Manipular requisições de simulações
 */
function handleSimulationRequests($method, $id, $action, $data) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $simulation = getSimulationById($id);
                if (!$simulation) {
                    jsonResponse(['error' => 'Simulation not found'], 404);
                }
                jsonResponse($simulation);
            } else {
                $limit = $_GET['limit'] ?? null;
                $offset = $_GET['offset'] ?? null;
                $simulations = getAllSimulations($limit, $offset);
                jsonResponse($simulations);
            }
            break;
            
        case 'POST':
            if (empty($data['inputs']) || empty($data['results'])) {
                jsonResponse(['error' => 'Simulation data is incomplete'], 400);
            }
            
            $simulationData = [
                'capacity' => $data['inputs']['capacity'],
                'location' => $data['inputs']['location'],
                'delta_t' => $data['inputs']['deltaT'],
                'water_flow' => $data['inputs']['waterFlow'],
                'lead_id' => $data['lead_id'] ?? null
            ];
            
            $simulationId = saveSimulation(
                $simulationData,
                $data['results']['drycooler'],
                $data['results']['tower'],
                $data['results']['comparison']
            );
            
            if (!$simulationId) {
                jsonResponse(['error' => 'Failed to save simulation'], 400);
            }
            
            jsonResponse(['id' => $simulationId], 201);
            break;
            
        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }
}



/**
 * Manipular requisições de relatórios
 */
function handleReportRequests($method, $id, $action, $data) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $report = getDetailedReportById($id);
                if (!$report) {
                    jsonResponse(['error' => 'Report not found'], 404);
                }
                jsonResponse($report);
            } else if (!empty($_GET['simulation_id'])) {
                $reports = getDetailedReportsBySimulation($_GET['simulation_id']);
                jsonResponse($reports);
            } else {
                jsonResponse(['error' => 'Report ID or simulation_id is required'], 400);
            }
            break;
            
        case 'POST':
            if (empty($data['simulation_id']) || empty($data['report_data'])) {
                jsonResponse(['error' => 'Simulation ID and report data are required'], 400);
            }
            
            $reportId = saveDetailedReport(
                $data['simulation_id'],
                $data['lead_id'] ?? null,
                $data['report_data']
            );
            
            if (!$reportId) {
                jsonResponse(['error' => 'Failed to save report'], 400);
            }
            
            jsonResponse(['id' => $reportId], 201);
            break;
            
        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }
}



/**
 * Manipular requisições de cidades
 */
function handleCityRequests($method, $id, $data) {
    // Função para obter parâmetros de cidades do banco de dados
    function getCityParameters() {
        try {
            $db = getDbConnection();
            $stmt = $db->query("SELECT * FROM city_parameters ORDER BY city_name");
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log('Erro ao buscar parâmetros de cidades: ' . $e->getMessage());
            return false;
        }
    }
    
    // Função para obter uma cidade pelo nome
    function getCityByName($cityName) {
        try {
            $db = getDbConnection();
            $stmt = $db->prepare("SELECT * FROM city_parameters WHERE city_name = :city_name");
            $stmt->execute([':city_name' => $cityName]);
            return $stmt->fetch();
        } catch (PDOException $e) {
            error_log('Erro ao buscar cidade: ' . $e->getMessage());
            return false;
        }
    }
    
    // Função para atualizar parâmetros de uma cidade
    function updateCityParameters($cityName, $cityData) {
        try {
            $db = getDbConnection();
            $stmt = $db->prepare("
                UPDATE city_parameters 
                SET capacity = :capacity,
                    water_flow = :water_flow,
                    makeup_water_fan_logic = :makeup_water_fan_logic,
                    water_consumption_fan_logic = :water_consumption_fan_logic,
                    updated_at = CURRENT_TIMESTAMP
                WHERE city_name = :city_name
            ");
            
            return $stmt->execute([
                ':city_name' => $cityName,
                ':capacity' => $cityData['capacity'],
                ':water_flow' => $cityData['water_flow'],
                ':makeup_water_fan_logic' => $cityData['makeup_water_fan_logic'],
                ':water_consumption_fan_logic' => $cityData['water_consumption_fan_logic']
            ]);
        } catch (PDOException $e) {
            error_log('Erro ao atualizar cidade: ' . $e->getMessage());
            return false;
        }
    }
    
    switch ($method) {
        case 'GET':
            if ($id) {
                $city = getCityByName($id);
                if (!$city) {
                    jsonResponse(['error' => 'City not found'], 404);
                }
                jsonResponse($city);
            } else {
                $cities = getCityParameters();
                jsonResponse($cities);
            }
            break;
            
        case 'PUT':
            authenticate(); // Requer autenticação para atualizar
            
            if (!$id) {
                jsonResponse(['error' => 'City name is required'], 400);
            }
            
            if (empty($data['capacity']) || empty($data['water_flow']) || 
                !isset($data['makeup_water_fan_logic']) || !isset($data['water_consumption_fan_logic'])) {
                jsonResponse(['error' => 'All city parameters are required'], 400);
            }
            
            $success = updateCityParameters($id, $data);
            
            if (!$success) {
                jsonResponse(['error' => 'Failed to update city parameters'], 400);
            }
            
            jsonResponse(['success' => true]);
            break;
            
        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }
}