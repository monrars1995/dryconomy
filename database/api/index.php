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

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../leads.php';
require_once __DIR__ . '/../simulations.php';

function debugLog($message) {
    error_log(print_r($message, true));
}

try {
    debugLog("Request recebida: " . print_r($_POST, true));
    debugLog("Files recebidos: " . print_r($_FILES, true));

    if (!isset($_POST['action'])) {
        throw new Exception('Ação não especificada');
    }

    switch ($_POST['action']) {
        case 'save_lead':
            if (empty($_POST['name']) || empty($_POST['email'])) {
                throw new Exception('Dados do lead incompletos');
            }

            $leadData = [
                'name' => $_POST['name'],
                'email' => $_POST['email'],
                'company' => $_POST['company'] ?? '',
                'phone' => $_POST['phone'] ?? '',
                'state' => $_POST['state'] ?? ''
            ];

            debugLog("Salvando lead: " . print_r($leadData, true));
            $leadId = saveLead($leadData);

            if (!$leadId) {
                throw new Exception('Erro ao salvar lead');
            }

            echo $leadId;
            break;

        case 'save_simulation':
            // Debug
            debugLog("Salvando simulação");

            if (!isset($_POST['lead_id']) || !isset($_POST['capacity'])) {
                throw new Exception('Dados da simulação incompletos');
            }

            $simulationData = [
                'lead_id' => $_POST['lead_id'],
                'capacity' => $_POST['capacity'],
                'location' => $_POST['location'],
                'delta_t' => $_POST['delta_t'],
                'water_flow' => $_POST['water_flow']
            ];

            $drycoolerData = json_decode($_POST['drycooler_data'], true);
            $towerData = json_decode($_POST['tower_data'], true);
            $comparisonData = json_decode($_POST['comparison_data'], true);

            debugLog("Dados da simulação: " . print_r($simulationData, true));

            $simulationId = saveSimulation(
                $simulationData,
                $drycoolerData,
                $towerData,
                $comparisonData
            );

            if (!$simulationId) {
                throw new Exception('Erro ao salvar simulação');
            }

            echo $simulationId;
            break;

        default:
            throw new Exception('Ação inválida');
    }
} catch (Exception $e) {
    debugLog("Erro: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
