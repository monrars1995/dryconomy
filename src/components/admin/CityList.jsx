import React, { useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, TablePagination, Paper, CircularProgress, 
  IconButton, Tooltip, Typography, useTheme, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, Button, Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
  Thermostat as ThermostatIcon,
  WaterDrop as WaterDropIcon
} from '@mui/icons-material';
import { deleteCity } from '../../services/cityService';

const CityList = ({
  cities,
  loading,
  page,
  rowsPerPage,
  totalItems,
  onChangePage,
  onChangeRowsPerPage,
  onEditCity,
  onRefresh
}) => {
  const theme = useTheme();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cityToDelete, setCityToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Abrir diálogo de confirmação de exclusão
  const handleOpenDeleteDialog = (city) => {
    setCityToDelete(city);
    setDeleteDialogOpen(true);
    setDeleteError(null);
  };

  // Fechar diálogo de confirmação
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCityToDelete(null);
    setDeleteError(null);
  };

  // Realizar exclusão após confirmação
  const handleDeleteConfirm = async () => {
    if (!cityToDelete) return;
    
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      
      const { error } = await deleteCity(cityToDelete.id);
      
      if (error) throw error;
      
      // Atualizar lista após excluir
      onRefresh();
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Erro ao excluir cidade:', error);
      setDeleteError('Erro ao excluir cidade. Tente novamente.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Box>
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
              <TableCell sx={{ fontWeight: 'bold' }}>Temperatura Média</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Consumo (DryCooler)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Consumo (Torre)</TableCell>
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ThermostatIcon 
                        fontSize="small" 
                        sx={{ color: 'warning.main', mr: 0.5 }} 
                      />
                      {city.average_temperature ? 
                        `${city.average_temperature}°C` : 
                        '-'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WaterDropIcon 
                        fontSize="small" 
                        sx={{ color: 'primary.main', mr: 0.5 }} 
                      />
                      {city.water_consumption_year ? 
                        `${Number(city.water_consumption_year).toLocaleString('pt-BR')} L/ano` : 
                        '-'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WaterDropIcon 
                        fontSize="small" 
                        sx={{ color: 'error.main', mr: 0.5 }} 
                      />
                      {city.water_consumption_year_conventional ? 
                        `${Number(city.water_consumption_year_conventional).toLocaleString('pt-BR')} L/ano` : 
                        '-'}
                    </Box>
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
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Excluir Cidade
        </DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}
          <Typography variant="body1">
            Tem certeza que deseja excluir a cidade "{cityToDelete?.name}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta ação não poderá ser desfeita e todos os dados associados a esta cidade serão perdidos.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={handleCloseDeleteDialog} 
            disabled={deleteLoading}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
            sx={{ borderRadius: 2 }}
          >
            {deleteLoading ? <CircularProgress size={24} /> : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CityList;