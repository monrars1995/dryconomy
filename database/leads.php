<?php
/**
 * Gerenciamento de Leads
 * 
 * Este arquivo contém funções para gerenciar leads no banco de dados
 */

require_once __DIR__ . '/config.php';

/**
 * Função para salvar um novo lead no banco de dados
 * 
 * @param array $leadData Dados do lead (name, email, company, phone, state, source)
 * @return int|bool ID do lead inserido ou false em caso de erro
 */
function saveLead($leadData) {
    try {
        $db = getDbConnection();
        
        // Verificar se o lead já existe com o mesmo email
        $stmt = $db->prepare("SELECT id FROM leads WHERE email = :email");
        $stmt->execute([':email' => $leadData['email']]);
        $existingLead = $stmt->fetch();
        
        if ($existingLead) {
            // Atualizar lead existente
            $stmt = $db->prepare("
                UPDATE leads 
                SET name = :name, 
                    company = :company, 
                    phone = :phone, 
                    state = :state, 
                    source = :source,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :id
            ");
            
            $stmt->execute([
                ':id' => $existingLead['id'],
                ':name' => $leadData['name'],
                ':company' => $leadData['company'] ?? null,
                ':phone' => $leadData['phone'] ?? null,
                ':state' => $leadData['state'] ?? null,
                ':source' => $leadData['source'] ?? 'Dryconomy Calculator'
            ]);
            
            return $existingLead['id'];
        } else {
            // Inserir novo lead
            $stmt = $db->prepare("
                INSERT INTO leads (name, email, company, phone, state, source)
                VALUES (:name, :email, :company, :phone, :state, :source)
            ");
            
            $stmt->execute([
                ':name' => $leadData['name'],
                ':email' => $leadData['email'],
                ':company' => $leadData['company'] ?? null,
                ':phone' => $leadData['phone'] ?? null,
                ':state' => $leadData['state'] ?? null,
                ':source' => $leadData['source'] ?? 'Dryconomy Calculator'
            ]);
            
            return $db->lastInsertId();
        }
    } catch (PDOException $e) {
        error_log('Erro ao salvar lead: ' . $e->getMessage());
        return false;
    }
}

/**
 * Função para obter um lead pelo ID
 * 
 * @param int $leadId ID do lead
 * @return array|bool Dados do lead ou false em caso de erro
 */
function getLeadById($leadId) {
    try {
        $db = getDbConnection();
        
        $stmt = $db->prepare("SELECT * FROM leads WHERE id = :id");
        $stmt->execute([':id' => $leadId]);
        
        return $stmt->fetch();
    } catch (PDOException $e) {
        error_log('Erro ao buscar lead: ' . $e->getMessage());
        return false;
    }
}

/**
 * Função para obter leads por email
 * 
 * @param string $email Email do lead
 * @return array|bool Dados do lead ou false em caso de erro
 */
function getLeadByEmail($email) {
    try {
        $db = getDbConnection();
        
        $stmt = $db->prepare("SELECT * FROM leads WHERE email = :email");
        $stmt->execute([':email' => $email]);
        
        return $stmt->fetch();
    } catch (PDOException $e) {
        error_log('Erro ao buscar lead por email: ' . $e->getMessage());
        return false;
    }
}

/**
 * Função para obter todos os leads
 * 
 * @param int $limit Limite de resultados (opcional)
 * @param int $offset Deslocamento para paginação (opcional)
 * @return array|bool Array de leads ou false em caso de erro
 */
function getAllLeads($limit = null, $offset = null) {
    try {
        $db = getDbConnection();
        
        $sql = "SELECT * FROM leads ORDER BY created_at DESC";
        
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
        error_log('Erro ao buscar leads: ' . $e->getMessage());
        return false;
    }
}

/**
 * Função para obter estatísticas de leads
 * 
 * @return array|bool Array com estatísticas ou false em caso de erro
 */
function getLeadStatistics() {
    try {
        $db = getDbConnection();
        
        // Total de leads
        $stmt = $db->query("SELECT COUNT(*) as total FROM leads");
        $totalLeads = $stmt->fetch()['total'];
        
        // Leads por estado
        $stmt = $db->query("
            SELECT state, COUNT(*) as count 
            FROM leads 
            WHERE state IS NOT NULL AND state != '' 
            GROUP BY state 
            ORDER BY count DESC
        ");
        $leadsByState = $stmt->fetchAll();
        
        // Leads por mês
        $stmt = $db->query("
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as count 
            FROM leads 
            GROUP BY DATE_FORMAT(created_at, '%Y-%m') 
            ORDER BY month DESC 
            LIMIT 12
        ");
        $leadsByMonth = $stmt->fetchAll();
        
        // Leads do mês atual
        $stmt = $db->query("
            SELECT COUNT(*) as count 
            FROM leads 
            WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) 
            AND YEAR(created_at) = YEAR(CURRENT_DATE())
        ");
        $leadsThisMonth = $stmt->fetch()['count'];
        
        return [
            'total' => $totalLeads,
            'by_state' => $leadsByState,
            'by_month' => $leadsByMonth,
            'this_month' => $leadsThisMonth
        ];
    } catch (PDOException $e) {
        error_log('Erro ao buscar estatísticas de leads: ' . $e->getMessage());
        return false;
    }
}