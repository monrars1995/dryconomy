<?php
/**
 * Gerenciamento de Variáveis de Cálculo
 * 
 * Este arquivo contém funções para gerenciar as variáveis de cálculo no banco de dados
 */

function handleCalculationVariableRequests($method, $resource_parts, $pdo) {
    $id = $resource_parts[2] ?? null;
    $input = json_decode(file_get_contents('php://input'), true);

    // Adiciona log para depuração
    // error_log("Método: $method, ID: $id, Input: " . print_r($input, true));
    // error_log("Resource parts: " . print_r($resource_parts, true));

    switch ($method) {
        case 'GET':
            if ($id) {
                $data = getCalculationVariableById($id); // Removido $pdo, pois a função original não o usa
            } elseif (isset($_GET['category'])) {
                $data = getCalculationVariablesByCategory($_GET['category']); // Removido $pdo
            } else {
                $data = getAllCalculationVariables(); // Removido $pdo
            }
            if ($data) {
                http_response_code(200);
                echo json_encode($data);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Nenhuma variável de cálculo encontrada.']);
            }
            break;
        case 'POST':
            if (isset($input['name']) && isset($input['value']) && isset($input['category'])) { // Type é opcional conforme schema
                $result = createNewCalculationVariable($input); // Removido $pdo e argumentos individuais
                if ($result) {
                    http_response_code(201);
                    echo json_encode($result);
                } else {
                    http_response_code(500);
                    echo json_encode(['message' => 'Erro ao criar variável de cálculo.']);
                }
            } else {
                http_response_code(400);
                echo json_encode(['message' => 'Dados inválidos para criar variável de cálculo. Campos obrigatórios: name, value, category.']);
            }
            break;
        case 'PUT':
            if ($id && isset($input['name']) && isset($input['value']) && isset($input['category'])) { // Type é opcional
                $result = updateExistingCalculationVariable($id, $input); // Removido $pdo e argumentos individuais
                if ($result) {
                    http_response_code(200);
                    echo json_encode($result);
                } else {
                    http_response_code(404); 
                    echo json_encode(['message' => 'Variável de cálculo não encontrada ou erro ao atualizar.']);
                }
            } else {
                http_response_code(400);
                echo json_encode(['message' => 'Dados inválidos ou ID não fornecido para atualizar variável de cálculo.']);
            }
            break;
        case 'DELETE':
            if ($id) {
                $deleted = deleteExistingCalculationVariable($id); // Removido $pdo
                if ($deleted) {
                    http_response_code(200); 
                    echo json_encode(['message' => 'Variável de cálculo deletada com sucesso.']);
                } else {
                    http_response_code(404);
                    echo json_encode(['message' => 'Variável de cálculo não encontrada.']);
                }
            } else {
                http_response_code(400);
                echo json_encode(['message' => 'ID não fornecido para deletar variável de cálculo.']);
            }
            break;
        default:
            http_response_code(405);
            echo json_encode(['message' => 'Método não permitido.']);
            break;
    }
}


require_once __DIR__ . '/config.php';

/**
 * Função para gerar um UUID v4 (simulando o comportamento do Supabase)
 * Esta função é uma aproximação e pode não ser criptograficamente segura como um UUID real.
 */
function generate_uuid_v4_php() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

/**
 * Busca todas as variáveis de cálculo
 * @return array|bool Lista de variáveis de cálculo ou false em caso de erro
 */
function getAllCalculationVariables() {
    try {
        $db = getDbConnection();
        $stmt = $db->query("SELECT id, name, description, value, unit, category, created_by, updated_by, DATE_FORMAT(created_at, '%Y-%m-%dT%TZ') as created_at, DATE_FORMAT(updated_at, '%Y-%m-%dT%TZ') as updated_at FROM calculation_variables ORDER BY category, name");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log('Erro ao buscar variáveis de cálculo: ' . $e->getMessage());
        return false;
    }
}

/**
 * Busca uma variável de cálculo pelo ID
 * @param string $id ID da variável
 * @return array|bool Dados da variável ou false se não encontrada/erro
 */
function getCalculationVariableById($id) {
    try {
        $db = getDbConnection();
        $stmt = $db->prepare("SELECT id, name, description, value, unit, category, created_by, updated_by, DATE_FORMAT(created_at, '%Y-%m-%dT%TZ') as created_at, DATE_FORMAT(updated_at, '%Y-%m-%dT%TZ') as updated_at FROM calculation_variables WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log('Erro ao buscar variável de cálculo por ID: ' . $e->getMessage());
        return false;
    }
}

/**
 * Cria uma nova variável de cálculo
 * @param array $variableData Dados da nova variável (name, description, value, unit, category)
 * @param string|null $userId ID do usuário que está criando (opcional)
 * @return array|bool Dados da variável criada ou false em caso de erro
 */
function createNewCalculationVariable($variableData, $userId = null) {
    try {
        $db = getDbConnection();
        $newId = generate_uuid_v4_php(); // Gerar UUID via PHP

        $stmt = $db->prepare("
            INSERT INTO calculation_variables (id, name, description, value, unit, category, created_by, updated_by)
            VALUES (:id, :name, :description, :value, :unit, :category, :created_by, :updated_by)
        ");
        
        $success = $stmt->execute([
            ':id' => $newId,
            ':name' => $variableData['name'],
            ':description' => $variableData['description'] ?? null,
            ':value' => $variableData['value'],
            ':unit' => $variableData['unit'] ?? null,
            ':category' => $variableData['category'],
            ':created_by' => $userId,
            ':updated_by' => $userId
        ]);
        
        if ($success) {
            return getCalculationVariableById($newId); // Retorna o objeto completo
        }
        return false;
    } catch (PDOException $e) {
        error_log('Erro ao criar variável de cálculo: ' . $e->getMessage());
        return false;
    }
}

/**
 * Atualiza uma variável de cálculo existente
 * @param string $id ID da variável a ser atualizada
 * @param array $updates Campos para atualizar (name, description, value, unit, category)
 * @param string|null $userId ID do usuário que está atualizando (opcional)
 * @return array|bool Dados da variável atualizada ou false em caso de erro
 */
function updateExistingCalculationVariable($id, $updates, $userId = null) {
    try {
        $db = getDbConnection();
        $stmt = $db->prepare("
            UPDATE calculation_variables 
            SET name = :name, 
                description = :description, 
                value = :value, 
                unit = :unit, 
                category = :category, 
                updated_by = :updated_by,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = :id
        ");
        
        $success = $stmt->execute([
            ':id' => $id,
            ':name' => $updates['name'],
            ':description' => $updates['description'] ?? null,
            ':value' => $updates['value'],
            ':unit' => $updates['unit'] ?? null,
            ':category' => $updates['category'],
            ':updated_by' => $userId
        ]);
        if ($success) {
            return getCalculationVariableById($id);
        }
        return false;
    } catch (PDOException $e) {
        error_log('Erro ao atualizar variável de cálculo: ' . $e->getMessage());
        return false;
    }
}

/**
 * Remove uma variável de cálculo
 * @param string $id ID da variável a ser removida
 * @return bool True se bem-sucedido, false caso contrário
 */
function deleteExistingCalculationVariable($id) {
    try {
        $db = getDbConnection();
        $stmt = $db->prepare("DELETE FROM calculation_variables WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    } catch (PDOException $e) {
        error_log('Erro ao excluir variável de cálculo: ' . $e->getMessage());
        return false;
    }
}

/**
 * Busca variáveis de cálculo por categoria
 * @param string $category Categoria para filtrar
 * @return array|bool Lista de variáveis ou false em caso de erro
 */
function getCalculationVariablesByCategory($category) {
    try {
        $db = getDbConnection();
        $stmt = $db->prepare("SELECT id, name, description, value, unit, category, created_by, updated_by, DATE_FORMAT(created_at, '%Y-%m-%dT%TZ') as created_at, DATE_FORMAT(updated_at, '%Y-%m-%dT%TZ') as updated_at FROM calculation_variables WHERE category = :category ORDER BY name");
        $stmt->execute([':category' => $category]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log('Erro ao buscar variáveis por categoria: ' . $e->getMessage());
        return false;
    }
}

?>