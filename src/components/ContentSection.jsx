import React from 'react';
import { Box, Typography } from '@mui/material';

const ContentSection = ({ title, children }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {children}
    </Box>
  );
};

export default ContentSection;
