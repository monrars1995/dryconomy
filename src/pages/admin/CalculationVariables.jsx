import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
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
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
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
  'Outros'
];

const CalculationVariables = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [variables, setVariables] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVariable, setEditingVariable] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  // Fetch variables
  const fetchVariables = async () => {
    try {
      setLoading(true);
      const data = await getCalculationVariables();
      setVariables(data);
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
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVariable(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingVariable) {
        // Update existing variable
        await updateCalculationVariable(
          editingVariable.id,
          {
            ...formData,
            value: parseFloat(formData.value)
          },
          user.id
        );
        showSnackbar('Variável atualizada com sucesso!', 'success');
      } else {
        // Create new variable
        await createCalculationVariable(
          {
            ...formData,
            value: parseFloat(formData.value)
          },
          user.id
        );
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

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta variável?')) {
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Variáveis de Cálculo
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Adicionar Variável
        </Button>
      </Box>

      {loading && variables.length === 0 ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell align="right">Valor</TableCell>
                  <TableCell>Unidade</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {variables
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((variable) => (
                    <TableRow key={variable.id}>
                      <TableCell>{variable.name}</TableCell>
                      <TableCell>
                        <Tooltip title={variable.description || 'Sem descrição'}>
                          <Typography noWrap sx={{ maxWidth: 200 }}>
                            {variable.description || '-'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">
                        {typeof variable.value === 'number' 
                          ? variable.value.toLocaleString('pt-BR', { maximumFractionDigits: 4 })
                          : variable.value}
                      </TableCell>
                      <TableCell>{variable.unit}</TableCell>
                      <TableCell>{variable.category}</TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenDialog(variable)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDelete(variable.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={variables.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Linhas por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
            }
          />
        </Paper>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingVariable ? 'Editar Variável' : 'Adicionar Nova Variável'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Nome"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  margin="normal"
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
                  margin="normal"
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
                  margin="normal"
                  inputProps={{
                    step: 'any'
                  }}
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
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="category"
                  select
                  label="Categoria"
                  value={formData.category}
                  onChange={handleChange}
                  fullWidth
                  required
                  margin="normal"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CalculationVariables;
