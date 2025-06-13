import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { supabase } from './config/supabase.js';
import { authenticateJWT, checkRole } from './middlewares/auth.js';
import {
  getVariables,
  updateVariable,
  createVariable,
  deleteVariable
} from './controllers/calculationVariablesController.js';

import {
  getLeads,
  getLeadSimulations,
  createLead,
  deleteLead
} from './controllers/leadsController.js';

import {
  getWebhookConfigs,
  createWebhookConfig,
  updateWebhookConfig,
  deleteWebhookConfig,
  testWebhook
} from './controllers/webhookController.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas públicas
app.post('/api/leads', createLead);

// Rotas protegidas por autenticação
const apiRouter = express.Router();
apiRouter.use(authenticateJWT);

// Rotas de variáveis de cálculo
apiRouter.route('/variables')
  .get(getVariables)
  .post(checkRole(['admin']), createVariable);

apiRouter.route('/variables/:id')
  .put(checkRole(['admin']), updateVariable)
  .delete(checkRole(['admin']), deleteVariable);

// Rotas de leads
apiRouter.route('/leads')
  .get(checkRole(['admin', 'viewer']), getLeads);

apiRouter.route('/leads/:id')
  .delete(checkRole(['admin']), deleteLead);

apiRouter.get('/leads/:leadId/simulations', checkRole(['admin', 'viewer']), getLeadSimulations);

// Rotas de webhooks
apiRouter.route('/webhooks')
  .get(checkRole(['admin']), getWebhookConfigs)
  .post(checkRole(['admin']), createWebhookConfig);

apiRouter.route('/webhooks/:id')
  .put(checkRole(['admin']), updateWebhookConfig)
  .delete(checkRole(['admin']), deleteWebhookConfig);

apiRouter.post('/webhooks/:id/test', checkRole(['admin']), testWebhook);

// Aplicar o roteador de API ao caminho /api
app.use('/api', apiRouter);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

export default app;
