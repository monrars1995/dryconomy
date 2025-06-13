<?php
require_once 'config.php';

function saveSimulationToDatabase($simulationData) {
    try {
        $db = new PDO('sqlite:' . __DIR__ . '/simulations.db');
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Salvar lead
        $stmt = $db->prepare("INSERT INTO leads (name, email, company, phone, state) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $simulationData['userData']['name'],
            $simulationData['userData']['email'],
            $simulationData['userData']['company'],
            $simulationData['userData']['phone'],
            $simulationData['userData']['state']
        ]);
        
        $leadId = $db->lastInsertId();
        
        // Salvar simulação
        $stmt = $db->prepare("INSERT INTO simulations (lead_id, capacity, location, operating_hours, operating_days, results_json, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $leadId,
            $simulationData['capacity'],
            $simulationData['location'],
            $simulationData['operatingHours'] ?? 24.0,
            $simulationData['operatingDays'] ?? 7.0,
            json_encode($simulationData['results']),
            $simulationData['timestamp']
        ]);
        
        return ['success' => true, 'id' => $db->lastInsertId()];
    } catch (PDOException $e) {
        error_log('Database Error: ' . $e->getMessage());
        return ['success' => false, 'error' => $e->getMessage()];
    }
}
