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
  Snackbar,
  CircularProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:1010';

const RoleActionMapping = () => {
  const navigate = useNavigate();
  const { roleId } = useParams();

  const [role, setRole] = useState(null);
  const [actions, setActions] = useState([]);
  const [selectedActions, setSelectedActions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchRoleAndActions = async () => {
      try {
        setLoading(true);
        const [roleRes, actionsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/roles/${roleId}`),
          axios.get(`${API_BASE_URL}/actions`)
        ]);

        const fetchedRole = roleRes.data;
        const fetchedActions = actionsRes.data;

        setRole(fetchedRole);
        setActions(fetchedActions);
        setSelectedActions(fetchedRole.actions?.map(a => a.id) || []);
        setSelectAll(fetchedRole.actions?.length === fetchedActions.length);
      } catch (error) {
        console.error('Error fetching role or actions:', error);
        navigate('/admin/list-roles', { state: { error: 'Failed to load role data' } });
      } finally {
        setLoading(false);
      }
    };

    fetchRoleAndActions();
  }, [roleId, navigate]);

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

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedActions([]);
    } else {
      setSelectedActions(actions.map(action => action.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSave = async () => {
    if (!role) return;

    try {
      setSaving(true);
      await axios.put(`${API_BASE_URL}/roles/${role.id}/actions`, selectedActions);
      setSnackbar({ open: true, message: 'Role action mapping saved successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error saving action mapping:', error);
      setSnackbar({ open: true, message: 'Failed to save mapping', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading || !role) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            Role Action Mapping
          </Typography>
          <Chip
            label={role.roleName}
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
            onClick={() => navigate('/admin/list-roles')}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || selectedActions.length === 0}
          >
            {saving ? <CircularProgress size={24} /> : 'Save Mapping'}
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RoleActionMapping;
