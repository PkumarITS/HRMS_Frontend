import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider,
  Chip,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBack from '@mui/icons-material/ArrowBack';

const UserMapping = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Structure to match the image example
  const mockRoles = [
    {
      name: "ADMIN",
      description: "Full system access with all privileges",
      subRoles: [
        {
          name: "System Administrator",
          actions: [
            // User Management
            "Create User",
            "Edit User",
            "Delete User",
            "View All Users",
            
            // Role Management
            "Create Role",
            "Edit Role",
            "Delete Role",
            "View Roles",
            "Assign Roles",
            
            // Employee Management
            "Add Employee",
            "Edit Employee",
            "Delete Employee",
            "View All Employees",
            
            // Timesheet
            "Create Timesheet",
            "Approve Timesheet",
            "Reject Timesheet",
            "View All Timesheets",
            
            // Project Management
            "Create Project",
            "Edit Project",
            "Delete Project",
            "View All Projects",
            
            // Task Management
            "Create Task",
            "Assign Task",
            "Edit Task",
            "Delete Task",
            "View All Tasks",
            
            // Attendance
            "Mark Attendance",
            "Edit Attendance",
            "View All Attendance",
            "Generate Attendance Reports",
            
            // Leave Management
            "Apply Leave",
            "Approve Leave",
            "Reject Leave",
            "View All Leaves",
            "Manage Leave Types",
            
            // Holiday Calendar
            "Add Holiday",
            "Edit Holiday",
            "Delete Holiday",
            "View Holiday Calendar",
            
            // My Profile
            "View Profile",
            "Edit Profile",
            "Change Password"
          ]
        }
      ]
    },
    {
      name: "HR",
      description: "Human Resources department access",
      subRoles: [
        {
          name: "HR Manager",
          actions: [
            // Employee Management
            "Add Employee",
            "Edit Employee",
            "View All Employees",
            
            // Timesheet
            "View All Timesheets",
            "Approve Timesheet",
            "Reject Timesheet",
            
            // Attendance
            "View All Attendance",
            "Generate Attendance Reports",
            
            // Leave Management
            "Apply Leave",
            "Approve Leave",
            "Reject Leave",
            "View All Leaves",
            
            // Holiday Calendar
            "Add Holiday",
            "Edit Holiday",
            "View Holiday Calendar",
            
            // My Profile
            "View Profile",
            "Edit Profile",
            "Change Password"
          ]
        },
        {
          name: "HR Executive",
          actions: [
            // Employee Management
            "Add Employee",
            "Edit Employee",
            "View All Employees",
            
            // Attendance
            "View All Attendance",
            
            // Leave Management
            "View All Leaves",
            
            // Holiday Calendar
            "View Holiday Calendar",
            
            // My Profile
            "View Profile",
            "Edit Profile",
            "Change Password"
          ]
        }
      ]
    },
    {
      name: "MANAGER",
      description: "Department/Team manager access",
      subRoles: [
        {
          name: "Project Manager",
          actions: [
            // Project Management
            "Create Project",
            "Edit Project",
            "View All Projects",
            
            // Task Management
            "Create Task",
            "Assign Task",
            "Edit Task",
            "View All Tasks",
            
            // Timesheet
            "View Team Timesheets",
            "Approve Timesheet",
            "Reject Timesheet",
            
            // Attendance
            "View Team Attendance",
            
            // Leave Management
            "Apply Leave",
            "Approve Team Leave",
            "View Team Leaves",
            
            // My Profile
            "View Profile",
            "Edit Profile",
            "Change Password"
          ]
        },
        {
          name: "Department Manager",
          actions: [
            // Employee Management
            "View Team Employees",
            
            // Timesheet
            "View Team Timesheets",
            "Approve Timesheet",
            "Reject Timesheet",
            
            // Attendance
            "View Team Attendance",
            
            // Leave Management
            "Apply Leave",
            "Approve Team Leave",
            "View Team Leaves",
            
            // My Profile
            "View Profile",
            "Edit Profile",
            "Change Password"
          ]
        }
      ]
    },
    {
      name: "SUPERVISOR",
      description: "Team supervisor access",
      subRoles: [
        {
          name: "Team Lead",
          actions: [
            // Task Management
            "Assign Task",
            "Edit Task",
            "View Team Tasks",
            
            // Timesheet
            "View Team Timesheets",
            "Approve Timesheet",
            "Reject Timesheet",
            
            // Attendance
            "View Team Attendance",
            
            // Leave Management
            "Apply Leave",
            "View Team Leaves",
            
            // My Profile
            "View Profile",
            "Edit Profile",
            "Change Password"
          ]
        }
      ]
    },
    {
      name: "EMPLOYEE",
      description: "Regular employee access",
      subRoles: [
        {
          name: "Staff Member",
          actions: [
            // Timesheet
            "Create Timesheet",
            "View My Timesheets",
            
            // Task Management
            "View My Tasks",
            "Update Task Status",
            
            // Attendance
            "Mark Attendance",
            "View My Attendance",
            
            // Leave Management
            "Apply Leave",
            "View My Leaves",
            
            // My Profile
            "View Profile",
            "Edit Profile",
            "Change Password"
          ]
        }
      ]
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch user data
        const userResponse = await axios.get(`/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userResponse.data);

        // In a real app, you would fetch roles from the API
        // const rolesResponse = await axios.get('/api/roles', {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // setRoles(rolesResponse.data);
        
        // Using mock data for now to match the image
        setRoles(mockRoles);

        // Fetch user's current permissions
        const userPermissionsResponse = await axios.get(`/api/users/${userId}/permissions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Initialize selected permissions
        const initialPermissions = {};
        mockRoles.forEach(role => {
          initialPermissions[role.name] = {};
          role.subRoles.forEach(subRole => {
            initialPermissions[role.name][subRole.name] = 
              userPermissionsResponse.data[role.name]?.[subRole.name] || [];
          });
        });
        
        setSelectedPermissions(initialPermissions);

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch data', error);
        setNotification({
          open: true,
          message: 'Failed to load data',
          severity: 'error'
        });
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, navigate]);

  const handleCheckboxChange = (roleName, subRoleName, action) => {
    setSelectedPermissions(prev => {
      const updated = { ...prev };
      
      // Initialize role if it doesn't exist
      if (!updated[roleName]) {
        updated[roleName] = {};
      }
      
      // Initialize subRole if it doesn't exist
      if (!updated[roleName][subRoleName]) {
        updated[roleName][subRoleName] = [];
      }
      
      // Toggle the action
      if (updated[roleName][subRoleName].includes(action)) {
        updated[roleName][subRoleName] = updated[roleName][subRoleName].filter(
          a => a !== action
        );
      } else {
        updated[roleName][subRoleName] = [...updated[roleName][subRoleName], action];
      }
      
      return updated;
    });
  };

  const handleRoleToggle = (roleName, isSelected) => {
    setSelectedPermissions(prev => {
      const updated = { ...prev };
      const role = roles.find(r => r.name === roleName);
      
      if (!role) return prev;
      
      if (isSelected) {
        // Select all actions for all subRoles
        updated[roleName] = {};
        role.subRoles.forEach(subRole => {
          updated[roleName][subRole.name] = [...subRole.actions];
        });
      } else {
        // Deselect all actions for all subRoles
        updated[roleName] = {};
        role.subRoles.forEach(subRole => {
          updated[roleName][subRole.name] = [];
        });
      }
      
      return updated;
    });
  };

  const handleSelectAll = () => {
    const allSelected = {};
    
    roles.forEach(role => {
      allSelected[role.name] = {};
      role.subRoles.forEach(subRole => {
        allSelected[role.name][subRole.name] = [...subRole.actions];
      });
    });
    
    setSelectedPermissions(allSelected);
  };

  const handleDeselectAll = () => {
    const noneSelected = {};
    
    roles.forEach(role => {
      noneSelected[role.name] = {};
      role.subRoles.forEach(subRole => {
        noneSelected[role.name][subRole.name] = [];
      });
    });
    
    setSelectedPermissions(noneSelected);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');

      await axios.post(
        `/api/users/${userId}/permissions`,
        { permissions: selectedPermissions },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotification({
        open: true,
        message: 'Permissions updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to update permissions', error);
      setNotification({
        open: true,
        message: 'Failed to update permissions',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const isRoleChecked = (roleName) => {
    const role = roles.find(r => r.name === roleName);
    if (!role) return false;
    
    return role.subRoles.every(subRole => {
      const selectedActions = selectedPermissions[roleName]?.[subRole.name] || [];
      return selectedActions.length === subRole.actions.length;
    });
  };

  const isSubRoleChecked = (roleName, subRoleName) => {
    const role = roles.find(r => r.name === roleName);
    if (!role) return false;
    
    const subRole = role.subRoles.find(sr => sr.name === subRoleName);
    if (!subRole) return false;
    
    const selectedActions = selectedPermissions[roleName]?.[subRoleName] || [];
    return selectedActions.length === subRole.actions.length;
  };

  const isActionChecked = (roleName, subRoleName, action) => {
    return selectedPermissions[roleName]?.[subRoleName]?.includes(action) || false;
  };

  if (loading && !user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            User Mapping
          </Typography>
          {user && (
            <Chip 
              label={user.username} 
              color="primary" 
              sx={{ ml: 2, fontWeight: 'bold' }} 
            />
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ mb: 3 }}>
          
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            <strong>Username:</strong> {user?.username || 'Loading...'}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item>
              <Button variant="contained" onClick={handleSelectAll}>
                Select All
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" onClick={handleDeselectAll}>
                Deselect All
              </Button>
            </Grid>
          </Grid>
        </Box>

        {roles.map(role => (
          <Accordion key={role.name} defaultExpanded sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isRoleChecked(role.name)}
                    indeterminate={
                      !isRoleChecked(role.name) && 
                      role.subRoles.some(subRole => 
                        (selectedPermissions[role.name]?.[subRole.name]?.length || 0) > 0
                      )
                    }
                    onChange={(e) => handleRoleToggle(role.name, e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                    color="primary"
                  />
                }
                label={
                  <Typography sx={{ fontWeight: 600 }}>
                    {role.name}
                  </Typography>
                }
              />
            </AccordionSummary>
            <AccordionDetails>
              {role.subRoles.map(subRole => (
                <Box key={`${role.name}-${subRole.name}`} sx={{ ml: 4, mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isSubRoleChecked(role.name, subRole.name)}
                        indeterminate={
                          !isSubRoleChecked(role.name, subRole.name) && 
                          (selectedPermissions[role.name]?.[subRole.name]?.length || 0) > 0
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            // Select all actions
                            setSelectedPermissions(prev => ({
                              ...prev,
                              [role.name]: {
                                ...prev[role.name],
                                [subRole.name]: [...subRole.actions]
                              }
                            }));
                          } else {
                            // Deselect all actions
                            setSelectedPermissions(prev => ({
                              ...prev,
                              [role.name]: {
                                ...prev[role.name],
                                [subRole.name]: []
                              }
                            }));
                          }
                        }}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="subtitle1">
                        {subRole.name}
                      </Typography>
                    }
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', ml: 4 }}>
                    {subRole.actions.map(action => (
                      <FormControlLabel
                        key={`${role.name}-${subRole.name}-${action}`}
                        control={
                          <Checkbox
                            checked={isActionChecked(role.name, subRole.name, action)}
                            onChange={() => 
                              handleCheckboxChange(role.name, subRole.name, action)
                            }
                            color="primary"
                          />
                        }
                        label={action}
                        sx={{ mr: 2, minWidth: '200px' }}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
        </Box>
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

export default UserMapping;