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
import { AddCircleOutline, HelpOutline, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const CreateActionPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState({
    name: false,
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
      name: formData.name.trim() === '',
      description: false // Making description optional
    };

    setErrors(newErrors);
    return !newErrors.name; // Form is valid if name is not empty
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    
    if (!validateForm()) {
      // Show error message for required field
      setNotification({
        open: true,
        message: 'Action Name is required',
        severity: 'error'
      });
      return;
    }

    try {
      // Get existing actions from localStorage
      const existingActions = JSON.parse(localStorage.getItem('actions') || '[]');
      
      // Check if action name already exists
      const actionExists = existingActions.some(
        action => action.name.toLowerCase() === formData.name.trim().toLowerCase()
      );
      
      if (actionExists) {
        setNotification({
          open: true,
          message: 'Action with this name already exists',
          severity: 'error'
        });
        return;
      }
      
      // Create new action with unique ID
      const newAction = {
        id: Date.now(), // Simple ID generation
        name: formData.name.trim(),
        description: formData.description.trim()
      };
      
      // Update actions list
      const updatedActions = [...existingActions, newAction];
      
      // Save to localStorage
      localStorage.setItem('actions', JSON.stringify(updatedActions));
      
      // Show success notification
      setNotification({
        open: true,
        message: 'Action created successfully!',
        severity: 'success'
      });
      
      // Reset form
      setFormData({
        name: '',
        description: ''
      });
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/admin/list-actions', { state: { success: 'Action created successfully!' } });
      }, 1500);
    } catch (error) {
      console.error('Error saving action:', error);
      setNotification({
        open: true,
        message: 'Failed to create action',
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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/admin/list-actions')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            Create Action
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" component="h2" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <AddCircleOutline color="primary" sx={{ mr: 1 }} />
                Action Details
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Action Name "
                name="name"
                required
                autoFocus
                value={formData.name}
                onChange={handleChange}
                error={submitAttempted && errors.name}
                helperText={
                  submitAttempted && errors.name 
                    ? 'Action name is required' 
                    : 'Enter a unique name for this action'
                }
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Must be unique">
                        <HelpOutline color="action" />
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
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
                helperText="Provide a detailed description of this action (optional)"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/list-actions')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{ px: 4 }}
                  startIcon={<AddCircleOutline />}
                >
                  Create Action
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

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

export default CreateActionPage;