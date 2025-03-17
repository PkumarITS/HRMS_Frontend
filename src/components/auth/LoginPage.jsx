import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserService from "../service/UserService";
import { 
    Container, Card, CardContent, TextField, Button, Typography, 
    Box, Checkbox, FormControlLabel, Link 
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userData = await UserService.login(email, password);
            if (userData.token) {
                localStorage.setItem('token', userData.token);
                localStorage.setItem('role', userData.role);
                navigate('../dashboard');
            } else {
                setError(userData.message);
            }
        } catch (error) {
            setError(error.message);
            setTimeout(() => setError(''), 5000);
        }
    };

    return (
        <Container maxWidth="sm">
            <Card sx={{ mt: 8, p: 3, borderRadius: 2, boxShadow: 3  }}>
                <CardContent>
                    <Typography variant="h5" align="center" gutterBottom>
                        Login
                    </Typography>
                    {error && (
                        <Typography color="error" align="center">
                            {error}
                        </Typography>
                    )}
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email"
                            variant="outlined"
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            variant="outlined"
                            margin="normal"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <Button 
                                        onClick={() => setShowPassword(!showPassword)}
                                        size="small"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </Button>
                                ),
                            }}
                        />
                        <FormControlLabel
                            control={<Checkbox />}
                            label="Show Password"
                            onChange={() => setShowPassword(!showPassword)}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2, py: 1 }}
                            type="submit"
                        >
                            Sign In
                        </Button>
                    </form>
                    <Box textAlign="center" mt={2}>
                        <Link href="/forgot-password" underline="hover">
                            Forgot Password?
                        </Link>
                    </Box>
                    <Box textAlign="center" mt={1}>
                        <Typography variant="body2">
                            Don't have an account?{" "}
                            <Link href="./register" underline="hover">
                                Sign up
                            </Link>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
}

export default LoginPage;
