import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Paper, Button, CircularProgress,
  Alert, Grid, Divider, useTheme
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import CityList from '../../components/admin/CityList';
import CityForm from '../../components/admin/CityForm';
import { fetchCities } from '../../services/cityService';

const Cities = () => {
  const theme = useTheme();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  // Buscar cidades do banco de dados
  const loadCities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, count, error } = await fetchCities(page, rowsPerPage, searchTerm);
      
      if (error) throw error;
      
      setCities(data || []);
      setTotalItems(count || 0);
    } catch (err) {
      console.error('Erro ao buscar cidades:', err);
      setError('Erro ao carregar cidades. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Carregar cidades ao iniciar o componente ou quando a paginação/busca mudar
  useEffect(() => {
    loadCities();
  }, [page, rowsPerPage, searchTerm]);

  // Manipuladores de paginação
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Manipulador de busca
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setPage(0);
  };

  // Abrir formulário para criar nova cidade
  const handleOpenForm = () => {
    setSelectedCity(null);
    setOpenForm(true);
  };

  // Abrir formulário para editar cidade existente
  const handleEditCity = (city) => {
    setSelectedCity(city);
    setOpenForm(true);
  };

  // Fechar formulário
  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedCity(null);
  };

  // Após salvar cidade (nova ou editada)
  const handleSaveCity = () => {
    setOpenForm(false);
    setSelectedCity(null);
    loadCities();
  };

  return (
    <Box>
      <Paper 
        sx={{ 
          p: 2, 
          mb: 3, 
          background: theme.palette.background.paper,
          boxShadow: theme.shadows[2]
        }}
      >
        <Grid container spacing={2} justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              Gerenciar Cidades
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Adicione e gerencie cidades e suas variáveis específicas para o simulador
            </Typography>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={loadCities}
                disabled={loading}
              >
                Atualizar
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenForm}
              >
                Nova Cidade
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          background: theme.palette.background.paper,
          boxShadow: theme.shadows[2],
          borderRadius: 2
        }}
      >
        <CardContent sx={{ flex: '1 0 auto', p: { xs: 2, md: 3 } }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <CityList 
            cities={cities}
            loading={loading}
            page={page}
            rowsPerPage={rowsPerPage}
            totalItems={totalItems}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
            onSearchChange={handleSearchChange}
            onEditCity={handleEditCity}
            onRefresh={loadCities}
          />
        </CardContent>
      </Card>

      {/* Formulário de criação/edição de cidade */}
      <CityForm 
        open={openForm}
        city={selectedCity}
        onClose={handleCloseForm}
        onSave={handleSaveCity}
      />
    </Box>
  );
};

export default Cities;
