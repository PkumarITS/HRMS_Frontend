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
import { BadgeOutlined, HelpOutline, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

const EditRolePage = () => {
  const navigate = useNavigate();
  const { roleId } = useParams();
  const [formData, setFormData] = useState({
    roleName: '',
    description: ''
  });
  const [errors, setErrors] = useState({
    roleName: false,
    description: false
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Load role data when component mounts
  useEffect(() => {
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    const roleToEdit = roles.find(role => role.id === parseInt(roleId));
    
    if (roleToEdit) {
      setFormData({
        roleName: roleToEdit.name,
        description: roleToEdit.description
      });
    } else {
      navigate('/admin/roles', { state: { error: 'Role not found' } });
    }
  }, [roleId, navigate]);

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
      roleName: formData.roleName.trim() === '',
      description: formData.description.trim() === ''
    };

    setErrors(newErrors);
    
    if (newErrors.roleName || newErrors.description) {
      valid = false;
    }
    
    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const roles = JSON.parse(localStorage.getItem('roles') || '[]');
      const updatedRoles = roles.map(role => {
        if (role.id === parseInt(roleId)) {
          return {
            ...role,
            name: formData.roleName,
            description: formData.description
          };
        }
        return role;
      });
      
      localStorage.setItem('roles', JSON.stringify(updatedRoles));
      
      setNotification({
        open: true,
        message: 'Role updated successfully',
        severity: 'success'
      });
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/admin/roles');
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
          <IconButton onClick={() => navigate('/admin/roles')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            Edit Role
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" component="h2" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <BadgeOutlined color="primary" sx={{ mr: 1 }} />
                Role Details
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Role name"
                name="roleName"
                value={formData.roleName}
                onChange={handleChange}
                error={errors.roleName}
                helperText={errors.roleName ? 'Role name is required' : ''}
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
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={errors.description}
                helperText={errors.description ? 'Description is required' : 'Describe the purpose and permissions of this role'}
                variant="outlined"
                multiline
                rows={4}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/roles')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{ px: 4 }}
                >
                  Update Role
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

export default EditRolePage;