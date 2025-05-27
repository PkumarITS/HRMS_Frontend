import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
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
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  TextareaAutosize
} from '@mui/material';
import {
  Search,
  Check,
  Close,
  Refresh,
  ChevronLeft,
  ChevronRight,
  Edit,
  Visibility
} from '@mui/icons-material';
import API_BASE_URL from '../config/apiConfig';

const LeaveRequest = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editFormData, setEditFormData] = useState({
    status: ''
  });
  const recordsPerPage = 5;

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/leaves/all`);
      const processedData = response.data.map(request => ({
        id: request.id,
        employeeId: request.employeeId || 'N/A',
        employeeName: request.employeeName || 'N/A',
        leaveType: request.leaveType || 'N/A',
        fromDate: request.fromDate || request.startDate,
        toDate: request.toDate || request.endDate,
        reason: request.reason || 'N/A',
        status: request.status || 'Pending',
        createdAt: request.createdAt
      })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setLeaveRequests(processedData);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      setError('Failed to load leave requests. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/leaves/${id}/status`, null, {
        params: { status: newStatus }
      });
      setSuccess(`Status updated to ${newStatus} successfully!`);
      fetchLeaveRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status. Please try again.');
    }
  };

  const handleViewRequest = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leaves/${id}`);
      setSelectedRequest(response.data);
      setViewDialogOpen(true);
    } catch (error) {
      console.error('Error fetching leave request:', error);
      setError('Failed to fetch leave request details.');
    }
  };

  const handleEditRequest = (request) => {
    setSelectedRequest(request);
    setEditFormData({
      status: request.status
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`${API_BASE_URL}/leaves/${selectedRequest.id}/status`, null, {
        params: { status: editFormData.status }
      });
      setSuccess('Leave request status updated successfully!');
      fetchLeaveRequests();
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating leave request status:', error);
      setError('Failed to update leave request status. Please try again.');
    }
  };

  const filteredRequests = leaveRequests.filter(req => {
    const matchesId = req.employeeId?.toString().toLowerCase().includes(searchId.toLowerCase());
    const matchesStatus = filterStatus === 'All' || req.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesId && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRequests.length / recordsPerPage);
  const paginatedRequests = filteredRequests.slice(
    currentPage * recordsPerPage,
    (currentPage + 1) * recordsPerPage
  );

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return 'Invalid Date';
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={700} color="primary.main">
          Leave Requests
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchLeaveRequests}
          disabled={loading}
          sx={{ borderRadius: '20px', fontWeight: 600 }}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by Employee ID"
            value={searchId}
            onChange={(e) => {
              setSearchId(e.target.value);
              setCurrentPage(0);
            }}
            InputProps={{
              startAdornment: <Search sx={{ color: 'primary.main', mr: 1 }} />
            }}
            sx={{ borderRadius: 2 }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(0);
              }}
              label="Status Filter"
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="PENDING">PENDING</MenuItem>
              <MenuItem value="APPROVED">APPROVED</MenuItem>
              <MenuItem value="REJECTED">REJECTED</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" onClose={handleCloseSnackbar} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={handleCloseSnackbar} sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#1976d2' }}>
                <TableRow>
                  {['Employee ID', 'Name', 'Type', 'From', 'To', 'Reason', 'Status', 'Actions'].map((head, idx) => (
                    <TableCell key={idx} sx={{ color: 'white', fontWeight: 600 }}>
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRequests.length > 0 ? paginatedRequests.map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell>{request.employeeId}</TableCell>
                    <TableCell>{request.employeeName}</TableCell>
                    <TableCell>{request.leaveType}</TableCell>
                    <TableCell>{formatDate(request.fromDate)}</TableCell>
                    <TableCell>{formatDate(request.toDate)}</TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Box sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {request.reason}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request.status}
                        color={getStatusColor(request.status)}
                        variant="soft"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="View">
                          <IconButton color="primary" onClick={() => handleViewRequest(request.id)}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton color="info" onClick={() => handleEditRequest(request)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        
                        {request.status.toLowerCase() === 'pending' && (
                          <>
                            <Tooltip title="APPROVED">
                              <IconButton color="success" onClick={() => handleStatusUpdate(request.id, 'APPROVED')}>
                                <Check />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="REJECTED">
                              <IconButton color="error" onClick={() => handleStatusUpdate(request.id, 'REJECTED')}>
                                <Close />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="textSecondary">
                        💤 No leave requests found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredRequests.length > recordsPerPage && (
            <Box display="flex" justifyContent="center" alignItems="center" mt={3} gap={2}>
              <IconButton onClick={handlePrevPage} disabled={currentPage === 0}>
                <ChevronLeft />
              </IconButton>
              <Typography variant="body2" fontWeight={500}>
                Page {currentPage + 1} of {totalPages}
              </Typography>
              <IconButton onClick={handleNextPage} disabled={currentPage === totalPages - 1}>
                <ChevronRight />
              </IconButton>
            </Box>
          )}
        </>
      )}

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Leave Request Details</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600}>Employee ID:</Typography>
                <Typography>{selectedRequest.employeeId}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600}>Employee Name:</Typography>
                <Typography>{selectedRequest.employeeName}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600}>Leave Type:</Typography>
                <Typography>{selectedRequest.leaveType}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600}>Status:</Typography>
                <Chip
                  label={selectedRequest.status}
                  color={getStatusColor(selectedRequest.status)}
                  variant="soft"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600}>From Date:</Typography>
                <Typography>{formatDate(selectedRequest.fromDate)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600}>To Date:</Typography>
                <Typography>{formatDate(selectedRequest.toDate)}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600}>Reason:</Typography>
                <TextareaAutosize
                  minRows={3}
                  value={selectedRequest.reason}
                  readOnly
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600}>Created At:</Typography>
                <Typography>{formatDate(selectedRequest.createdAt)}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Leave Request Status</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600}>Employee:</Typography>
                <Typography>{selectedRequest.employeeName} (ID: {selectedRequest.employeeId})</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600}>Leave Type:</Typography>
                <Typography>{selectedRequest.leaveType}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600}>Dates:</Typography>
                <Typography>
                  {formatDate(selectedRequest.fromDate)} to {formatDate(selectedRequest.toDate)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                    label="Status"
                  >
                    <MenuItem value="PENDING">PENDING</MenuItem>
                    <MenuItem value="APPROVED">APPROVED</MenuItem>
                    <MenuItem value="REJECTED">REJECTED</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleEditSubmit}
            color="primary"
            variant="contained"
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LeaveRequest;