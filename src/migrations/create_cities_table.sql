-- Criação da tabela de cidades para o simulador
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  state TEXT,
  country TEXT DEFAULT 'Brasil',
  water_consumption_year NUMERIC,
  water_consumption_year_conventional NUMERIC,
  average_temperature NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir algumas cidades de exemplo
INSERT INTO cities (name, state, country, water_consumption_year, water_consumption_year_conventional, average_temperature)
VALUES 
  ('São Paulo', 'SP', 'Brasil', 950000, 2500000, 25),
  ('Rio de Janeiro', 'RJ', 'Brasil', 920000, 2400000, 28),
  ('Belo Horizonte', 'MG', 'Brasil', 880000, 2300000, 23),
  ('Porto Alegre', 'RS', 'Brasil', 820000, 2150000, 20),
  ('Recife', 'PE', 'Brasil', 980000, 2550000, 30),
  ('Salvador', 'BA', 'Brasil', 990000, 2600000, 32),
  ('Curitiba', 'PR', 'Brasil', 800000, 2100000, 18),
  ('Brasília', 'DF', 'Brasil', 900000, 2350000, 23);

-- Criar política RLS para permitir leitura por todos os usuários autenticados
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura por todos os usuários autenticados
CREATE POLICY cities_read_policy ON cities
    FOR SELECT
    TO authenticated
    USING (true);

-- Política para permitir inserção/atualização/exclusão apenas por administradores
CREATE POLICY cities_write_policy ON cities
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- Temporariamente, permitir acesso anônimo para testes
CREATE POLICY cities_anon_select_policy ON cities
    FOR SELECT
    TO anon
    USING (true);
