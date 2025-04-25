import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Card, CardContent, TextField, Button, Typography,
  MenuItem, Select, FormControl, InputLabel, Box, IconButton, InputAdornment,
  Alert, CircularProgress
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import UserService from '../service/UserService';
import Cookies from "js-cookie";

function RegistrationPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    city: '',
    empId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Convert empId to uppercase as user types
    const processedValue = name === 'empId' ? value.toUpperCase() : value;
    setFormData({ ...formData, [name]: processedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Basic validation
      if (!formData.empId || !formData.name || !formData.email || !formData.role || !formData.password) {
        throw new Error('All fields are required');
      }

      // Validate empId format (uppercase alphanumeric)
      if (!/^[A-Z0-9]+$/.test(formData.empId)) {
        throw new Error('Employee ID must contain only uppercase letters and numbers');
      }

      const token = Cookies.get("token");
      const response = await UserService.register(formData, token);

      if (response.statusCode === 200) {
        setFormData({ name: '', email: '', password: '', role: '', city: '', empId: '' });
        navigate('/admin/user-management', { 
          state: { success: 'User registered successfully' } 
        });
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1976D2 30%, #42A5F5 90%)",
        p: 2,
      }}
    >
      <Card
        sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: 6,
          width: "100%",
          backgroundColor: "white",
        }}
      >
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
            Register New User
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Employee ID"
              name="empId"
              variant="outlined"
              margin="normal"
              value={formData.empId}
              onChange={handleInputChange}
              required
              disabled={loading}
              inputProps={{
                style: { textTransform: 'uppercase' },
                pattern: "[A-Z0-9]*",
                title: "Only uppercase letters and numbers are allowed"
              }}
              helperText="Must be uppercase alphanumeric characters"
            />
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              variant="outlined"
              margin="normal"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              variant="outlined"
              margin="normal"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                label="Role"
                onChange={handleInputChange}
                disabled={loading}
              >
                <MenuItem value="admin">ADMIN</MenuItem>
                <MenuItem value="user">USER</MenuItem>
                <MenuItem value="hr">HR</MenuItem>
                <MenuItem value="supervisor">SUPERVISOR</MenuItem>

              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="City"
              name="city"
              variant="outlined"
              margin="normal"
              value={formData.city}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              variant="outlined"
              margin="normal"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={() => setShowPassword(!showPassword)} 
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ 
                mt: 3, 
                py: 1.5, 
                fontWeight: "bold", 
                fontSize: "1rem", 
                borderRadius: 2 
              }}
              type="submit"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default RegistrationPage;