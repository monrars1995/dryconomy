<?php

try {
    $db = new PDO('sqlite:' . __DIR__ . '/simulations.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Iniciando migração...\n";
    
    // Verificar se as colunas já existem
    $result = $db->query("PRAGMA table_info(simulations)");
    $columns = $result->fetchAll(PDO::FETCH_ASSOC);
    
    $hasOperatingHours = false;
    $hasOperatingDays = false;
    
    foreach ($columns as $column) {
        if ($column['name'] === 'operating_hours') {
            $hasOperatingHours = true;
        }
        if ($column['name'] === 'operating_days') {
            $hasOperatingDays = true;
        }
    }
    
    // Adicionar coluna operating_hours se não existir
    if (!$hasOperatingHours) {
        $db->exec("ALTER TABLE simulations ADD COLUMN operating_hours REAL DEFAULT 24.0");
        echo "Coluna operating_hours adicionada com sucesso.\n";
    } else {
        echo "Coluna operating_hours já existe.\n";
    }
    
    // Adicionar coluna operating_days se não existir
    if (!$hasOperatingDays) {
        $db->exec("ALTER TABLE simulations ADD COLUMN operating_days REAL DEFAULT 7.0");
        echo "Coluna operating_days adicionada com sucesso.\n";
    } else {
        echo "Coluna operating_days já existe.\n";
    }
    
    echo "Migração concluída com sucesso!\n";
    
} catch (PDOException $e) {
    echo "Erro na migração: " . $e->getMessage() . "\n";
}

?>