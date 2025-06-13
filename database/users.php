<?php
/**
 * Gerenciamento de Usuários
 * 
 * Este arquivo contém funções para gerenciar usuários no banco de dados
 */

require_once __DIR__ . '/config.php';

/**
 * Função para criar um novo usuário
 * 
 * @param string $name Nome do usuário
 * @param string $email Email do usuário
 * @param string $password Senha do usuário (não criptografada)
 * @param string $role Papel do usuário ('admin' ou 'user')
 * @return int|bool ID do usuário inserido ou false em caso de erro
 */
function createUser($name, $email, $password, $role = 'user') {
    try {
        $db = getDbConnection();
        
        // Verificar se o email já está em uso
        $stmt = $db->prepare("SELECT id FROM users WHERE email = :email");
        $stmt->execute([':email' => $email]);
        
        if ($stmt->fetch()) {
            return false; // Email já está em uso
        }
        
        // Criptografar a senha
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        // Inserir o novo usuário
        $stmt = $db->prepare("
            INSERT INTO users (name, email, password, role)
            VALUES (:name, :email, :password, :role)
        ");
        
        $stmt->execute([
            ':name' => $name,
            ':email' => $email,
            ':password' => $hashedPassword,
            ':role' => $role
        ]);
        
        return $db->lastInsertId();
    } catch (PDOException $e) {
        error_log('Erro ao criar usuário: ' . $e->getMessage());
        return false;
    }
}

/**
 * Função para autenticar um usuário
 * 
 * @param string $email Email do usuário
 * @param string $password Senha do usuário (não criptografada)
 * @return array|bool Dados do usuário ou false em caso de falha na autenticação
 */
function authenticateUser($email, $password) {
    try {
        $db = getDbConnection();
        
        $stmt = $db->prepare("
            SELECT id, name, email, password, role 
            FROM users 
            WHERE email = :email
        ");
        
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($password, $user['password'])) {
            return false; // Credenciais inválidas
        }
        
        // Atualizar último login
        $stmt = $db->prepare("
            UPDATE users 
            SET last_login = CURRENT_TIMESTAMP 
            WHERE id = :id
        ");
        
        $stmt->execute([':id' => $user['id']]);
        
        // Remover a senha do array antes de retornar
        unset($user['password']);
        
        return $user;
    } catch (PDOException $e) {
        error_log('Erro ao autenticar usuário: ' . $e->getMessage());
        return false;
    }
}

/**
 * Função para obter um usuário pelo ID
 * 
 * @param int $userId ID do usuário
 * @return array|bool Dados do usuário ou false em caso de erro
 */
function getUserById($userId) {
    try {
        $db = getDbConnection();
        
        $stmt = $db->prepare("
            SELECT id, name, email, role, created_at, updated_at, last_login 
            FROM users 
            WHERE id = :id
        ");
        
        $stmt->execute([':id' => $userId]);
        return $stmt->fetch();
    } catch (PDOException $e) {
        error_log('Erro ao buscar usuário: ' . $e->getMessage());
        return false;
    }
}

/**
 * Função para atualizar um usuário
 * 
 * @param int $userId ID do usuário
 * @param array $userData Dados do usuário a serem atualizados
 * @return bool Sucesso ou falha na atualização
 */
function updateUser($userId, $userData) {
    try {
        $db = getDbConnection();
        
        $allowedFields = ['name', 'email', 'role'];
        $updates = [];
        $params = [':id' => $userId];
        
        foreach ($userData as $field => $value) {
            if (in_array($field, $allowedFields)) {
                $updates[] = "$field = :$field";
                $params[":$field"] = $value;
            }
        }
        
        if (empty($updates)) {
            return true; // Nada para atualizar
        }
        
        $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $db->prepare($sql);
        
        return $stmt->execute($params);
    } catch (PDOException $e) {
        error_log('Erro ao atualizar usuário: ' . $e->getMessage());
        return false;
    }
}

/**
 * Função para alterar a senha de um usuário
 * 
 * @param int $userId ID do usuário
 * @param string $currentPassword Senha atual
 * @param string $newPassword Nova senha
 * @return bool Sucesso ou falha na alteração
 */
function changePassword($userId, $currentPassword, $newPassword) {
    try {
        $db = getDbConnection();
        
        // Verificar senha atual
        $stmt = $db->prepare("SELECT password FROM users WHERE id = :id");
        $stmt->execute([':id' => $userId]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($currentPassword, $user['password'])) {
            return false; // Senha atual incorreta
        }
        
        // Atualizar para a nova senha
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        
        $stmt = $db->prepare("
            UPDATE users 
            SET password = :password, updated_at = CURRENT_TIMESTAMP 
            WHERE id = :id
        ");
        
        return $stmt->execute([
            ':id' => $userId,
            ':password' => $hashedPassword
        ]);
    } catch (PDOException $e) {
        error_log('Erro ao alterar senha: ' . $e->getMessage());
        return false;
    }
}

/**
 * Função para obter todos os usuários
 * 
 * @param string $role Filtrar por papel (opcional)
 * @return array|bool Lista de usuários ou false em caso de erro
 */
function getAllUsers($role = null) {
    try {
        $db = getDbConnection();
        
        $sql = "
            SELECT id, name, email, role, created_at, last_login 
            FROM users
        ";
        
        $params = [];
        
        if ($role !== null) {
            $sql .= " WHERE role = :role";
            $params[':role'] = $role;
        }
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->fetchAll();
    } catch (PDOException $e) {
        error_log('Erro ao buscar usuários: ' . $e->getMessage());
        return false;
    }
}