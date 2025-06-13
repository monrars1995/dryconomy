-- Dryconomy Database Schema

-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS dryconomy_db;
USE dryconomy_db;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Tabela de cidades e seus parâmetros
CREATE TABLE IF NOT EXISTS city_parameters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city_name VARCHAR(100) NOT NULL UNIQUE,
    capacity DECIMAL(10,2) NOT NULL,
    water_flow DECIMAL(10,2) NOT NULL,
    makeup_water_fan_logic DECIMAL(10,2) NOT NULL,
    water_consumption_fan_logic DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de leads capturados
CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    phone VARCHAR(20),
    state VARCHAR(50),
    source VARCHAR(50) DEFAULT 'Dryconomy Calculator',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de simulações
CREATE TABLE IF NOT EXISTS simulations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lead_id INT,
    capacity DECIMAL(10,2) NOT NULL,
    location VARCHAR(100) NOT NULL,
    delta_t DECIMAL(10,2) NOT NULL,
    water_flow DECIMAL(10,2) NOT NULL,
    operating_hours DECIMAL(5,2) DEFAULT 24.00,
    operating_days DECIMAL(3,1) DEFAULT 7.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
    FOREIGN KEY (location) REFERENCES city_parameters(city_name) ON DELETE RESTRICT
);

-- Tabela de resultados de simulação - Drycooler
CREATE TABLE IF NOT EXISTS drycooler_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    simulation_id INT NOT NULL,
    module_capacity DECIMAL(10,2) NOT NULL,
    modules INT NOT NULL,
    total_capacity DECIMAL(10,2) NOT NULL,
    nominal_water_flow DECIMAL(10,2) NOT NULL,
    evaporation_percentage DECIMAL(10,2) NOT NULL,
    evaporation_flow DECIMAL(10,2) NOT NULL,
    hourly_consumption DECIMAL(10,2) NOT NULL,
    daily_consumption DECIMAL(10,2) NOT NULL,
    monthly_consumption DECIMAL(10,2) NOT NULL,
    yearly_consumption DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (simulation_id) REFERENCES simulations(id) ON DELETE CASCADE
);

-- Tabela de resultados de simulação - Torre
CREATE TABLE IF NOT EXISTS tower_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    simulation_id INT NOT NULL,
    capacity DECIMAL(10,2) NOT NULL,
    nominal_water_flow DECIMAL(10,2) NOT NULL,
    evaporation_percentage DECIMAL(10,2) NOT NULL,
    evaporation_flow DECIMAL(10,2) NOT NULL,
    hourly_consumption DECIMAL(10,2) NOT NULL,
    daily_consumption DECIMAL(10,2) NOT NULL,
    monthly_consumption DECIMAL(10,2) NOT NULL,
    yearly_consumption DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (simulation_id) REFERENCES simulations(id) ON DELETE CASCADE
);

-- Tabela de comparação de resultados
CREATE TABLE IF NOT EXISTS comparison_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    simulation_id INT NOT NULL,
    yearly_difference DECIMAL(10,2) NOT NULL,
    yearly_difference_percentage DECIMAL(10,2) NOT NULL,
    sustainability_score DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (simulation_id) REFERENCES simulations(id) ON DELETE CASCADE
);

-- Tabela de relatórios detalhados
CREATE TABLE IF NOT EXISTS detailed_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    simulation_id INT NOT NULL,
    lead_id INT,
    report_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (simulation_id) REFERENCES simulations(id) ON DELETE CASCADE,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
);

-- Inserção dos dados iniciais das cidades
INSERT INTO city_parameters (city_name, capacity, water_flow, makeup_water_fan_logic, water_consumption_fan_logic) VALUES
('São Paulo', 100, 71.7, 2.5, 8.5),
('Rio de Janeiro', 75, 90, 2.5, 8.5),
('Manaus', 80, 50, 2.5, 8.5),
('Brasília', 90, 75, 2.5, 8.5),
('Recife', 60, 70, 2.5, 8.5),
('Fortaleza', 70, 65, 2.5, 8.5),
('Florianópolis', 85, 80, 2.5, 8.5),
('Belo Horizonte', 90, 88.7, 5, 8.6),
('Porto Alegre', 95, 85, 5, 8.6),
('Salvador', 120, 90, 5, 2.6),
('Campinas', 100, 88.4, 0.5, 8.4);

-- Tabela de variáveis de cálculo
CREATE TABLE IF NOT EXISTS calculation_variables (
    id VARCHAR(255) PRIMARY KEY, -- Supabase usa UUIDs como string, mas para MySQL podemos usar VARCHAR ou INT AUTO_INCREMENT
    name VARCHAR(255) NOT NULL,
    description TEXT,
    value DECIMAL(10, 4) NOT NULL, -- Ajustar precisão conforme necessário
    unit VARCHAR(50),
    category VARCHAR(100) NOT NULL,
    created_by VARCHAR(255), -- Pode ser o ID do usuário ou um nome/email
    updated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL, -- Assumindo que users.id é VARCHAR se for UUID, ou INT se for AUTO_INCREMENT
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Adicionar algumas variáveis de exemplo (opcional, mas útil para desenvolvimento)
INSERT INTO calculation_variables (id, name, description, value, unit, category, created_by, updated_by) VALUES
(UUID(), 'Custo Médio Energia Elétrica', 'Custo médio da energia elétrica por kWh', 0.75, 'R$/kWh', 'Custos', NULL, NULL),
(UUID(), 'Custo Médio Água', 'Custo médio da água por m³', 15.00, 'R$/m³', 'Custos', NULL, NULL),
(UUID(), 'Eficiência Média Bomba', 'Eficiência média do sistema de bombeamento', 0.85, '%', 'Eficiência', NULL, NULL),
(UUID(), 'Fator Emissão CO2 (Energia)', 'Fator de emissão de CO2 para consumo de energia elétrica', 0.058, 'tCO2/MWh', 'Sustentabilidade', NULL, NULL);