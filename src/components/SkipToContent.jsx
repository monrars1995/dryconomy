import React from 'react';
import { Button } from '@mui/material';

const SkipToContent = () => {
  const skipToMain = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView();
    }
  };

  return (
    <Button
      onClick={skipToMain}
      sx={{
        position: 'absolute',
        top: -40,
        left: 6,
        zIndex: 10000,
        backgroundColor: 'primary.main',
        color: 'white',
        '&:focus': {
          top: 6,
        },
        transition: 'top 0.3s',
      }}
      onFocus={(e) => {
        e.target.style.top = '6px';
      }}
      onBlur={(e) => {
        e.target.style.top = '-40px';
      }}
    >
      Pular para o conteúdo principal
    </Button>
  );
};

export default SkipToContent;