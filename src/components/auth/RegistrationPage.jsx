import React, { useState } from 'react';
import UserService from '../service/UserService';
import { useNavigate } from 'react-router-dom';
import { 
    Container, Card, CardContent, TextField, Button, Typography, 
    MenuItem, Select, FormControl, InputLabel, Box, IconButton 
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

function RegistrationPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: '',
        city: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     try {
    //         const token = localStorage.getItem('token');
    //         await UserService.register(formData, token);

    //         setFormData({ name: '', email: '', password: '', role: '', city: '' });
    //         alert('User registered successfully');
    //         navigate('/admin/user-management');
    //     } catch (error) {
    //         console.error('Error registering user:', error);
    //         alert('An error occurred while registering user');
    //     }
    // };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     try {
    //         const token = localStorage.getItem('token');
    //         console.log("Token:", token); // Log the token to verify its value
    //         await UserService.register(formData, token);
    
    //         setFormData({ name: '', email: '', password: '', role: '', city: '' });
    //         alert('User registered successfully');
    //         navigate('/admin/user-management');
    //     } catch (error) {
    //         console.error('Error registering user:', error);
    //         alert('An error occurred while registering user');
    //     }
    // };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            console.log("Token:", token); // Log the token to verify its value
            await UserService.register(formData, token);
    
            setFormData({ name: '', email: '', password: '', role: '', city: '' });
            alert('User registered successfully');
            navigate('/admin/user-management');
        } catch (error) {
            console.error('Error registering user:', error);
            alert('An error occurred while registering user');
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
                backgroundColor: "#1976D2" // Same as MUI Primary Button Color
            }}
        >
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: 3, width: "100%" }}>
                <CardContent>
                    <Typography variant="h5" align="center" gutterBottom>
                        Register
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Full Name"
                            name="name"
                            variant="outlined"
                            margin="normal"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            variant="outlined"
                            margin="normal"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Role</InputLabel>
                            <Select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                required
                            >
                                <MenuItem value="Admin">Admin</MenuItem>
                                <MenuItem value="User">User</MenuItem>
                                <MenuItem value="Manager">Manager</MenuItem>
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
                            InputProps={{
                                endAdornment: (
                                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                ),
                            }}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2, py: 1 }}
                            type="submit"
                        >
                            Register
                        </Button>
                    </form>
                    <Box textAlign="center" mt={2}>
                        <Typography variant="body2">
                            Already have an account?{" "}
                            <Button onClick={() => navigate('/login')} variant="text">
                                Login
                            </Button>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
}

export default RegistrationPage;
