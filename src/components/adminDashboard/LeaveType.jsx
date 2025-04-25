import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Grid, 
  Box, 
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
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

const LeaveType = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    defaultDays: 0,
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/admin/leave-types', formData);
      setSuccess('Leave type created successfully!');
      setFormData({
        name: '',
        description: '',
        defaultDays: 0,
        isActive: true
      });
    } catch (err) {
      console.error('Error creating leave type:', err);
      setError(err.response?.data?.message || 'Failed to create leave type');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
          Add New Leave Type
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Leave Type Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Default Days"
                name="defaultDays"
                type="number"
                value={formData.defaultDays}
                onChange={handleChange}
                required
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ px: 4, py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Leave Type'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
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

export default LeaveType;