import React, { useState } from 'react';
import { Box, Button, Snackbar } from '@mui/material';

const PrivacyBanner = () => {
  const [open, setOpen] = useState(true);

  return (
    <Snackbar
      open={open}
      message="Este site usa cookies para melhorar sua experiência"
      action={
        <Button color="secondary" size="small" onClick={() => setOpen(false)}>
          Entendi
        </Button>
      }
      sx={{
        '& .MuiPaper-root': {
          backgroundColor: '#00337A',
          color: '#FFFFFF'
        }
      }}
    />
  );
};

export default PrivacyBanner;
