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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Tooltip
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { format, parseISO, differenceInDays } from 'date-fns';

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
  const [profileData, setProfileData] = useState(null);
  const recordsPerPage = 5;
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [today, setToday] = useState(new Date());

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

  useEffect(() => {
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = Cookies.get("token");
        const response = await UserService.getCompleteProfile(token);
        setProfileData(response.employeeData);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setSnackbar({
          open: true,
          message: error.message || "Failed to load profile data",
          severity: "error",
        });
      }
    };
    
    fetchProfile();
    fetchLeaveTypes();
    fetchLeaveHistory();
  }, []);

  const fetchLeaveTypes = async () => {
    setLoadingLeaveTypes(true);
    try {
      const response = await api.get("/my-leave-types");
      setLeaveTypes(response.data);
    } catch (error) {
      console.error("Error fetching leave types:", error);
      setSnackbar({
        open: true,
        message: "Failed to load leave types",
        severity: "error",
      });
    } finally {
      setLoadingLeaveTypes(false);
    }
  };

  const isLeaveTypeValid = (type) => {
    if (!type) return false;
    const endDate = type.endDate ? new Date(type.endDate) : null;
    return (
      type.remainingDays > 0 &&
      (!endDate || endDate >= today)
    );
  };

  const getExpirationStatus = (type) => {
    if (!type.endDate) return null;
    const endDate = new Date(type.endDate);
    const daysRemaining = differenceInDays(endDate, today);
    if (daysRemaining < 0) return "expired";
    if (daysRemaining === 0) return "expires-today";
    if (daysRemaining <= 3) return "expires-soon";
    return "active";
  };

  const renderExpirationChip = (type) => {
    const status = getExpirationStatus(type);
    if (!status) return null;
    
    const endDate = new Date(type.endDate);
    const daysRemaining = differenceInDays(endDate, today);
    
    const chipProps = {
      size: "small",
      sx: { ml: 1 }
    };

    switch (status) {
      case "expired":
        return (
          <Tooltip title={`Expired on ${format(endDate, 'PP')}`}>
            <Chip label="Expired" color="error" {...chipProps} />
          </Tooltip>
        );
      case "expires-today":
        return (
          <Tooltip title="Expires today">
            <Chip label="Today" color="warning" {...chipProps} />
          </Tooltip>
        );
      case "expires-soon":
        return (
          <Tooltip title={`Expires in ${daysRemaining} days`}>
            <Chip label={`${daysRemaining}d`} color="warning" {...chipProps} />
          </Tooltip>
        );
      default:
        return (
          <Tooltip title={`Expires on ${format(endDate, 'MMM d')}`}>
            <Chip 
              label={format(endDate, 'MMM d')} 
              color="default" 
              variant="outlined" 
              {...chipProps} 
            />
          </Tooltip>
        );
    }
  };

  const handleChange = (e) => {
    setLeaveData({ ...leaveData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validate dates
    const todayStr = new Date().toISOString().split('T')[0];
    if (leaveData.fromDate < todayStr) {
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

    const selectedType = leaveTypes.find(type => type.name === leaveData.leaveType);
    if (!selectedType || !isLeaveTypeValid(selectedType)) {
      setSnackbar({
        open: true,
        message: "Selected leave type is no longer available",
        severity: "error",
      });
      setSubmitting(false);
      return;
    }

    const requestedDays = calculateDays(leaveData.fromDate, leaveData.toDate);
    if (requestedDays > selectedType.remainingDays) {
      setSnackbar({
        open: true,
        message: `Request exceeds available days (${selectedType.remainingDays} remaining)`,
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
        leaveTypeId: selectedType.id,
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

      setLeaveData(prev => ({
        ...prev,
        leaveType: "",
        fromDate: "",
        toDate: "",
        reason: "",
      }));

      await Promise.all([fetchLeaveHistory(), fetchLeaveTypes()]);
    } catch (error) {
      console.error("Error submitting leave:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 
               "Failed to submit leave request",
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
        message: "Failed to load leave history",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewLeave = (leave) => {
    setSelectedLeave(leave);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedLeave(null);
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

  const handlePrevPage = () => currentPage > 0 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => 
    currentPage < totalPages - 1 && setCurrentPage(currentPage + 1);

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
    return format(parseISO(dateString), 'MMM d, yyyy');
  };

  const calculateDays = (fromDate, toDate) => {
    return differenceInDays(new Date(toDate), new Date(fromDate)) + 1;
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
                label="Employee ID"
                value={profileData?.personal?.empId || ""}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Employee Name"
                value={profileData?.personal?.firstName || ""}
                InputProps={{ readOnly: true }}
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
                  {leaveTypes.filter(isLeaveTypeValid).map((type) => (
                    <MenuItem key={type.id} value={type.name}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Box sx={{ flexGrow: 1 }}>
                          {type.name} ({type.remainingDays} Remaining days)
                        </Box>
                        {renderExpirationChip(type)}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {loadingLeaveTypes && (
                  <FormHelperText>
                    <CircularProgress size={14} sx={{ mr: 1 }} />
                    Loading leave types...
                  </FormHelperText>
                )}
                {leaveTypes.filter(isLeaveTypeValid).length === 0 && (
                  <FormHelperText error>
                    No available leave types
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
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
            <Button 
              type="submit" 
              variant="contained" 
              size="large"
              disabled={submitting || leaveTypes.filter(isLeaveTypeValid).length === 0}
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
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : paginatedLeaves.length > 0 ? (
          <>
            <Paper elevation={3} sx={{ mb: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: 'primary.main' }}>
                  <TableRow>
                    {["Request ID", "Leave Type", "Period", "Days", "Status", "Submitted On", "Actions"].map((head) => (
                      <TableCell key={head} sx={{ color: 'white', fontWeight: 600 }}>
                        {head}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedLeaves.map((leave) => (
                    <TableRow key={leave.id} hover>
                      <TableCell>#{leave.id}</TableCell>
                      <TableCell>{leave.leaveType}</TableCell>
                      <TableCell>
                        {formatDisplayDate(leave.fromDate)} - {formatDisplayDate(leave.toDate)}
                      </TableCell>
                      <TableCell>{calculateDays(leave.fromDate, leave.toDate)}</TableCell>
                      <TableCell>
                        <Chip
                          label={leave.status}
                          color={statusColor[leave.status]}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>{formatDisplayDate(leave.createdAt)}</TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          onClick={() => handleViewLeave(leave)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
              <IconButton 
                onClick={handlePrevPage} 
                disabled={currentPage === 0}
                sx={{ 
                  bgcolor: currentPage === 0 ? 'action.disabledBackground' : 'primary.main',
                  color: currentPage === 0 ? 'text.disabled' : 'primary.contrastText',
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
                  bgcolor: currentPage === totalPages - 1 ? 'action.disabledBackground' : 'primary.main',
                  color: currentPage === totalPages - 1 ? 'text.disabled' : 'primary.contrastText',
                }}
              >
                <ChevronRight />
              </IconButton>
            </Box>
          </>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>
            No leave records found
          </Alert>
        )}
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Leave Details</DialogTitle>
        <DialogContent>
          {selectedLeave && (
            <List>
              <ListItem>
                <ListItemText primary="Request ID" secondary={`#${selectedLeave.id}`} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Employee" secondary={selectedLeave.employeeName} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Leave Type" secondary={selectedLeave.leaveType} />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Period" 
                  secondary={`${formatDisplayDate(selectedLeave.fromDate)} to ${formatDisplayDate(selectedLeave.toDate)}`} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Duration" 
                  secondary={`${calculateDays(selectedLeave.fromDate, selectedLeave.toDate)} days`} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Status" 
                  secondary={
                    <Chip 
                      label={selectedLeave.status} 
                      color={statusColor[selectedLeave.status]} 
                      sx={{ fontWeight: 600 }}
                    />
                  } 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Submitted On" 
                  secondary={formatDisplayDate(selectedLeave.createdAt)} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Reason" 
                  secondary={selectedLeave.reason} 
                  sx={{ whiteSpace: 'pre-wrap' }}
                />
              </ListItem>
              {selectedLeave.managerComment && (
                <ListItem>
                  <ListItemText 
                    primary="Manager's Comment" 
                    secondary={selectedLeave.managerComment} 
                  />
                </ListItem>
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Leave;