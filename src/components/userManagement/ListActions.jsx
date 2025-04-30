import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { EditOutlined, DeleteOutlined, AddCircleOutline } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
 
const ListActions = () => {
  const navigate = useNavigate();
  const location = useLocation();
 
  const [actions, setActions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionToDelete, setActionToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = "http://localhost:1010";
 
  const fetchActions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/auth/actions`);
     
      if (response.data && Array.isArray(response.data)) {
        setActions(response.data);
      } else {
        setActions([]);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch actions. Please try again later.');
      console.error('Error fetching actions:', err);
      setActions([]);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchActions();
  }, []);
 
  useEffect(() => {
    if (location.state?.success) {
      setSnackbarMessage(location.state.success);
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);
 
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
 
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
 
  const handleEdit = (id) => {
    navigate(`/admin/edit-action/${id}`);
  };
 
  const handleDeleteClick = (id) => {
    setActionToDelete(id);
    setDeleteDialogOpen(true);
  };
 
  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/auth/actions/${actionToDelete}`);
      await fetchActions(); // Refresh list
      setSnackbarMessage('Action deleted successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (err) {
      setSnackbarMessage('Failed to delete action. Please try again.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      console.error('Error deleting action:', err);
    } finally {
      setDeleteDialogOpen(false);
      setActionToDelete(null);
    }
  };
  
 
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setActionToDelete(null);
  };
 
  const handleCreateNew = () => {
    navigate('/admin/create-action');
  };
 
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };
 
  const getCurrentPageActions = () => {
    if (!Array.isArray(actions)) return [];
    return actions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  };
 
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            Actions
          </Typography>
         
          <Button
            variant="contained"
            startIcon={<AddCircleOutline />}
            onClick={handleCreateNew}
          >
            Create New Action
          </Button>
        </Box>
       
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
       
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Alias</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '120px' }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getCurrentPageActions().length > 0 ? (
                    getCurrentPageActions().map((action) => (
                      <TableRow key={action.actionId} hover>
                        <TableCell>{action.actionName}</TableCell>
                        <TableCell>{action.alias}</TableCell>
                        <TableCell>{action.description}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Edit">
                            <IconButton
                              color="primary"
                              onClick={() => handleEdit(action.actionId)}
                              sx={{ mr: 1 }}
                            >
                              <EditOutlined />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteClick(action.actionId)}
                            >
                              <DeleteOutlined />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1">No actions found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
           
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={actions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ mt: 2 }}
            />
          </>
        )}
      </Paper>
 
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this action? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
 
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};
 
export default ListActions;