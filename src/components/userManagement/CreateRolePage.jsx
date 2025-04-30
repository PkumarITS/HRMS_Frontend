import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Container,
  InputAdornment,
  IconButton,
  Tooltip,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import { BadgeOutlined, HelpOutline, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const CreateRolePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    roleName: '',
    description: ''
  });
  const [errors, setErrors] = useState({
    roleName: false,
    description: false
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      roleName: formData.roleName.trim() === '',
      description: false // Making description optional in this version
    };

    setErrors(newErrors);
    return !newErrors.roleName; // Form is valid if roleName is not empty
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    
    if (!validateForm()) {
      // Show error message for required field
      setNotification({
        open: true,
        message: 'Role Name is required',
        severity: 'error'
      });
      return;
    }

    try {
      const newRole = {
        id: Date.now(), // Simple ID generation
        name: formData.roleName.trim(),
        description: formData.description.trim()
      };
      
      // Get existing roles from localStorage
      const existingRoles = JSON.parse(localStorage.getItem('roles') || '[]');
      const updatedRoles = [...existingRoles, newRole];
      
      // Save to localStorage
      localStorage.setItem('roles', JSON.stringify(updatedRoles));
      
      // Show success notification
      setNotification({
        open: true,
        message: 'Role created successfully!',
        severity: 'success'
      });
      
      // Reset form
      setFormData({
        roleName: '',
        description: ''
      });
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/admin/list-roles', { state: { success: 'Role created successfully!' } });
      }, 1500);
    } catch (error) {
      console.error('Error saving role:', error);
      setNotification({
        open: true,
        message: 'Failed to create role',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/admin/list-roles')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            Create Role
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Form Section */}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" component="h2" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <BadgeOutlined color="primary" sx={{ mr: 1 }} />
                Role Details
              </Typography>
            </Grid>
            
            {/* Role Name Field - Required */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Role name *"
                name="roleName"
                value={formData.roleName}
                onChange={handleChange}
                error={submitAttempted && errors.roleName}
                helperText={submitAttempted && errors.roleName ? 'Role name is required' : ''}
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Enter a unique name for this role">
                        <HelpOutline color="action" />
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            {/* Description Field - Optional */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={4}
                helperText="Describe the purpose and permissions of this role (optional)"
              />
            </Grid>
            
            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/list-roles')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{ px: 4 }}
                >
                  Create Role
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateRolePage;