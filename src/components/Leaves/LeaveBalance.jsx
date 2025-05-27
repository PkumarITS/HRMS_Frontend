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
  Snackbar,
  Chip
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { differenceInDays, parseISO, format } from 'date-fns';
import API_BASE_URL from '../config/apiConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
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
  const [today, setToday] = useState(new Date());

  useEffect(() => {
    fetchLeaveTypes();
    
    const updateDate = () => {
      const now = new Date();
      const millisecondsUntilMidnight = 
        (24 * 60 * 60 * 1000) - 
        (now.getHours() * 60 * 60 * 1000 + 
         now.getMinutes() * 60 * 1000 + 
         now.getSeconds() * 1000);
      
      setTimeout(() => {
        setToday(new Date());
        const intervalId = setInterval(() => {
          setToday(new Date());
        }, 24 * 60 * 60 * 1000);
        
        return () => clearInterval(intervalId);
      }, millisecondsUntilMidnight);
    };

    updateDate();
  }, []);

  const fetchLeaveTypes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/my-leave-types`);
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

  const getDaysRemaining = (expirationDate) => {
    if (!expirationDate) return null;
    const expDate = parseISO(expirationDate);
    return differenceInDays(expDate, today);
  };

  const formatExpiration = (expirationDate) => {
    const daysRemaining = getDaysRemaining(expirationDate);
    
    if (daysRemaining === null) {
      return <Chip label="No expiration" color="default" size="small" />;
    }
    
    if (daysRemaining < 0) {
      return <Chip label="Expired" color="error" size="small" />;
    } else if (daysRemaining === 0) {
      return <Chip label="Expires today" color="warning" size="small" />;
    } else {
      return (
        <Chip 
          label={`${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`} 
          color={daysRemaining <= 3 ? "warning" : "success"} 
          size="small" 
        />
      );
    }
  };

  const formatCarryForward = (carryForward) => {
    return carryForward ? (
      <Chip label="Yes" color="success" size="small" />
    ) : (
      <Chip label="No" color="default" size="small" />
    );
  };

  const totalAllocation = leaveTypes.reduce((sum, type) => sum + (type.defaultDays || 0), 0);
  const totalRemaining = leaveTypes.reduce((sum, type) => sum + (type.remainingDays || 0), 0);

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
        <Typography variant="subtitle1" color="text.secondary">
          As of {format(today, 'MMMM do, yyyy')}
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Leave Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Annual Allocation</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Carry Forward</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Remaining</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Expiration Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell>{type.name}</TableCell>
                  <TableCell>{type.description || '-'}</TableCell>
                  <TableCell align="right">{type.defaultDays} days</TableCell>
                  <TableCell align="center">
                    {formatCarryForward(type.carryForward)}
                  </TableCell>
                  <TableCell align="right">{type.remainingDays || 0} days</TableCell>
                  <TableCell>
                    {formatExpiration(type.endDate)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell colSpan={2} sx={{ fontWeight: 600 }}>Total</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{totalAllocation} days</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>-</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{totalRemaining} days</TableCell>
                <TableCell></TableCell>
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