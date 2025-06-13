<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Log de debug
error_log("Recebendo requisição de simulação");

try {
    // Verificar se recebemos os dados
    if (!isset($_POST['userData']) || !isset($_POST['inputs']) || !isset($_POST['results'])) {
        throw new Exception('Dados incompletos');
    }

    // Decodificar os dados JSON
    $userData = json_decode($_POST['userData'], true);
    $inputs = json_decode($_POST['inputs'], true);
    $results = json_decode($_POST['results'], true);

    // Log dos dados recebidos
    error_log("Dados recebidos: " . print_r([
        'userData' => $userData,
        'inputs' => $inputs,
        'results' => $results
    ], true));

    // Aqui você pode salvar os dados no banco de dados
    // Por enquanto, apenas retornaremos sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Simulação salva com sucesso',
        'data' => [
            'timestamp' => date('Y-m-d H:i:s'),
            'id' => uniqid()
        ]
    ]);

} catch (Exception $e) {
    error_log("Erro na API: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
