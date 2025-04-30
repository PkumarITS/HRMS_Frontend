import React, { useState, useEffect } from 'react';
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
import { HelpOutline, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

const EditActionPage = () => {
  const navigate = useNavigate();
  const { actionId } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState({
    name: false,
    description: false
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Load action data when component mounts
  useEffect(() => {
    const savedActions = JSON.parse(localStorage.getItem('actions') || '[]');
    const actionToEdit = savedActions.find(action => action.id === parseInt(actionId));
    
    if (actionToEdit) {
      setFormData({
        name: actionToEdit.name,
        description: actionToEdit.description
      });
    } else {
      navigate('/admin/list-actions', { state: { error: 'Action not found' } });
    }
  }, [actionId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: formData.name.trim() === '',
      description: formData.description.trim() === ''
    };

    setErrors(newErrors);
    
    if (newErrors.name || newErrors.description) {
      valid = false;
    }
    
    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const savedActions = JSON.parse(localStorage.getItem('actions') || '[]');
      const updatedActions = savedActions.map(action => {
        if (action.id === parseInt(actionId)) {
          return {
            ...action,
            name: formData.name,
            description: formData.description
          };
        }
        return action;
      });
      
      localStorage.setItem('actions', JSON.stringify(updatedActions));
      
      setNotification({
        open: true,
        message: 'Action updated successfully',
        severity: 'success'
      });
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/admin/list-actions');
      }, 1500);
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/admin/actions')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            Edit Action
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                Action Details
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Action Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                helperText={errors.name ? 'Action name is required' : ''}
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Enter a unique name for this action">
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
                error={errors.description}
                helperText={errors.description ? 'Description is required' : 'Provide a detailed description of this action'}
                variant="outlined"
                multiline
                rows={4}
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
                  onClick={() => navigate('/admin/list-actions')}

                  size="large"
                  sx={{ px: 4 }}
                >
                  Update Action
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
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditActionPage;