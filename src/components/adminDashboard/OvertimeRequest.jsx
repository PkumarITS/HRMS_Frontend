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
  DialogActions,
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

const OvertimeRequest = () => {
  const [overtimeRequests, setOvertimeRequests] = useState([]);
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
    fetchOvertimeRequests();
  }, []);

  const fetchOvertimeRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/overtime/all`);
      const processedData = response.data.map(request => ({
        id: request.id,
        employeeId: request.employeeId || 'N/A',
        employeeName: request.employeeName || 'N/A',
        category: request.category || 'N/A',
        startTime: request.startTime,
        endTime: request.endTime,
        project: request.project || 'N/A',
        notes: request.notes || 'N/A',
        status: request.status || 'Pending',
        createdAt: request.createdAt
      })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setOvertimeRequests(processedData);
    } catch (error) {
      console.error('Error fetching overtime requests:', error);
      setError('Failed to load overtime requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/overtime/${id}`);
      const requestData = response.data;
      
      const formattedRequest = {
        ...requestData,
        employeeId: requestData.employeeId || 'N/A',
        employeeName: requestData.employeeName || 'N/A',
        category: requestData.category || 'N/A',
        project: requestData.project || 'N/A',
        notes: requestData.notes || 'No notes provided',
        status: requestData.status || 'Pending'
      };
      
      setSelectedRequest(formattedRequest);
      setViewDialogOpen(true);
    } catch (error) {
      console.error('Error fetching overtime request:', error);
      setError('Failed to load request details. Please try again.');
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/overtime/${id}/status`, null, {
        params: { status: newStatus }
      });
      setSuccess(`Status updated to ${newStatus} successfully!`);
      fetchOvertimeRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status. Please try again.');
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
      await axios.put(`${API_BASE_URL}/overtime/${selectedRequest.id}`, {
        ...selectedRequest,
        status: editFormData.status
      });
      setSuccess('Overtime request updated successfully!');
      fetchOvertimeRequests();
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating overtime request:', error);
      setError('Failed to update overtime request.');
    }
  };

  const filteredRequests = overtimeRequests.filter(req => {
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

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
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
          Overtime Requests
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchOvertimeRequests}
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
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
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
                  {['Employee ID', 'Name', 'Category', 'Start Time', 'End Time', 'Project', 'Status', 'Actions'].map((head, idx) => (
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
                    <TableCell>{request.category}</TableCell>
                    <TableCell>{formatDateTime(request.startTime)}</TableCell>
                    <TableCell>{formatDateTime(request.endTime)}</TableCell>
                    <TableCell>{request.project}</TableCell>
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
                        <Tooltip title="View Details">
                          <IconButton 
                            color="primary" 
                            onClick={() => handleViewRequest(request.id)}
                            aria-label="view details"
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton 
                            color="info" 
                            onClick={() => handleEditRequest(request)}
                            aria-label="edit"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        
                        {request.status.toLowerCase() === 'pending' && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton 
                                color="success" 
                                onClick={() => handleStatusUpdate(request.id, 'Approved')}
                                aria-label="approve"
                              >
                                <Check />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton 
                                color="error" 
                                onClick={() => handleStatusUpdate(request.id, 'Rejected')}
                                aria-label="reject"
                              >
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
                        No overtime requests found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredRequests.length > recordsPerPage && (
            <Box display="flex" justifyContent="center" alignItems="center" mt={3} gap={2}>
              <IconButton 
                onClick={handlePrevPage} 
                disabled={currentPage === 0}
                aria-label="previous page"
              >
                <ChevronLeft />
              </IconButton>
              <Typography variant="body2" fontWeight={500}>
                Page {currentPage + 1} of {totalPages}
              </Typography>
              <IconButton 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages - 1}
                aria-label="next page"
              >
                <ChevronRight />
              </IconButton>
            </Box>
          )}
        </>
      )}

      {/* View Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Overtime Request Details</DialogTitle>
        <DialogContent dividers>
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
                <Typography variant="subtitle1" fontWeight={600}>Category:</Typography>
                <Typography>{selectedRequest.category}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600}>Status:</Typography>
                <Chip
                  label={selectedRequest.status}
                  color={getStatusColor(selectedRequest.status)}
                  sx={{ fontWeight: 600 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600}>Start Time:</Typography>
                <Typography>{formatDateTime(selectedRequest.startTime)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600}>End Time:</Typography>
                <Typography>{formatDateTime(selectedRequest.endTime)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600}>Project:</Typography>
                <Typography>{selectedRequest.project}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600}>Notes:</Typography>
                <TextareaAutosize
                  minRows={3}
                  value={selectedRequest.notes}
                  readOnly
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px',
                    fontFamily: 'inherit',
                    fontSize: '0.875rem'
                  }}
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
          <Button 
            onClick={() => setViewDialogOpen(false)}
            variant="contained"
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Edit Overtime Request Status</DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600}>Employee:</Typography>
                <Typography>{selectedRequest.employeeName} (ID: {selectedRequest.employeeId})</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600}>Category:</Typography>
                <Typography>{selectedRequest.category}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600}>Time Period:</Typography>
                <Typography>
                  {formatDateTime(selectedRequest.startTime)} to {formatDateTime(selectedRequest.endTime)}
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
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
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

export default OvertimeRequest;