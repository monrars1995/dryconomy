import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Snackbar,
  Alert
} from '@mui/material';

const WebhookSettingsPage = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSave = () => {
    setSnackbar({
      open: true,
      message: 'Webhook configurado com sucesso!',
      severity: 'success'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Configurações de Webhook
      </Typography>
      <Paper sx={{ p: 3 }}>
        <TextField
          fullWidth
          label="URL do Webhook"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          variant="outlined"
        />
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{ mt: 2, background: 'linear-gradient(45deg, #00337A 30%, #002357 90%)' }}
        >
          Salvar
        </Button>
      </Paper>
    </Box>
  );
};

export default WebhookSettingsPage;
