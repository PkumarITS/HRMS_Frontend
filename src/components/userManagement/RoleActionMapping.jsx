import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Button,
  Divider,
  Chip,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

const RoleActionMapping = () => {
  const navigate = useNavigate();
  const { roleId } = useParams();
  
  // Local state for actions
  const [actions] = useState([
    { id: 1, name: 'Category Mapping', description: 'Category Mapping' },
    { id: 2, name: 'Change Password', description: 'Change Passwords' },
    { id: 3, name: 'Create Action', description: 'for creating action' },
    { id: 4, name: 'Create Billing Cycle', description: 'Create Billing Cycle' },
    { id: 5, name: 'Create Category', description: 'for creating category' },
    { id: 6, name: 'Create Customer', description: 'Create Customer' },
    { id: 7, name: 'Create Role', description: 'for creating role' },
    { id: 8, name: 'Create User', description: 'for creating users' },
  ]);

  // State for role and selected actions
  const [role, setRole] = useState(null);
  const [selectedActions, setSelectedActions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  // Load role data
  useEffect(() => {
    const savedRoles = JSON.parse(localStorage.getItem('roles')) || [];
    const foundRole = savedRoles.find(role => role.id === parseInt(roleId));
    
    if (foundRole) {
      setRole(foundRole);
      setSelectedActions(foundRole.actions || []);
      setSelectAll(foundRole.actions?.length === actions.length);
    } else {
      navigate('/roles');
    }
  }, [roleId, actions.length, navigate]);

  // Handle individual action selection
  const handleToggle = (actionId) => () => {
    const currentIndex = selectedActions.indexOf(actionId);
    const newSelected = [...selectedActions];

    if (currentIndex === -1) {
      newSelected.push(actionId);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelectedActions(newSelected);
    setSelectAll(newSelected.length === actions.length);
  };

  // Handle select all/deselect all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedActions([]);
    } else {
      setSelectedActions(actions.map(action => action.id));
    }
    setSelectAll(!selectAll);
  };

  // Save the mapping
  const handleSave = () => {
    if (!role) return;

    // Update the role in localStorage
    const savedRoles = JSON.parse(localStorage.getItem('roles')) || [];
    const updatedRoles = savedRoles.map(r => 
      r.id === role.id ? { ...r, actions: selectedActions } : r
    );
    
    localStorage.setItem('roles', JSON.stringify(updatedRoles));
    setSnackbar({ open: true, message: 'Role action mapping saved successfully!' });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!role) return null;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            Role Action Mapping
          </Typography>
          <Chip 
            label={role.name} 
            color="primary" 
            sx={{ ml: 2, fontWeight: 'bold', textTransform: 'uppercase' }} 
          />
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            <strong>Description:</strong> {role.description}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={selectAll}
                onChange={handleSelectAll}
                color="primary"
              />
            }
            label={selectAll ? 'Deselect All' : 'Select All'}
          />
          <Typography variant="body2" color="text.secondary">
            {selectedActions.length} of {actions.length} actions selected
          </Typography>
        </Box>
        
        <Paper elevation={0} sx={{ maxHeight: '500px', overflow: 'auto', border: '1px solid #e0e0e0' }}>
          <List dense>
            {actions.map((action) => (
              <ListItem
                key={action.id}
                secondaryAction={
                  <Checkbox
                    edge="end"
                    onChange={handleToggle(action.id)}
                    checked={selectedActions.includes(action.id)}
                  />
                }
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemText
                  primary={action.name}
                  secondary={action.description}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/roles')}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={selectedActions.length === 0}
          >
            Save Mapping
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RoleActionMapping;