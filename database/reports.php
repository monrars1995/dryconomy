<?php
/**
 * Gerenciamento de Relatórios
 * 
 * Este arquivo contém funções para gerenciar relatórios e formatar dados de simulação
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/simulations.php';

/**
 * Função para formatar os dados da simulação no formato esperado pela aplicação
 * 
 * @param array $rawData Dados brutos da simulação
 * @return array Dados formatados
 */
function formatSimulationData($rawData) {
    // Formatar dados da simulação para o formato esperado pelo frontend
    $formattedData = [
        'id' => $rawData['id'],
        'inputs' => [
            'capacity' => (float)$rawData['capacity'],
            'location' => $rawData['location'],
            'deltaT' => (float)$rawData['delta_t'],
            'waterFlow' => (float)$rawData['water_flow']
        ],
        'results' => [
            'drycooler' => [
                'moduleCapacity' => (float)$rawData['module_capacity'],
                'modules' => (int)$rawData['modules'],
                'totalCapacity' => (float)$rawData['total_capacity'],
                'nominalWaterFlow' => (float)$rawData['nominal_water_flow'],
                'evaporationPercentage' => (float)$rawData['evaporation_percentage'],
                'evaporationFlow' => (float)$rawData['evaporation_flow'],
                'consumption' => [
                    'hourly' => (float)$rawData['hourly_consumption'],
                    'daily' => (float)$rawData['daily_consumption'],
                    'monthly' => (float)$rawData['monthly_consumption'],
                    'yearly' => (float)$rawData['yearly_consumption']
                ]
            ],
            'tower' => [
                'capacity' => (float)$rawData['capacity'],
                'nominalWaterFlow' => (float)$rawData['nominal_water_flow'],
                'evaporationPercentage' => (float)$rawData['evaporation_percentage'],
                'evaporationFlow' => (float)$rawData['evaporation_flow'],
                'consumption' => [
                    'hourly' => (float)$rawData['hourly_consumption'],
                    'daily' => (float)$rawData['daily_consumption'],
                    'monthly' => (float)$rawData['monthly_consumption'],
                    'yearly' => (float)$rawData['yearly_consumption']
                ]
            ],
            'comparison' => [
                'yearlyDifference' => (float)$rawData['yearly_difference'],
                'yearlyDifferencePercentage' => (float)$rawData['yearly_difference_percentage']
            ]
        ],
        'lead' => null,
        'timestamp' => $rawData['created_at']
    ];
    
    // Adicionar informações do lead, se disponíveis
    if (isset($rawData['lead_name']) && isset($rawData['lead_email'])) {
        $formattedData['lead'] = [
            'name' => $rawData['lead_name'],
            'email' => $rawData['lead_email']
        ];
    }
    
    return $formattedData;
}

/**
 * Função para salvar um relatório detalhado
 * 
 * @param int $simulationId ID da simulação
 * @param int $leadId ID do lead (opcional)
 * @param array $reportData Dados do relatório
 * @return int|bool ID do relatório inserido ou false em caso de erro
 */
function saveDetailedReport($simulationId, $leadId = null, $reportData) {
    try {
        $db = getDbConnection();
        
        $stmt = $db->prepare("
            INSERT INTO detailed_reports (simulation_id, lead_id, report_data)
            VALUES (:simulation_id, :lead_id, :report_data)
        ");
        
        $stmt->execute([
            ':simulation_id' => $simulationId,
            ':lead_id' => $leadId,
            ':report_data' => json_encode($reportData)
        ]);
        
        return $db->lastInsertId();
    } catch (PDOException $e) {
        error_log('Erro ao salvar relatório detalhado: ' . $e->getMessage());
        return false;
    }
}

/**
 * Função para obter um relatório detalhado pelo ID
 * 
 * @param int $reportId ID do relatório
 * @return array|bool Dados do relatório ou false em caso de erro
 */
function getDetailedReportById($reportId) {
    try {
        $db = getDbConnection();
        
        $stmt = $db->prepare("
            SELECT * FROM detailed_reports WHERE id = :id
        ");
        
        $stmt->execute([':id' => $reportId]);
        $report = $stmt->fetch();
        
        if (!$report) {
            return false;
        }
        
        // Decodificar os dados JSON
        $report['report_data'] = json_decode($report['report_data'], true);
        
        return $report;
    } catch (PDOException $e) {
        error_log('Erro ao buscar relatório detalhado: ' . $e->getMessage());
        return false;
    }
}

/**
 * Função para obter relatórios detalhados por simulação
 * 
 * @param int $simulationId ID da simulação
 * @return array|bool Array de relatórios ou false em caso de erro
 */
function getDetailedReportsBySimulation($simulationId) {
    try {
        $db = getDbConnection();
        
        $stmt = $db->prepare("
            SELECT * FROM detailed_reports WHERE simulation_id = :simulation_id
            ORDER BY created_at DESC
        ");
        
        $stmt->execute([':simulation_id' => $simulationId]);
        $reports = $stmt->fetchAll();
        
        // Decodificar os dados JSON para cada relatório
        foreach ($reports as &$report) {
            $report['report_data'] = json_decode($report['report_data'], true);
        }
        
        return $reports;
    } catch (PDOException $e) {
        error_log('Erro ao buscar relatórios por simulação: ' . $e->getMessage());
        return []; // Retornar um array vazio em caso de erro
    }
}