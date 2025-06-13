import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline } from '@mui/material';
import AppRoutes from './AppRoutes';

// Importar estilos de acessibilidade
import './styles/accessibility.css';

// Configurar foco visível apenas para navegação por teclado
import 'focus-visible/dist/focus-visible';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CssBaseline />
    <AppRoutes />
  </React.StrictMode>,
);