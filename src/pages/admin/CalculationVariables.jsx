import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  useTheme,
  Alert,
  Snackbar,
  Tooltip,
  CircularProgress,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { 
  getCalculationVariables, 
  createCalculationVariable, 
  updateCalculationVariable, 
  deleteCalculationVariable 
} from '../../services/calculationService';

const categories = [
  'Geral',
  'Eficiência',
  'Custos',
  'Tarifas',
  'Sustentabilidade',
  'Operacional',
  'Outros'
];

const CalculationVariables = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [variables, setVariables] = useState([]);
  const [filteredVariables, setFilteredVariables] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVariable, setEditingVariable] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    value: '',
    unit: '',
    category: 'Geral'
  });

  const [formErrors, setFormErrors] = useState({});

  // Fetch variables
  const fetchVariables = async () => {
    try {
      setLoading(true);
      const data = await getCalculationVariables();
      setVariables(data);
      setFilteredVariables(data);
    } catch (err) {
      setError('Erro ao carregar variáveis de cálculo');
      showSnackbar('Erro ao carregar variáveis de cálculo', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariables();
  }, []);

  // Filter variables based on search and category
  useEffect(() => {
    let filtered = variables;

    if (searchTerm) {
      filtered = filtered.filter(variable =>
        variable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        variable.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(variable => variable.category === selectedCategory);
    }

    setFilteredVariables(filtered);
    setPage(0); // Reset to first page when filtering
  }, [variables, searchTerm, selectedCategory]);

  const handleOpenDialog = (variable = null) => {
    if (variable) {
      setEditingVariable(variable);
      setFormData({
        name: variable.name,
        description: variable.description || '',
        value: variable.value,
        unit: variable.unit,
        category: variable.category
      });
    } else {
      setEditingVariable(null);
      setFormData({
        name: '',
        description: '',
        value: '',
        unit: '',
        category: 'Geral'
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVariable(null);
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    }
    
    if (!formData.value || isNaN(Number(formData.value))) {
      errors.value = 'Valor deve ser um número válido';
    }
    
    if (!formData.unit.trim()) {
      errors.unit = 'Unidade é obrigatória';
    }
    
    if (!formData.category) {
      errors.category = 'Categoria é obrigatória';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const variableData = {
        ...formData,
        value: parseFloat(formData.value)
      };
      
      if (editingVariable) {
        await updateCalculationVariable(editingVariable.id, variableData, user.id);
        showSnackbar('Variável atualizada com sucesso!', 'success');
      } else {
        await createCalculationVariable(variableData, user.id);
        showSnackbar('Variável criada com sucesso!', 'success');
      }
      
      await fetchVariables();
      handleCloseDialog();
    } catch (err) {
      console.error('Erro ao salvar variável:', err);
      showSnackbar('Erro ao salvar variável', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Tem certeza que deseja excluir a variável "${name}"?`)) {
      try {
        setLoading(true);
        await deleteCalculationVariable(id);
        showSnackbar('Variável excluída com sucesso!', 'success');
        await fetchVariables();
      } catch (err) {
        console.error('Erro ao excluir variável:', err);
        showSnackbar('Erro ao excluir variável', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Geral': 'default',
      'Eficiência': 'primary',
      'Custos': 'warning',
      'Tarifas': 'info',
      'Sustentabilidade': 'success',
      'Operacional': 'secondary',
      'Outros': 'default'
    };
    return colors[category] || 'default';
  };

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h5" component="h2" sx={{ 
              fontWeight: 700,
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center'
            }}>
              <SettingsIcon sx={{ mr: 1 }} />
              Variáveis de Cálculo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gerencie os parâmetros utilizados nos cálculos de simulação
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: 2 }}
          >
            Nova Variável
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Filtros */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar variáveis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filtrar por categoria</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Filtrar por categoria"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Todas as categorias</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchVariables}
              disabled={loading}
              sx={{ borderRadius: 2, py: 1.5 }}
            >
              Atualizar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {variables.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total de Variáveis
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {new Set(variables.map(v => v.category)).size}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Categorias
                  </Typography>
                </Box>
                <SettingsIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {filteredVariables.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Filtradas
                  </Typography>
                </Box>
                <SearchIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                    {variables.filter(v => v.category === 'Custos').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Variáveis de Custo
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table */}
      <Paper sx={{ borderRadius: 3 }}>
        {loading && variables.length === 0 ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'primary.light' + '10' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Descrição</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Valor</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Unidade</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Categoria</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredVariables
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((variable) => (
                      <TableRow key={variable.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {variable.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={variable.description || 'Sem descrição'}>
                            <Typography 
                              noWrap 
                              sx={{ maxWidth: 200 }}
                              variant="body2"
                              color="text.secondary"
                            >
                              {variable.description || '-'}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {typeof variable.value === 'number' 
                              ? variable.value.toLocaleString('pt-BR', { maximumFractionDigits: 4 })
                              : variable.value}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={variable.unit} 
                            size="small" 
                            variant="outlined"
                            color="primary"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={variable.category} 
                            size="small" 
                            color={getCategoryColor(variable.category)}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Editar">
                            <IconButton 
                              color="primary" 
                              onClick={() => handleOpenDialog(variable)}
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton 
                              color="error" 
                              onClick={() => handleDelete(variable.id, variable.name)}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredVariables.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Linhas por página:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
              }
            />
          </>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ 
            fontWeight: 600,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}>
            {editingVariable ? 'Editar Variável' : 'Adicionar Nova Variável'}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Nome da Variável"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Descrição"
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="value"
                  label="Valor"
                  type="number"
                  value={formData.value}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!formErrors.value}
                  helperText={formErrors.value}
                  inputProps={{
                    step: 'any'
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="unit"
                  label="Unidade"
                  value={formData.unit}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!formErrors.unit}
                  helperText={formErrors.unit}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required error={!!formErrors.category}>
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label="Categoria"
                    sx={{ borderRadius: 2 }}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.category && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                      {formErrors.category}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog} color="inherit" sx={{ borderRadius: 2 }}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
              sx={{ borderRadius: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Salvar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar for notifications */}
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

export default CalculationVariables;