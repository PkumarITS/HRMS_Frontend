import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: "http://localhost:1010",
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const LeaveBalance = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/leave-types');
      setLeaveTypes(response.data);
    } catch (err) {
      console.error('Error fetching leave types:', err);
      setError('Failed to load leave types');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  // Calculate total default allocation
  const totalAllocation = leaveTypes.reduce((sum, type) => sum + (type.defaultDays || 0), 0);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          My Leave Balance
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Leave Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Annual Capping</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell>{type.name}</TableCell>
                  <TableCell>{type.description || '-'}</TableCell>
                  <TableCell align="right">{type.defaultDays} days</TableCell>
                </TableRow>
              ))}
              {/* Total row */}
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell colSpan={2} sx={{ fontWeight: 600 }}>Total Available Leave Days</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{totalAllocation} days</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity="error" onClose={handleCloseSnackbar}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity="success" onClose={handleCloseSnackbar}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LeaveBalance;