<?php
/**
 * Gerenciamento de Simulações
 * 
 * Este arquivo contém funções para gerenciar simulações no banco de dados
 */

require_once __DIR__ . '/config.php';

/**
 * Função para salvar uma nova simulação no banco de dados
 * 
 * @param array $simulationData Dados da simulação (capacity, location, delta_t, water_flow, lead_id)
 * @param array $drycoolerData Dados do resultado do drycooler
 * @param array $towerData Dados do resultado da torre
 * @param array $comparisonData Dados da comparação
 * @return int|bool ID da simulação inserida ou false em caso de erro
 */
function saveSimulation($simulationData, $drycoolerData, $towerData, $comparisonData) {
    try {
        $db = getDbConnection();
        $db->beginTransaction();
        
        // Inserir simulação
        $stmt = $db->prepare("
            INSERT INTO simulations (lead_id, capacity, location, delta_t, water_flow)
            VALUES (:lead_id, :capacity, :location, :delta_t, :water_flow)
        ");
        
        $stmt->execute([
            ':lead_id' => $simulationData['lead_id'] ?? null,
            ':capacity' => $simulationData['capacity'],
            ':location' => $simulationData['location'],
            ':delta_t' => $simulationData['delta_t'],
            ':water_flow' => $simulationData['water_flow']
        ]);
        
        $simulationId = $db->lastInsertId();
        
        // Inserir resultado do drycooler
        $stmt = $db->prepare("
            INSERT INTO drycooler_results (
                simulation_id, module_capacity, modules, total_capacity, 
                nominal_water_flow, evaporation_percentage, evaporation_flow,
                hourly_consumption, daily_consumption, monthly_consumption, yearly_consumption
            ) VALUES (
                :simulation_id, :module_capacity, :modules, :total_capacity,
                :nominal_water_flow, :evaporation_percentage, :evaporation_flow,
                :hourly_consumption, :daily_consumption, :monthly_consumption, :yearly_consumption
            )
        ");
        
        $stmt->execute([
            ':simulation_id' => $simulationId,
            ':module_capacity' => $drycoolerData['moduleCapacity'],
            ':modules' => $drycoolerData['modules'],
            ':total_capacity' => $drycoolerData['totalCapacity'],
            ':nominal_water_flow' => $drycoolerData['nominalWaterFlow'],
            ':evaporation_percentage' => $drycoolerData['evaporationPercentage'],
            ':evaporation_flow' => $drycoolerData['evaporationFlow'],
            ':hourly_consumption' => $drycoolerData['consumption']['hourly'],
            ':daily_consumption' => $drycoolerData['consumption']['daily'],
            ':monthly_consumption' => $drycoolerData['consumption']['monthly'],
            ':yearly_consumption' => $drycoolerData['consumption']['yearly']
        ]);
        
        // Inserir resultado da torre
        $stmt = $db->prepare("
            INSERT INTO tower_results (
                simulation_id, capacity, nominal_water_flow, 
                evaporation_percentage, evaporation_flow,
                hourly_consumption, daily_consumption, monthly_consumption, yearly_consumption
            ) VALUES (
                :simulation_id, :capacity, :nominal_water_flow,
                :evaporation_percentage, :evaporation_flow,
                :hourly_consumption, :daily_consumption, :monthly_consumption, :yearly_consumption
            )
        ");
        
        $stmt->execute([
            ':simulation_id' => $simulationId,
            ':capacity' => $towerData['capacity'],
            ':nominal_water_flow' => $towerData['nominalWaterFlow'],
            ':evaporation_percentage' => $towerData['evaporationPercentage'],
            ':evaporation_flow' => $towerData['evaporationFlow'],
            ':hourly_consumption' => $towerData['consumption']['hourly'],
            ':daily_consumption' => $towerData['consumption']['daily'],
            ':monthly_consumption' => $towerData['consumption']['monthly'],
            ':yearly_consumption' => $towerData['consumption']['yearly']
        ]);
        
        // Inserir comparação
        $stmt = $db->prepare("
            INSERT INTO comparison_results (
                simulation_id, yearly_difference, yearly_difference_percentage, sustainability_score
            ) VALUES (
                :simulation_id, :yearly_difference, :yearly_difference_percentage, :sustainability_score
            )
        ");
        
        // Calcular sustainability score
        $maxScore = 100;
        $score = ($comparisonData['yearlyDifferencePercentage'] / 100) * $maxScore;
        $sustainabilityScore = min(max($score, 0), $maxScore);
        
        $stmt->execute([
            ':simulation_id' => $simulationId,
            ':yearly_difference' => $comparisonData['yearlyDifference'],
            ':yearly_difference_percentage' => $comparisonData['yearlyDifferencePercentage'],
            ':sustainability_score' => $sustainabilityScore
        ]);
        
        $db->commit();
        return $simulationId;
    } catch (PDOException $e) {
        $db->rollBack();
        error_log('Erro ao salvar simulação: ' . $e->getMessage());
        return false;
    }
}

/**
 * Função para obter uma simulação completa pelo ID
 * 
 * @param int $simulationId ID da simulação
 * @return array|bool Dados completos da simulação ou false em caso de erro
 */
function getSimulationById($simulationId) {
    try {
        $db = getDbConnection();
        
        // Obter dados da simulação
        $stmt = $db->prepare("
            SELECT s.*, 
                   l.name as lead_name, l.email as lead_email,
                   dr.*, tr.*, cr.*
            FROM simulations s
            LEFT JOIN leads l ON s.lead_id = l.id
            LEFT JOIN drycooler_results dr ON s.id = dr.simulation_id
            LEFT JOIN tower_results tr ON s.id = tr.simulation_id
            LEFT JOIN comparison_results cr ON s.id = cr.simulation_id
            WHERE s.id = :id
        ");
        
        $stmt->execute([':id' => $simulationId]);
        $result = $stmt->fetch();
        
        if (!$result) {
            return false;
        }
        
        // Formatar os dados para o formato esperado pela aplicação
        return formatSimulationData($result);
    } catch (PDOException $e) {
        error_log('Erro ao buscar simulação: ' . $e->getMessage());
        return false;
    }
}

/**
 * Função para obter todas as simulações
 * 
 * @param int $limit Limite de resultados (opcional)
 * @param int $offset Deslocamento para paginação (opcional)
 * @return array|bool Array de simulações ou false em caso de erro
 */
function getAllSimulations($limit = null, $offset = null) {
    try {
        $db = getDbConnection();
        
        $sql = "
            SELECT s.id, s.capacity, s.location, s.delta_t, s.water_flow, s.created_at,
                   l.name as lead_name, l.email as lead_email,
                   cr.yearly_difference, cr.yearly_difference_percentage, cr.sustainability_score
            FROM simulations s
            LEFT JOIN leads l ON s.lead_id = l.id
            LEFT JOIN comparison_results cr ON s.id = cr.simulation_id
            ORDER BY s.created_at DESC
        ";
        
        if ($limit !== null) {
            $sql .= " LIMIT :limit";
            if ($offset !== null) {
                $sql .= " OFFSET :offset";
            }
        }
        
        $stmt = $db->prepare($sql);
        
        if ($limit !== null) {
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            if ($offset !== null) {
                $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            }
        }
        
        $stmt->execute();
        
        return $stmt->fetchAll();
    } catch (PDOException $e) {
        error_log('Erro ao buscar simulações: ' . $e->getMessage());
        return false;
    }
}

/**
 * Função para formatar os dados da simulação no formato esperado pela aplicação
 * 
 * @param array $rawData Dados brutos da simulação
 * @return array Dados formatados
 */