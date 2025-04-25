import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: "http://localhost:1010",
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AdminLeaveBalance = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentLeaveType, setCurrentLeaveType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    defaultDays: 0,
    isActive: true
  });

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/leave-types');
      setLeaveTypes(response.data);
    } catch (err) {
      console.error('Error fetching leave types:', err);
      setError('Failed to load leave types');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (leaveType) => {
    setCurrentLeaveType(leaveType);
    setFormData({
      name: leaveType.name,
      description: leaveType.description,
      defaultDays: leaveType.defaultDays || 0,
      isActive: leaveType.isActive
    });
    setEditDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/leave-types/${id}`);
      setSuccess('Leave type deleted successfully');
      fetchLeaveTypes();
    } catch (err) {
      console.error('Error deleting leave type:', err);
      setError('Failed to delete leave type');
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/admin/leave-types/${currentLeaveType.id}`, formData);
      setSuccess('Leave type updated successfully');
      setEditDialogOpen(false);
      fetchLeaveTypes();
    } catch (err) {
      console.error('Error updating leave type:', err);
      setError(err.response?.data?.message || 'Failed to update leave type');
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  // Calculate total default allocation
  const totalAllocation = leaveTypes.reduce((sum, type) => sum + (type.defaultDays || 0), 0);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Manage Leave Types
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          href="/admin/leaves-type"
          sx={{ borderRadius: 2 }}
        >
          Add New
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Annual Capping</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell>{type.name}</TableCell>
                  <TableCell>{type.description || '-'}</TableCell>
                  <TableCell align="right">{type.defaultDays} days</TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => handleEditClick(type)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(type.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {/* Total row */}
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell colSpan={2} sx={{ fontWeight: 600 }}>Total</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{totalAllocation} days</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Leave Type</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Annual Capping (days)"
              name="defaultDays"
              type="number"
              value={formData.defaultDays}
              onChange={handleFormChange}
              margin="normal"
              required
              inputProps={{ min: 0 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdate} color="primary" variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity="error" onClose={handleCloseSnackbar}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity="success" onClose={handleCloseSnackbar}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminLeaveBalance;