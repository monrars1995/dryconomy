import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Paper, CircularProgress, TablePagination,
  Alert, TextField, InputAdornment, Grid, IconButton, Tooltip, Chip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider, Avatar, useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Assessment as AssessmentIcon,
  WaterDrop as WaterDropIcon,
  AttachMoney as AttachMoneyIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material';
import { getSimulations } from '../../services/simulationService';

const SimulationsPanel = () => {
  const theme = useTheme();
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchSimulations = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, count, error } = await getSimulations({
        page: page + 1,
        perPage: rowsPerPage,
        search: searchTerm,
      });

      if (error) throw error;

      setSimulations(data || []);
      setTotalItems(count || 0);
    } catch (err) {
      setError('Erro ao carregar simulações. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulations();
  }, [page, rowsPerPage, searchTerm]);

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const handleViewDetails = (simulation) => {
    setSelectedSimulation(simulation);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedSimulation(null);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' } }}>
        <Box sx={{ mb: { xs: 2, sm: 0 } }}>
          <Typography variant="h5" component="h1" gutterBottom sx={{ color: '#00337A' }}>
            <AssessmentIcon sx={{ mr: 1, verticalAlign: 'bottom', color: '#00337A' }} />
            Histórico de Simulações
          </Typography>
          <Typography variant="body2" sx={{ color: '#555555', fontWeight: 500 }}>
            Visualize e gerencie todas as simulações realizadas
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchSimulations}
            sx={{ borderRadius: 2 }}
          >
            Atualizar
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar simulações (capacidade, localização)..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'action.active', mr: 1 }} /></InputAdornment>,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
      </Paper>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {loading && simulations.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={4} minHeight={200}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
          ) : simulations.length === 0 ? (
            <Box textAlign="center" p={4}>
              <Typography variant="h6" gutterBottom>
                Nenhuma simulação encontrada
              </Typography>
              <Typography color="textSecondary" paragraph>
                {searchTerm
                  ? 'Nenhuma simulação corresponde aos critérios de busca.'
                  : 'Não há simulações registradas no sistema.'}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'primary.light' + '10' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Capacidade</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Localização</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Economia Anual</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Data</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {simulations.map((simulation) => (
                    <TableRow key={simulation.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {simulation.id.substring(0, 8)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {simulation.capacity} kW
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {simulation.location}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {simulation.comparison_yearly_difference?.toLocaleString('pt-BR')} L
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(simulation.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Ver Detalhes">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(simulation)}
                            color="primary"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={totalItems}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Simulações por página:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                }
              />
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes da Simulação */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1
          }
        }}
      >
        {selectedSimulation && (
          <>
            <DialogTitle sx={{
              borderBottom: `1px solid ${theme.palette.divider}`,
              pb: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AssessmentIcon sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Detalhes da Simulação
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Informações Gerais
                  </Typography>
                  <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">ID da Simulação:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedSimulation.id}</Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Data:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{formatDate(selectedSimulation.created_at)}</Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Capacidade:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedSimulation.capacity} kW</Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Localização:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedSimulation.location}</Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Horas de Operação:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedSimulation.operating_hours} h/dia</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Dias de Operação:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedSimulation.operating_days} dias/ano</Typography>
                    </Box>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Resultados da Economia
                  </Typography>
                  <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Economia Anual de Água:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedSimulation.comparison_yearly_difference?.toLocaleString('pt-BR')} L
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Redução Percentual:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedSimulation.comparison_yearly_difference_percentage?.toFixed(2)}%
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">CO2 Evitado (ton):</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {(selectedSimulation.comparison_yearly_difference * 0.00058 / 1000)?.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Economia Financeira (R$):</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        R$ {(selectedSimulation.comparison_yearly_difference * 0.0105)?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Consumo Detalhado (L/ano)
                  </Typography>
                  <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">DryCooler:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedSimulation.drycooler_yearly_consumption?.toLocaleString('pt-BR')} L
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Torre Convencional:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedSimulation.tower_yearly_consumption?.toLocaleString('pt-BR')} L
                        </Typography>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={handleCloseDetails}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                Fechar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default SimulationsPanel;