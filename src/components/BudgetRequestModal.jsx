import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  RequestQuote as QuoteIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const BudgetRequestModal = ({ open, onClose, userData, simulationResults, onSubmit }) => {
  const theme = useTheme();
  const [wantsBudget, setWantsBudget] = useState(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const requestData = {
        userData,
        simulationResults,
        wantsBudget,
        additionalInfo: additionalInfo.trim(),
        timestamp: new Date().toISOString()
      };
      
      await onSubmit(requestData);
      setSubmitted(true);
      
      // Fechar modal após 3 segundos
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setWantsBudget(null);
        setAdditionalInfo('');
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setSubmitted(false);
      setWantsBudget(null);
      setAdditionalInfo('');
    }
  };

  if (submitted) {
    return (
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            textAlign: 'center',
            p: 2
          }
        }}
      >
        <DialogContent sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CheckIcon 
              sx={{ 
                fontSize: 80, 
                color: 'success.main',
                mb: 2,
                filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.1))'
              }} 
            />
            <Typography variant="h4" gutterBottom sx={{ 
              fontWeight: 700,
              color: 'success.main'
            }}>
              Obrigado!
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ 
              color: 'text.primary',
              mb: 2
            }}>
              {wantsBudget 
                ? 'Sua solicitação de orçamento foi enviada com sucesso!'
                : 'Agradecemos seu interesse em nossa solução!'
              }
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ 
              textAlign: 'center',
              lineHeight: 1.6
            }}>
              {wantsBudget 
                ? 'Nossa equipe comercial entrará em contato em breve para elaborar um orçamento personalizado baseado na sua simulação.'
                : 'Mantenha nossos dados de contato para futuras consultas. Estamos sempre à disposição!'
              }
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        }
      }}
    >
      <DialogTitle sx={{ 
        textAlign: 'center', 
        pb: 1,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <QuoteIcon sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Orçamento Personalizado
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Baseado na sua simulação de economia de {simulationResults?.comparison?.yearlyDifference?.toLocaleString('pt-BR')} litros/ano
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Olá {userData?.name}!
          </Typography>
          <Typography variant="body1" paragraph>
            Parabéns por completar a simulação! Seus resultados mostram um excelente potencial de economia de água.
          </Typography>
          <Typography variant="body1" paragraph>
            Gostaria de receber um orçamento personalizado para implementar a solução DryCooler na sua empresa?
          </Typography>
        </Box>

        {/* Resumo da simulação */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Resumo da sua simulação:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Capacidade:</strong> {simulationResults?.inputs?.capacity} kW
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Localização:</strong> {simulationResults?.inputs?.location}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Economia anual:</strong> {simulationResults?.comparison?.yearlyDifference?.toLocaleString('pt-BR')} L
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Redução:</strong> {simulationResults?.comparison?.yearlyDifferencePercentage?.toFixed(1)}%
              </Typography>
            </Grid>
          </Grid>
        </Alert>

        {/* Opções de orçamento */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            Você gostaria de receber um orçamento personalizado?
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={wantsBudget === true}
                  onChange={() => setWantsBudget(true)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Sim, quero receber um orçamento personalizado
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nossa equipe entrará em contato para elaborar uma proposta específica para sua empresa
                  </Typography>
                </Box>
              }
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={wantsBudget === false}
                  onChange={() => setWantsBudget(false)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Não agora, apenas quero os resultados da simulação
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Você pode solicitar um orçamento a qualquer momento no futuro
                  </Typography>
                </Box>
              }
            />
          </Box>
        </Box>

        {/* Campo adicional se quiser orçamento */}
        {wantsBudget === true && (
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Informações adicionais (opcional)"
              placeholder="Conte-nos mais sobre seu projeto, prazos, requisitos específicos ou qualquer outra informação que possa nos ajudar a elaborar um orçamento mais preciso..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>
        )}

        {wantsBudget === true && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Próximos passos:</strong> Nossa equipe comercial analisará sua simulação e entrará em contato em até 24 horas para agendar uma reunião e apresentar uma proposta personalizada.
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
        <Button 
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Cancelar
        </Button>
        
        <Button
          onClick={handleSubmit}
          disabled={wantsBudget === null || loading}
          variant="contained"
          color="primary"
          sx={{ 
            borderRadius: 2,
            minWidth: 120,
            background: wantsBudget === true 
              ? 'linear-gradient(45deg, #00337A 30%, #1976d2 90%)'
              : undefined
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            wantsBudget === true ? 'Solicitar Orçamento' : 'Finalizar'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BudgetRequestModal;