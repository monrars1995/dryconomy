import React, { useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, TablePagination, Paper, CircularProgress, 
  IconButton, Tooltip, TextField, InputAdornment, Typography,
  Chip, useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { deleteCity } from '../../services/cityService';
import DeleteConfirmDialog from './DeleteConfirmDialog';

const CityList = ({
  cities,
  loading,
  page,
  rowsPerPage,
  totalItems,
  onChangePage,
  onChangeRowsPerPage,
  onSearchChange,
  onEditCity,
  onRefresh
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cityToDelete, setCityToDelete] = useState(null);

  // Manipulador de busca com debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Debounce de 500ms
    const timeoutId = setTimeout(() => {
      onSearchChange(value);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  // Abrir diálogo de confirmação de exclusão
  const handleOpenDeleteDialog = (city) => {
    setCityToDelete(city);
    setDeleteDialogOpen(true);
  };

  // Fechar diálogo de confirmação
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCityToDelete(null);
  };

  // Realizar exclusão após confirmação
  const handleDeleteConfirm = async () => {
    if (!cityToDelete) return;
    
    try {
      const { error } = await deleteCity(cityToDelete.id);
      
      if (error) {
        throw error;
      }
      
      // Atualizar lista após excluir
      onRefresh();
    } catch (error) {
      console.error('Erro ao excluir cidade:', error);
      // Implementar notificação de erro aqui
    } finally {
      handleCloseDeleteDialog();
    }
  };

  return (
    <Box>
      {/* Campo de busca */}
      <Box sx={{ mb: 3 }}>
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
      </Box>

      {/* Tabela de cidades */}
      <TableContainer component={Paper} sx={{ 
        borderRadius: 2,
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
        mb: 2,
        overflow: 'hidden'
      }}>
        <Table aria-label="tabela de cidades">
          <TableHead sx={{ backgroundColor: theme.palette.primary.light + '20' }}>
            <TableRow>
              <TableCell width="5%"></TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>País</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Consumo Anual (Drycooler)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Consumo Anual (Torre)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Temperatura Média</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={40} />
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    Carregando cidades...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : cities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1">
                    Nenhuma cidade encontrada.
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    {searchTerm ? 'Tente uma busca diferente ou' : ''} adicione uma nova cidade.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              cities.map((city) => (
                <TableRow key={city.id} hover>
                  <TableCell>
                    <HomeIcon fontSize="small" color="primary" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {city.name || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>{city.state || '-'}</TableCell>
                  <TableCell>{city.country || 'Brasil'}</TableCell>
                  <TableCell>
                    {city.water_consumption_year ? 
                      `${Number(city.water_consumption_year).toLocaleString('pt-BR')} L/ano` : 
                      '-'}
                  </TableCell>
                  <TableCell>
                    {city.water_consumption_year_conventional ? 
                      `${Number(city.water_consumption_year_conventional).toLocaleString('pt-BR')} L/ano` : 
                      '-'}
                  </TableCell>
                  <TableCell>
                    {city.average_temperature ? 
                      `${city.average_temperature}°C` : 
                      '-'}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar Cidade">
                      <IconButton 
                        size="small"
                        onClick={() => onEditCity(city)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir Cidade">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDeleteDialog(city)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginação */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalItems}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onChangePage}
        onRowsPerPageChange={onChangeRowsPerPage}
        labelRowsPerPage="Cidades por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
        }
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
            fontWeight: 500,
          }
        }}
      />

      {/* Diálogo de confirmação de exclusão */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title="Excluir Cidade"
        content={`Tem certeza que deseja excluir a cidade "${cityToDelete?.name}"? Esta ação não poderá ser desfeita.`}
        onCancel={handleCloseDeleteDialog}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
};

export default CityList;
