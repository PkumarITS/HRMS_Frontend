import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import UserService from "../service/UserService";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Grid,
  Alert,
  Snackbar,
  IconButton,
  Chip,
  FormHelperText,
  CircularProgress,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

const Leave = () => {
  const [leaveData, setLeaveData] = useState({
    employeeId: "",
    employeeName: "",
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const [leaveHistory, setLeaveHistory] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const recordsPerPage = 5;
  const [profileData, setProfileData] = useState(null);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(false);

  // Configure axios instance
  const api = axios.create({
    baseURL: "http://localhost:1010",
  });

  // Add auth token to requests
  api.interceptors.request.use((config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await UserService.getCompleteProfile(token);
        
        if (response.employeeData) {
          setProfileData(response.employeeData);
        } else {
          throw new Error("No employee data found in response");
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setSnackbar({
          open: true,
          message: error.message || "Failed to load profile data",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);  

  // Fetch leave types from backend
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      setLoadingLeaveTypes(true);
      try {
        const response = await api.get("/leave-types");
     //   const response =  await axios.get(`${baseURL}/admin/leave-types`);
        setLeaveTypes(response.data);
      } catch (error) {
        console.error("Error fetching leave types:", error);
        setSnackbar({
          open: true,
          message: "Failed to load leave types. Using default options.",
          severity: "warning",
        });
        // Fallback to default leave types if API fails
        setLeaveTypes([
          { name: "Casual" },
          { name: "Sick" },
          { name: "Paid" },
          { name: "Maternity" },
          { name: "Paternity" }
        ]);
      } finally {
        setLoadingLeaveTypes(false);
      }
    };

    fetchLeaveTypes();
  }, []);

  // Fetch employee data on component mount
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setEmployeeData(response.data);
        setLeaveData(prev => ({
          ...prev,
          employeeId: response.data.employeeId,
          employeeName: response.data.name
        }));
      } catch (error) {
        console.error("Error fetching employee data:", error);
      }
    };

    fetchEmployeeData();
    fetchLeaveHistory();
  }, []);  

  const handleChange = (e) => {
    setLeaveData({ ...leaveData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validate dates
    const today = new Date().toISOString().split('T')[0];
    if (leaveData.fromDate < today) {
      setSnackbar({
        open: true,
        message: "From date cannot be in the past",
        severity: "error",
      });
      setSubmitting(false);
      return;
    }

    if (new Date(leaveData.toDate) < new Date(leaveData.fromDate)) {
      setSnackbar({
        open: true,
        message: "'To Date' cannot be earlier than 'From Date'",
        severity: "error",
      });
      setSubmitting(false);
      return;
    }

    try {
      await api.post("/user/leaves/add", {
        employeeId: profileData?.personal?.empId,
        employeeName: profileData?.personal?.firstName,
        leaveType: leaveData.leaveType,
        fromDate: leaveData.fromDate,
        toDate: leaveData.toDate,
        reason: leaveData.reason,
        status: "Pending"
      });

      setSnackbar({
        open: true,
        message: "Leave request submitted successfully!",
        severity: "success",
      });

      // Reset form (keep employee details)
      setLeaveData(prev => ({
        ...prev,
        leaveType: "",
        fromDate: "",
        toDate: "",
        reason: "",
      }));

      fetchLeaveHistory();
    } catch (error) {
      console.error("Error submitting leave:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 
                "Failed to submit leave request. Please try again.",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const fetchLeaveHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get("/user/leaves");
      const sortedData = response.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setLeaveHistory(sortedData);
    } catch (error) {
      console.error("Error fetching leave history:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 
                "Failed to load leave history. Please refresh the page.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLeaves = leaveHistory.filter((leave) => {
    if (filterStatus === "All") return true;
    return leave.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const totalPages = Math.ceil(filteredLeaves.length / recordsPerPage);
  const paginatedLeaves = filteredLeaves.slice(
    currentPage * recordsPerPage,
    (currentPage + 1) * recordsPerPage
  );

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const statusColor = {
    Approved: "success",
    Rejected: "error",
    Pending: "warning",
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Leave Management
      </Typography>

      <Paper elevation={4} sx={{ p: 4, mb: 5, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          New Leave Request
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="employeeId"
                value={profileData?.personal?.empId}
                readonly
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="employeeName"
                value={profileData?.personal?.firstName}
                readonly
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Leave Type</InputLabel>
                <Select
                  name="leaveType"
                  value={leaveData.leaveType}
                  onChange={handleChange}
                  label="Leave Type"
                  disabled={loadingLeaveTypes}
                >
                  <MenuItem value=""><em>Select</em></MenuItem>
                  {leaveTypes.map((type) => (
                    <MenuItem key={type.description} value={type.description}>
                      {type.description}
                    </MenuItem>
                  ))}
                </Select>
                {loadingLeaveTypes && (
                  <FormHelperText>
                    <CircularProgress size={14} sx={{ mr: 1 }} />
                    Loading leave types...
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                name="fromDate"
                label="From Date"
                value={leaveData.fromDate}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{ 
                  min: new Date().toISOString().split('T')[0] 
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                name="toDate"
                label="To Date"
                value={leaveData.toDate}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{ 
                  min: leaveData.fromDate || new Date().toISOString().split('T')[0] 
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                name="reason"
                label="Reason"
                value={leaveData.reason}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                placeholder="Please provide details for your leave request"
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
            <Button 
              type="submit" 
              variant="contained" 
              size="large" 
              sx={{ px: 4, py: 1.5 }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Submitting...
                </>
              ) : "Submit Request"}
            </Button>
          </Box>
        </form>
      </Paper>

      <Divider sx={{ mb: 5 }} />

      <Box>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
          Leave History
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(0);
              }}
              label="Filter by Status"
            >
              {["All", "Pending", "Approved", "Rejected"].map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button 
            variant="outlined" 
            onClick={fetchLeaveHistory}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh Data"}
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : paginatedLeaves.length > 0 ? (
          <>
            <Paper elevation={3} sx={{ overflowX: "auto", mb: 2, borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ backgroundColor: "primary.main" }}>
                  <TableRow>
                    {[
                      "Request ID",
                      "Leave Type",
                      "Period",
                      "Days",
                      "Reason",
                      "Status",
                      "Submitted On",
                      "Actions"
                    ].map((head) => (
                      <TableCell 
                        key={head} 
                        sx={{ color: "white", fontWeight: 600 }}
                      >
                        {head}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedLeaves.map((leave) => {
                    const fromDate = new Date(leave.fromDate);
                    const toDate = new Date(leave.toDate);
                    const days = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
                    
                    return (
                      <TableRow key={leave.id} hover>
                        <TableCell>#{leave.id}</TableCell>
                        <TableCell>{leave.leaveType}</TableCell>
                        <TableCell>
                          {formatDisplayDate(leave.fromDate)} - {formatDisplayDate(leave.toDate)}
                        </TableCell>
                        <TableCell>{days} day{days !== 1 ? 's' : ''}</TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>
                          <Box sx={{ 
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {leave.reason}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={leave.status}
                            color={statusColor[leave.status]}
                            sx={{ fontWeight: 600, minWidth: 100 }}
                          />
                        </TableCell>
                        <TableCell>{formatDisplayDate(leave.createdAt)}</TableCell>
                        <TableCell>
                          <Button 
                            size="small" 
                            color="info"
                            onClick={() => {
                              // Add view/edit functionality here
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Paper>

            <Box sx={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              gap: 2,
              mt: 3
            }}>
              <IconButton 
                onClick={handlePrevPage} 
                disabled={currentPage === 0}
                sx={{ 
                  backgroundColor: currentPage === 0 ? 'action.disabledBackground' : 'primary.main',
                  color: currentPage === 0 ? 'text.disabled' : 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: currentPage === 0 ? null : 'primary.dark'
                  }
                }}
              >
                <ChevronLeft />
              </IconButton>
              
              <Typography variant="body1">
                Page {currentPage + 1} of {totalPages}
              </Typography>
              
              <IconButton 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages - 1}
                sx={{ 
                  backgroundColor: currentPage === totalPages - 1 ? 'action.disabledBackground' : 'primary.main',
                  color: currentPage === totalPages - 1 ? 'text.disabled' : 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: currentPage === totalPages - 1 ? null : 'primary.dark'
                  }
                }}
              >
                <ChevronRight />
              </IconButton>
            </Box>
          </>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>
            No leave records found matching your criteria.
          </Alert>
        )}
      </Box>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Leave;