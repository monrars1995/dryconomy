import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Box,
  Typography,
  useTheme
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function ConfirmationDialog({ open, onClose, title, message, onConfirm, confirmText = 'OK' }) {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CheckCircleIcon 
            sx={{ 
              fontSize: 60, 
              color: theme.palette.success.main,
              filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.1))'
            }} 
          />
        </Box>
        <DialogTitle id="alert-dialog-title" sx={{ 
          fontWeight: 700, 
          fontSize: '1.5rem',
          textAlign: 'center',
          color: theme.palette.text.primary,
          pb: 1
        }}>
          {title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText 
            id="alert-dialog-description"
            sx={{ 
              color: theme.palette.text.secondary,
              fontSize: '1.1rem',
              textAlign: 'center',
              lineHeight: 1.6
            }}
          >
            {message}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pt: 2, pb: 1 }}>
          <Button 
            onClick={onConfirm || onClose} 
            variant="contained" 
            color="primary"
            sx={{
              px: 4,
              py: 1,
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {confirmText}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
