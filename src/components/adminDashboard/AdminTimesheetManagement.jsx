import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Grid,
  Chip,
  Box,
  TextField,
  InputAdornment,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress
} from "@mui/material";
import {
  Search,
  MoreVert,
  CheckCircle,
  Cancel,
  Visibility,
  FileDownload,
  Email,
  Notifications as NotificationsIcon,
  Person
} from "@mui/icons-material";
import * as XLSX from 'xlsx';
import { useNavigate } from "react-router-dom";
import { parseISO, format } from 'date-fns';
import TablePagination from '@mui/material/TablePagination';
import axios from 'axios';

const API_BASE_URL = "http://localhost:1010";

const AdminTimesheetManagement = () => {
  const navigate = useNavigate();
  const [timesheets, setTimesheets] = useState([]);
  const [filteredTimesheets, setFilteredTimesheets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [loading, setLoading] = useState(true);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  // Fetch timesheets
  const fetchTimesheets = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/timesheets/non-draft`);
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid data format received from server");
      }
  
      const data = response.data.map(ts => ({
        id: ts.timesheetId || "N/A",
        employeeId: ts.empId || "N/A",
        employeeName: ts.empName || "Unknown Employee",
        employeeEmail: `${ts.empName?.toLowerCase()?.replace(/\s+/g, '')}@company.com` || "unknown@company.com",
        project: ts.projectName || "N/A",
        task: ts.taskName || "N/A",
        startDate: ts.weekStart || new Date().toISOString(),
        endDate: ts.weekEnd || new Date().toISOString(),
        status: ts.status === "SUBMITTED" ? "Pending" : ts.status || "Unknown",
        hours: [
          ts.mondayHours || 0,
          ts.tuesdayHours || 0,
          ts.wednesdayHours || 0,
          ts.thursadyHours || 0,
          ts.fridayHours || 0,
          ts.saturdayHours || 0,
          ts.sundayHours || 0
        ],
        totalHours: (ts.mondayHours || 0) + 
                   (ts.tuesdayHours || 0) + 
                   (ts.wednesdayHours || 0) + 
                   (ts.thursadyHours || 0) + 
                   (ts.fridayHours || 0) + 
                   (ts.saturdayHours || 0) + 
                   (ts.sundayHours || 0),
        submittedAt: ts.submitted_at || null,
        comments: ts.comments || "",
        rejectionReason: ts.status === "REJECTED" ? (ts.rejectionReason || "Rejected by admin") : ""
      }));
  
      setTimesheets(data);
      setFilteredTimesheets(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching timesheets:", error);
      showSnackbar("Failed to load timesheets", "error");
      setLoading(false);
      setTimesheets([]);
      setFilteredTimesheets([]);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setNotificationLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/notifications/admin/unread`);
      setNotifications(response.data);
      const countResponse = await axios.get(`${API_BASE_URL}/api/notifications/admin/unread-count`);
      setUnreadCount(countResponse.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      showSnackbar("Failed to load notifications", "error");
    } finally {
      setNotificationLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/notifications/mark-as-read/${notificationId}`);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/notifications/mark-all-read`);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  // Load data on component mount
  useEffect(() => {
    fetchTimesheets();
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Filter timesheets when search term or status filter changes
  useEffect(() => {
    const filtered = timesheets.filter(ts => {
      // Search term filter
      const matchesSearch = Object.values(ts).some(
        value =>
          value &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase()))
      
      // Status filter
      const matchesStatus = !statusFilter || 
        (statusFilter === "SUBMITTED" && ts.status === "Pending") ||
        ts.status.toUpperCase().includes(statusFilter.toUpperCase());
      
      return matchesSearch && matchesStatus;
    });
    
    setFilteredTimesheets(filtered);
    setPage(0);
  }, [searchTerm, statusFilter, timesheets]);

  // Action menu handlers
  const handleMenuOpen = (event, timesheet) => {
    setAnchorEl(event.currentTarget);
    setSelectedTimesheet(timesheet);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDialogOpen = (type) => {
    if (!selectedTimesheet) {
      showSnackbar("No timesheet selected", "error");
      return;
    }
    setDialogType(type);
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setRejectionReason("");
  };

  // Timesheet actions
  const approveTimesheet = async (timesheetId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/timesheets/${timesheetId}/status`, null, {
        params: { status: "APPROVED" }
      });
      return response.data;
    } catch (error) {
      console.error("Error approving timesheet:", error);
      throw error;
    }
  };

  const rejectTimesheet = async (timesheetId, reason) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/timesheets/${timesheetId}/status`, null, {
        params: { 
          status: "REJECTED",
          rejectionReason: reason 
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error rejecting timesheet:", error);
      throw error;
    }
  };

  const sendNotification = async (email, subject, message) => {
    console.log(`Sending email to ${email} with subject: ${subject}`);
    console.log(`Message: ${message}`);
    return { success: true };
  };

  // Action handlers
  const handleApproval = async () => {
    if (!selectedTimesheet?.id) {
      showSnackbar("No valid timesheet selected for approval", "error");
      handleDialogClose();
      return;
    }

    try {
      const result = await approveTimesheet(selectedTimesheet.id);
      
      setTimesheets(prev =>
        prev.map(ts =>
          ts.id === selectedTimesheet.id
            ? {
                ...ts,
                status: "APPROVED",
                updatedAt: new Date().toISOString()
              }
            : ts
        )
      );
      
      await sendNotification(
        selectedTimesheet.employeeEmail,
        "Timesheet Approved",
        `Your timesheet for ${format(parseISO(selectedTimesheet.startDate), "MMM dd")} to ${format(parseISO(selectedTimesheet.endDate), "MMM dd, yyyy")} has been approved.`
      );
      
      showSnackbar(result || "Timesheet approved successfully", "success");
    } catch (error) {
      console.error("Error approving timesheet:", error);
      showSnackbar(error.response?.data || "Failed to approve timesheet", "error");
    }
    
    handleDialogClose();
  };

  const handleRejection = async () => {
    if (!selectedTimesheet?.id) {
      showSnackbar("No valid timesheet selected for rejection", "error");
      handleDialogClose();
      return;
    }

    if (!rejectionReason) {
      showSnackbar("Please provide a rejection reason", "warning");
      return;
    }

    try {
      const result = await rejectTimesheet(selectedTimesheet.id, rejectionReason);
      
      setTimesheets(prev =>
        prev.map(ts =>
          ts.id === selectedTimesheet.id
            ? {
                ...ts,
                status: "REJECTED",
                updatedAt: new Date().toISOString(),
                rejectionReason: rejectionReason
              }
            : ts
        )
      );
      
      await sendNotification(
        selectedTimesheet.employeeEmail,
        "Timesheet Rejected",
        `Your timesheet for ${format(parseISO(selectedTimesheet.startDate), "MMM dd")} to ${format(parseISO(selectedTimesheet.endDate), "MMM dd, yyyy")} has been rejected. Reason: ${rejectionReason}`
      );
      
      showSnackbar(result || "Timesheet rejected", "warning");
    } catch (error) {
      console.error("Error rejecting timesheet:", error);
      showSnackbar(error.response?.data || "Failed to reject timesheet", "error");
    }
    
    handleDialogClose();
  };

  const handleViewDetails = () => {
    navigate(`/admin/timesheets/${selectedTimesheet.id}`, {
        state: { 
            timesheet: {
                ...selectedTimesheet,
                timesheetId: selectedTimesheet.id,
                empId: selectedTimesheet.employeeId,
                empName: selectedTimesheet.employeeName,
                projectName: selectedTimesheet.project,
                taskName: selectedTimesheet.task,
                weekStart: selectedTimesheet.startDate,
                weekEnd: selectedTimesheet.endDate,
                status: selectedTimesheet.status,
                mondayHours: selectedTimesheet.hours[0],
                tuesdayHours: selectedTimesheet.hours[1],
                wednesdayHours: selectedTimesheet.hours[2],
                thursadyHours: selectedTimesheet.hours[3],
                fridayHours: selectedTimesheet.hours[4],
                saturdayHours: selectedTimesheet.hours[5],
                sundayHours: selectedTimesheet.hours[6],
                submitted_at: selectedTimesheet.submittedAt,
                comments: selectedTimesheet.comments
            }
        }
    });
    handleMenuClose();
  };

  const handleSendReminder = async () => {
    if (!selectedTimesheet?.id) {
      showSnackbar("No timesheet selected to send reminder", "error");
      handleMenuClose();
      return;
    }

    try {
      await sendNotification(
        selectedTimesheet.employeeEmail,
        "Timesheet Reminder",
        `This is a reminder to submit your timesheet for ${format(parseISO(selectedTimesheet.startDate), "MMM dd")} to ${format(parseISO(selectedTimesheet.endDate), "MMM dd, yyyy")}. Please submit it as soon as possible.`
      );
      
      showSnackbar(`Reminder sent to ${selectedTimesheet.employeeName}`, "info");
    } catch (error) {
      console.error("Error sending reminder:", error);
      showSnackbar("Failed to send reminder", "error");
    }
    
    handleMenuClose();
  };

  // Helper functions
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleExportToExcel = () => {
    try {
      const exportData = timesheets.map(ts => ({
        "Timesheet ID": ts.id,
        "Employee ID": ts.employeeId,
        "Employee Name": ts.employeeName,
        "Project": ts.project,
        "Task": ts.task,
        "Start Date": ts.startDate,
        "End Date": ts.endDate,
        "Status": ts.status,
        "Total Hours": ts.totalHours,
        "Submitted At": ts.submittedAt ? format(parseISO(ts.submittedAt), "PPpp") : "N/A",
        "Approved/Rejected At": ts.updatedAt ? format(parseISO(ts.updatedAt), "PPpp") : "N/A",
        "Comments": ts.comments || "N/A"
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Timesheets");
      XLSX.writeFile(wb, `Timesheets_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
      
      showSnackbar("Export successful", "success");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      showSnackbar("Failed to export", "error");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "Approved":
      case "APPROVED":
        return <Chip label="Approved" color="success" size="small" />;
      case "Rejected":
      case "REJECTED":
        return <Chip label="Rejected" color="error" size="small" />;
      case "Pending":
      case "SUBMITTED":
        return <Chip label="Pending" color="warning" size="small" />;
      case "Draft":
      case "DRAFT":
        return <Chip label="Draft" color="info" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  if (loading) {
    return <Typography>Loading timesheets...</Typography>;
  }

  return (
    <Paper elevation={0} sx={{ p: 3, width: "100%", maxWidth: 1600, mx: "auto" }}>
      {/* Header Section */}
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Grid item>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Timesheet Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review and approve employee timesheets
          </Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            startIcon={<FileDownload />}
            onClick={handleExportToExcel}
            sx={{ mr: 2 }}
          >
            Export to Excel
          </Button>
          <IconButton 
            color="inherit" 
            onClick={handleNotificationClick}
            sx={{ mr: 2 }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Button
            variant="outlined"
            startIcon={<Email />}
            onClick={() => navigate("/admin/timesheets/notifications")}
          >
            Notification Settings
          </Button>
        </Grid>
      </Grid>

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          style: {
            maxHeight: '400px',
            width: '400px',
          },
        }}
      >
        <MenuItem 
          onClick={() => {
            markAllAsRead();
            handleNotificationClose();
          }}
          disabled={notifications.length === 0}
        >
          Mark all as read
        </MenuItem>
        <Divider />
        {notificationLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length > 0 ? (
          <List sx={{ width: '100%', maxWidth: 360 }}>
            {notifications.map((notification) => (
              <ListItem 
                key={notification.id}
                alignItems="flex-start"
                onClick={() => {
                  markAsRead(notification.id);
                  if (notification.timesheetId) {
                    navigate(`/admin/timesheets/${notification.timesheetId}`);
                  }
                  handleNotificationClose();
                }}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar>
                    <Person />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={notification.message}
                  secondary={format(new Date(notification.createdAt), "MMM dd, h:mm a")}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <MenuItem disabled>
            No new notifications
          </MenuItem>
        )}
      </Menu>

      {/* Search and Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder="Search timesheets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="DRAFT">Draft</MenuItem>
            <MenuItem value="SUBMITTED">Pending</MenuItem>
            <MenuItem value="APPROVED">Approved</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Timesheets Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow>
              <TableCell>Timesheet ID</TableCell>
              <TableCell>Employee</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Task</TableCell>
              <TableCell>Week</TableCell>
              <TableCell align="right">Total Hours</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Submitted At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTimesheets.length > 0 ? (
              filteredTimesheets
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((timesheet) => (
                  <TableRow key={timesheet.id} hover>
                    <TableCell>{timesheet.id}</TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">{timesheet.employeeName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {timesheet.employeeId}
                      </Typography>
                    </TableCell>
                    <TableCell>{timesheet.project}</TableCell>
                    <TableCell>{timesheet.task}</TableCell>
                    <TableCell>
                      {format(parseISO(timesheet.startDate), "MMM dd")} -{" "}
                      {format(parseISO(timesheet.endDate), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell align="right">{timesheet.totalHours}</TableCell>
                    <TableCell>{getStatusChip(timesheet.status)}</TableCell>
                    <TableCell>
                      {timesheet.submittedAt 
                        ? format(parseISO(timesheet.submittedAt), "MMM dd, h:mm a") 
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, timesheet)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No timesheets found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredTimesheets.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleViewDetails}>
          <Visibility fontSize="small" sx={{ mr: 1 }} /> View Details
        </MenuItem>
        {selectedTimesheet?.status === "Pending" && (
          <>
            <MenuItem onClick={() => handleDialogOpen("approve")}>
              <CheckCircle fontSize="small" sx={{ mr: 1 }} /> Approve
            </MenuItem>
            <MenuItem onClick={() => handleDialogOpen("reject")}>
              <Cancel fontSize="small" sx={{ mr: 1 }} /> Reject
            </MenuItem>
            <MenuItem onClick={handleSendReminder}>
              <NotificationsIcon fontSize="small" sx={{ mr: 1 }} /> Send Reminder
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Approval Dialog */}
      <Dialog open={openDialog && dialogType === "approve"} onClose={handleDialogClose}>
        <DialogTitle>Approve Timesheet</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedTimesheet ? (
              <>
                Are you sure you want to approve this timesheet submitted by{" "}
                <strong>{selectedTimesheet.employeeName}</strong> for the week of{" "}
                {format(parseISO(selectedTimesheet.startDate), "MMM dd")}?
              </>
            ) : (
              "No timesheet selected"
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleApproval} 
            color="success" 
            variant="contained"
            disabled={!selectedTimesheet}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={openDialog && dialogType === "reject"} onClose={handleDialogClose}>
        <DialogTitle>Reject Timesheet</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedTimesheet ? (
              <>
                Are you sure you want to reject this timesheet submitted by{" "}
                <strong>{selectedTimesheet.employeeName}</strong>?
              </>
            ) : (
              "No timesheet selected"
            )}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for rejection"
            type="text"
            fullWidth
            variant="standard"
            multiline
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleRejection} 
            color="error" 
            variant="contained"
            disabled={!selectedTimesheet || !rejectionReason}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AdminTimesheetManagement;