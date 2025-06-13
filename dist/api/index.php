<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../../database/config.php';

try {
    $pdo = new PDO('sqlite:' . __DIR__ . '/../../database/simulations.db');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if ($_SERVER['REQUEST_URI'] === '/api/leads') {
        // Save lead
        $stmt = $pdo->prepare("
            INSERT INTO leads (name, email, company, phone, state)
            VALUES (:name, :email, :company, :phone, :state)
        ");
        
        $stmt->execute([
            ':name' => $data['name'],
            ':email' => $data['email'],
            ':company' => $data['company'] ?? '',
            ':phone' => $data['phone'] ?? '',
            ':state' => $data['state'] ?? ''
        ]);
        
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    }
    elseif ($_SERVER['REQUEST_URI'] === '/api/simulations') {
        // Save simulation
        $stmt = $pdo->prepare("
            INSERT INTO simulations (lead_id, capacity, location, results_json)
            VALUES (:lead_id, :capacity, :location, :results_json)
        ");
        
        $stmt->execute([
            ':lead_id' => $data['lead_id'],
            ':capacity' => $data['capacity'],
            ':location' => $data['location'],
            ':results_json' => $data['results_json']
        ]);
        
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    }
    else {
        throw new Exception('Invalid endpoint');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
