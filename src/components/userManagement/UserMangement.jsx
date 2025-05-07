import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '../service/UserService';
import Cookies from 'js-cookie';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { Add, Edit, Delete, Refresh, SettingsInputComponent } from '@mui/icons-material';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    userId: null,
    userName: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = Cookies.get('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await UserService.getAllUsers(token);
      
      if (response && response.userDTOList) {
        setUsers(response.userDTOList);
      } else {
        setError('No users found');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error details:', error.response?.data || error.message);
      
      if (error.response?.status === 403) {
        setError('You are not authorized to view users');
        showNotification('Access denied: Insufficient permissions', 'error');
      } else {
        setError('Failed to load users. Please try again.');
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (userId, userName) => {
    setDeleteDialog({
      open: true,
      userId,
      userName
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = Cookies.get('token');
      await UserService.deleteUser(deleteDialog.userId, token);
      
      // Update local state to remove the deleted user
      setUsers(prevUsers => prevUsers.filter(user => user.id !== deleteDialog.userId));
      
      showNotification(`User "${deleteDialog.userName}" deleted successfully`, 'success');
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('Failed to delete user. Please try again.', 'error');
    } finally {
      setDeleteDialog({
        open: false,
        userId: null,
        userName: ''
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({
      open: false,
      userId: null,
      userName: ''
    });
  };

  const showNotification = (message, severity) => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleMapping = (userId) => {
    navigate(`/admin/user-mapping/${userId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm User Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to permanently delete user "{deleteDialog.userName}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            autoFocus
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Page Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
        <Box>
          <Tooltip title="Refresh">
            <IconButton 
              color="primary" 
              onClick={fetchUsers}
              sx={{ mr: 1 }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => navigate('/admin/register')}
          >
            Add User
          </Button>
        </Box>
      </Box>

      {/* Users Table */}
      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }} aria-label="user management table">
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Role</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>City</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '180px' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>{user.userId}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.city || '-'}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/admin/update-user/${user.userId}`)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Permissions">
                      <IconButton
                        color="secondary"
                        onClick={() => handleMapping(user.userId)}
                        sx={{ mx: 1 }}
                      >
                        <SettingsInputComponent />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(user.userId, user.name)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  {error ? (
                    <Alert severity="error">{error}</Alert>
                  ) : (
                    <Typography variant="body1">No users found</Typography>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default UserManagement;