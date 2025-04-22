import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Chip,
  Box,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import { Search, Refresh, ChevronLeft, ChevronRight } from '@mui/icons-material';

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const recordsPerPage = 10;

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      // let url = 'http://localhost:1010/adminuser/attendance';
      let url = 'http://localhost:1010/admin/attendance';
      const params = new URLSearchParams();
      
      if (searchId) params.append('employeeId', searchId);
      if (filterDate) params.append('date', filterDate);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await axios.get(`${url}/all`);
      setAttendance(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const filteredAttendance = attendance.filter(record => {
    const matchesId = record.employeeId?.toString().toLowerCase().includes(searchId.toLowerCase());
    
    // Proper date filtering
    if (filterDate) {
      const recordDate = new Date(record.inTime).toISOString().split('T')[0];
      return matchesId && recordDate === filterDate;
    }
    
    return matchesId;
  });

  const totalPages = Math.ceil(filteredAttendance.length / recordsPerPage);
  const paginatedAttendance = filteredAttendance.slice(
    currentPage * recordsPerPage,
    (currentPage + 1) * recordsPerPage
  );

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

  const handleDateChange = (e) => {
    setFilterDate(e.target.value);
    setCurrentPage(0); // Reset to first page when filtering
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Attendance Management</Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Search by Employee ID"
            value={searchId}
            onChange={(e) => {
              setSearchId(e.target.value);
              setCurrentPage(0);
            }}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1 }} />
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            type="date"
            label="Filter by Date"
            InputLabelProps={{ shrink: true }}
            value={filterDate}
            onChange={handleDateChange}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Refresh />}
            onClick={fetchAttendance}
            disabled={loading}
            sx={{ height: '56px' }}
          >
            Refresh
          </Button>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead sx={{ backgroundColor: '#1976d2' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white' }}>Employee ID</TableCell>
                  <TableCell sx={{ color: 'white' }}>Name</TableCell>
                  <TableCell sx={{ color: 'white' }}>Date</TableCell>
                  <TableCell sx={{ color: 'white' }}>In Time</TableCell>
                  <TableCell sx={{ color: 'white' }}>Out Time</TableCell>
                  <TableCell sx={{ color: 'white' }}>Duration</TableCell>
                  <TableCell sx={{ color: 'white' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedAttendance.length > 0 ? (
                  paginatedAttendance.map((record) => (
                    <TableRow key={record.id} hover>
                      <TableCell>{record.employeeId}</TableCell>
                      <TableCell>{record.employeeName}</TableCell>
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
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="textSecondary">
                        No attendance records found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredAttendance.length > recordsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 2 }}>
              <IconButton
                onClick={() => setCurrentPage(p => Math.max(p - 1, 0))}
                disabled={currentPage === 0}
              >
                <ChevronLeft />
              </IconButton>
              <Typography variant="body2">
                Page {currentPage + 1} of {totalPages}
              </Typography>
              <IconButton
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages - 1))}
                disabled={currentPage >= totalPages - 1}
              >
                <ChevronRight />
              </IconButton>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default AdminAttendance;