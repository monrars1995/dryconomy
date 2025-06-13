<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $db = new PDO('sqlite:../../database/simulations.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $stmt = $db->prepare("
        INSERT INTO simulations (
            lead_id, capacity, location, delta_t, water_flow,
            drycooler_data, tower_data, comparison_data
        ) VALUES (
            :lead_id, :capacity, :location, :delta_t, :water_flow,
            :drycooler_data, :tower_data, :comparison_data
        )
    ");
    
    $stmt->execute($data);
    
    echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
