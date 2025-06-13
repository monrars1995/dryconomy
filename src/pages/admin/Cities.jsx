import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Paper, Button, CircularProgress,
  Alert, Grid, Divider, useTheme, Snackbar, TextField, InputAdornment
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon, Search as SearchIcon } from '@mui/icons-material';
import CityList from '../../components/admin/CityList';
import CityForm from '../../components/admin/CityForm';
import { fetchCities } from '../../services/cityService';
import { supabase } from '../../services/authService';

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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Buscar cidades do banco de dados
  const loadCities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Usar Supabase diretamente para maior controle
      let query = supabase
        .from('cities')
        .select('*', { count: 'exact' });
      
      // Aplicar filtro de busca se fornecido
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%`);
      }
      
      // Ordenar por nome
      query = query.order('name', { ascending: true });
      
      // Aplicar paginação
      const from = page * rowsPerPage;
      const to = from + rowsPerPage - 1;
      query = query.range(from, to);
      
      const { data, count, error } = await query;
      
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

  // Manipulador de busca com debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
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
    setSnackbar({
      open: true,
      message: selectedCity ? 'Cidade atualizada com sucesso!' : 'Cidade adicionada com sucesso!',
      severity: 'success'
    });
  };

  // Fechar snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2} justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h5" component="h1" sx={{ 
              fontWeight: 700,
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center'
            }}>
              <LocationCityIcon sx={{ mr: 1 }} />
              Gerenciar Cidades
            </Typography>
            <Typography variant="body2" color="text.secondary">
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
                sx={{ borderRadius: 2 }}
              >
                Atualizar
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenForm}
                sx={{ borderRadius: 2 }}
              >
                Nova Cidade
              </Button>
            </Box>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
        
        {/* Busca */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar cidades..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'action.active' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              transition: 'all 0.3s',
              '&:hover': {
                borderColor: theme.palette.primary.main,
              },
            },
          }}
        />
      </Paper>

      <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 3
      }}>
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

      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Cities;