import dotenv from 'dotenv';
import app from './app.js';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

// Verificar variáveis de ambiente obrigatórias
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'PORT'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Erro: A variável de ambiente ${envVar} não está definida`);
    process.exit(1);
  }
}

const PORT = process.env.PORT || 3001;

// Iniciar o servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// Lidar com encerramento gracioso
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. Encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    process.exit(0);
  });
});

// Lidar com erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('Erro não tratado:', err);
  server.close(() => {
    process.exit(1);
  });
});

export default server;
