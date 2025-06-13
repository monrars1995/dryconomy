import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Typography, Paper, CircularProgress, TablePagination,
  Alert, TextField, InputAdornment, Grid, IconButton, Tooltip, Divider,
  Chip, Button
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  ContentCopy as ContentCopyIcon,
  Visibility as VisibilityIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { supabase } from '../../services/authService';

const Leads = () => {
  // Estados para gerenciar os dados e paginação
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);

  // Buscar leads do banco de dados
  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);

      const from = page * rowsPerPage;
      const to = from + rowsPerPage - 1;

      let query = supabase
        .from('leads')
        .select('*', { count: 'exact' });

      // Aplicar filtro de busca
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`);
      }

      // Ordenar por data mais recente primeiro
      query = query.order('created_at', { ascending: false });

      // Aplicar paginação
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      setLeads(data || []);
      setTotalItems(count || 0);
    } catch (err) {
      console.error('Erro ao buscar leads:', err);
      setError('Erro ao carregar leads. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Carregar leads ao iniciar o componente ou quando a paginação/busca mudar
  useEffect(() => {
    fetchLeads();
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
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Copiar para a área de transferência
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('Copiado para a área de transferência');
      })
      .catch(err => {
        console.error('Erro ao copiar para a área de transferência:', err);
      });
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h5" component="h1">
              Gerenciar Leads
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={fetchLeads}
              disabled={loading}
            >
              Atualizar
            </Button>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar leads (nome, email, empresa)..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading && leads.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={4} minHeight={200}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
          ) : leads.length === 0 ? (
            <Box textAlign="center" p={4}>
              <Typography variant="h6" gutterBottom>
                Nenhum lead encontrado
              </Typography>
              <Typography color="textSecondary" paragraph>
                {searchTerm
                  ? 'Nenhum lead corresponde aos critérios de busca.'
                  : 'Não há leads cadastrados no sistema.'}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Telefone</TableCell>
                    <TableCell>Empresa</TableCell>
                    <TableCell>Data de Cadastro</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{lead.name || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Typography variant="body2" sx={{ mr: 1 }}>{lead.email || '-'}</Typography>
                          {lead.email && (
                            <IconButton
                              size="small"
                              onClick={() => copyToClipboard(lead.email)}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Typography variant="body2" sx={{ mr: 1 }}>{lead.phone || '-'}</Typography>
                          {lead.phone && (
                            <IconButton
                              size="small"
                              onClick={() => copyToClipboard(lead.phone)}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{lead.company || '-'}</TableCell>
                      <TableCell>{formatDate(lead.created_at)}</TableCell>
                      <TableCell>
                        <Chip
                          label={lead.status || 'Novo'}
                          color={lead.status === 'Convertido' ? 'success' : 'primary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Visualizar Detalhes">
                          <IconButton size="small" onClick={() => setSelectedLead(lead)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Enviar Email">
                          <IconButton
                            size="small"
                            onClick={() => window.open(`mailto:${lead.email}`)}
                            disabled={!lead.email}
                          >
                            <EmailIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ligar">
                          <IconButton
                            size="small"
                            onClick={() => window.open(`tel:${lead.phone}`)}
                            disabled={!lead.phone}
                          >
                            <PhoneIcon fontSize="small" />
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
                labelRowsPerPage="Leads por página:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                }
              />
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Leads;
