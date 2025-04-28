import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import UserService from "../service/UserService";
import {
    Container, Card, CardContent, TextField, Button, Typography,
    Box, Checkbox, FormControlLabel, Link, IconButton, InputAdornment,
    Alert, CircularProgress
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { userContext } from "../context/ContextProvider";

function LoginPage() {
    const { updateAuthState } = useContext(userContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Update the handleSubmit function to handle all roles
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        try {
            const response = await UserService.login(email, password);
            console.log("Login response:", response);

            if (response.token) {
                const normalizedRole = response.role.toLowerCase();

                updateAuthState({
                    role: normalizedRole,
                    authenticated: true
                });

                // Redirect based on role
                let redirectPath = '/';
                switch (normalizedRole) {
                    case 'admin':
                        redirectPath = '/admin/dashboard';
                        break;
                    case 'hr':
                        redirectPath = '/hr/hr-dashboard';
                        break;
                    case 'manager':
                        redirectPath = '/manager/manager-dashboard';
                        break;
                    case 'supervisor':
                        redirectPath = '/supervisor/supervisor-dashboard';
                        break;
                    case 'user':
                        redirectPath = '/user/employee-dashboard';
                        break;
                    default:
                        redirectPath = '/';
                }
                navigate(redirectPath);
            } else {
                setError(response.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error("Login error:", error);
            setError(error.response?.data?.message || error.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
            <Card sx={{ width: '100%', mt: 2, mb: 2, borderRadius: 3, boxShadow: 6 }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                        Login
                    </Typography>
                    <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
                        Please enter your credentials to login
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            variant="outlined"
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyPress={handleKeyPress}
                            autoComplete="email"
                            autoFocus
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            variant="outlined"
                            margin="normal"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={handleKeyPress}
                            autoComplete="current-password"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 1 }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={showPassword}
                                        onChange={() => setShowPassword(!showPassword)}
                                        color="primary"
                                    />
                                }
                                label="Show Password"
                            />
                            <Link href="/forgot-password" underline="hover" variant="body2">
                                Forgot Password?
                            </Link>
                        </Box>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            size="large"
                            type="submit"
                            disabled={loading}
                            sx={{ py: 1.5, mb: 2 }}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Container>
    );
}

export default LoginPage;