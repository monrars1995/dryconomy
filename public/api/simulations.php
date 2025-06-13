<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../../database/config.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $db = new PDO('sqlite:' . __DIR__ . '/../../database/simulations.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $stmt = $db->prepare("
        INSERT INTO simulations (
            lead_id, capacity, location, results_json
        ) VALUES (
            :lead_id, :capacity, :location, :results_json
        )
    ");
    
    $stmt->execute([
        ':lead_id' => $data['lead_id'],
        ':capacity' => $data['capacity'],
        ':location' => $data['location'],
        ':results_json' => json_encode([
            'inputs' => $data['inputs'],
            'results' => $data['results']
        ])
    ]);
    
    echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
