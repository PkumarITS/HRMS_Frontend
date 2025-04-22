// UserAttendance.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { Login, Logout, Refresh } from '@mui/icons-material';

const UserAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clockedIn, setClockedIn] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState(null);

  const api = axios.create({
    baseURL: 'http://localhost:1010',
    headers: { Authorization: `Bearer ${Cookies.get('token')}` }
  });

  const fetchMyAttendance = async () => {
    setLoading(true);
    try {
      const response = await api.get('/user/attendance/my-attendance');
      setAttendance(response.data);
      
      // Check if there's an open attendance (no out_time)
      const openAttendance = response.data.find(a => !a.outTime);
      setClockedIn(!!openAttendance);
      setCurrentAttendance(openAttendance || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      await api.post('/user/attendance/clock-in');
      fetchMyAttendance();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    try {
      await api.put('/user/attendance/clock-out');
      fetchMyAttendance();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clock out');
    }
  };

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return date.toLocaleString();
  };

  const calculateDuration = (inTime, outTime) => {
    if (!inTime || !outTime) return 'N/A';
    const diffMs = new Date(outTime) - new Date(inTime);
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>My Attendance</Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button
          variant="contained"
          color="success"
          startIcon={<Login />}
          onClick={handleClockIn}
          disabled={clockedIn || loading}
        >
          Clock In
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<Logout />}
          onClick={handleClockOut}
          disabled={!clockedIn || loading}
        >
          Clock Out
        </Button>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchMyAttendance}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#1976d2' }}>
              <TableRow>
                <TableCell sx={{ color: 'white' }}>Date</TableCell>
                <TableCell sx={{ color: 'white' }}>In Time</TableCell>
                <TableCell sx={{ color: 'white' }}>Out Time</TableCell>
                <TableCell sx={{ color: 'white' }}>Duration</TableCell>
                <TableCell sx={{ color: 'white' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendance.length > 0 ? (
                attendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.inTime).toLocaleDateString()}</TableCell>
                    <TableCell>{formatDateTime(record.inTime)}</TableCell>
                    <TableCell>{formatDateTime(record.outTime)}</TableCell>
                    <TableCell>{calculateDuration(record.inTime, record.outTime)}</TableCell>
                    <TableCell>
                      <Chip
                        label={record.status || 'Present'}
                        color={
                          record.status === 'Present' ? 'success' : 
                          record.status === 'Half-day' ? 'warning' : 'error'
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No attendance records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default UserAttendance;