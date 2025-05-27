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
  Badge,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  TablePagination,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from "@mui/material";
import {
  MoreVert,
  ArrowBackIos,
  ArrowForwardIos,
  Notifications,
  InsertDriveFile,
  Search,
  Add,
  Edit,
  Delete,
  Send,
  CheckCircle,
  Pending,
  Drafts,
  Visibility,
  FilterList,
} from "@mui/icons-material";
import { format, startOfWeek, addDays, parseISO, isWeekend } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import API_BASE_URL from "../config/apiConfig";

const TimesheetDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [entries, setEntries] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({
    status: "All Statuses",
    project: "All Projects",
    startDate: null,
    endDate: new Date(),
  });

  const daysOfWeek = Array.from({ length: 7 }).map((_, index) => {
    const dayDate = addDays(weekStart, index);
    return {
      label: format(dayDate, "EEE dd"),
      date: dayDate,
      dayName: format(dayDate, "EEE"),
      isWeekend: isWeekend(dayDate),
    };
  });

  const fetchTimesheetEntries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/timesheet/employee/current-week`);

      if (response.data && Array.isArray(response.data)) {
        const formattedEntries = response.data.map((entry) => ({
          ...entry,
          hours: [
            entry.mondayHours || 0,
            entry.tuesdayHours || 0,
            entry.wednesdayHours || 0,
            entry.thursadyHours || 0,
            entry.fridayHours || 0,
            entry.saturdayHours || 0,
            entry.sundayHours || 0,
          ],
          weekStart: entry.createdAt,
          weekEnd: format(addDays(parseISO(entry.createdAt), 6), "yyyy-MM-dd"),
          createdAtFormatted: format(parseISO(entry.createdAt), "dd MMM yyyy, h:mm a"),
        }));
        setEntries(formattedEntries);
      } else {
        console.error("Unexpected API response format:", response.data);
        setSnackbar({
          open: true,
          message: "Unexpected data format received from server",
          severity: "error",
        });
        setEntries([]);
      }
    } catch (error) {
      console.error("Error fetching timesheet entries:", error);
      setSnackbar({
        open: true,
        message: "Failed to load timesheet entries",
        severity: "error",
      });
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/by-emp`);
      if (response.data && Array.isArray(response.data)) {
        setProjects(response.data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    fetchTimesheetEntries();
    fetchProjects();
  }, [location.state, refreshTrigger]);

  const handleWeekNavigation = (direction) => {
    setWeekStart(addDays(weekStart, direction * 7));
    setRefreshTrigger(prev => prev + 1);
  };

  const handleMenuOpen = (event, entry) => {
    setAnchorEl(event.currentTarget);
    setSelectedEntry(entry);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEntry(null);
  };

  const handleView = () => {
    if (!selectedEntry) return;

    navigate("/user/employee-dashboard/timesheet-view", {
      state: {
        entry: {
          ...selectedEntry,
          mondayHours: selectedEntry.hours[0],
          tuesdayHours: selectedEntry.hours[1],
          wednesdayHours: selectedEntry.hours[2],
          thursadyHours: selectedEntry.hours[3],
          fridayHours: selectedEntry.hours[4],
          saturdayHours: selectedEntry.hours[5],
          sundayHours: selectedEntry.hours[6],
        },
      },
    });
    handleMenuClose();
  };

  const handleEdit = () => {
    if (!selectedEntry) return;

    navigate("/user/employee-dashboard/timesheet", {
      state: {
        existingEntry: {
          ...selectedEntry,
          mondayHours: selectedEntry.hours[0],
          tuesdayHours: selectedEntry.hours[1],
          wednesdayHours: selectedEntry.hours[2],
          thursadyHours: selectedEntry.hours[3],
          fridayHours: selectedEntry.hours[4],
          saturdayHours: selectedEntry.hours[5],
          sundayHours: selectedEntry.hours[6],
          timesheetId: selectedEntry.timesheetId || selectedEntry.id,
        },
        isEditMode: true,
        weekRange: `${format(parseISO(selectedEntry.weekStart), "dd MMM")} - ${format(
          parseISO(selectedEntry.weekEnd),
          "dd MMM yyyy"
        )}`,
      },
    });
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/timesheet/${selectedEntry.id}`);
      setRefreshTrigger(prev => prev + 1);
      setSnackbar({
        open: true,
        message: "Timesheet entry deleted successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting timesheet entry:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete timesheet entry",
        severity: "error",
      });
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  const handleSubmitEntry = async () => {
    if (!selectedEntry) return;

    try {
      setLoading(true);
      const response = await axios.put(
        `${API_BASE_URL}/timesheet/${selectedEntry.id}/submit`
      );

      setRefreshTrigger(prev => prev + 1);
      setSnackbar({
        open: true,
        message: "Timesheet submitted successfully",
        severity: "success",
      });

      setEntries(prevEntries =>
        prevEntries.map(entry =>
          entry.id === selectedEntry.id
            ? { ...entry, status: "SUBMITTED" }
            : entry
        )
      );
    } catch (error) {
      console.error("Error submitting timesheet:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to submit timesheet",
        severity: "error",
      });
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  const handleSubmitAll = async () => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${API_BASE_URL}/timesheet/submit-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      setRefreshTrigger(prev => prev + 1);
      setSnackbar({
        open: true,
        message: response.data.message || "All draft timesheets submitted successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error submitting all timesheets:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to submit all timesheets",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTimesheetEntry = () => {
    navigate("/user/employee-dashboard/timesheet", {
      state: {
        weekRange: `${format(weekStart, "dd MMM")} - ${format(
          addDays(weekStart, 6),
          "dd MMM yyyy"
        )}`,
      },
    });
  };

  const handleStatusFilter = (status) => {
    if (statusFilter === status) {
      setStatusFilter(null);
    } else {
      setStatusFilter(status);
    }
    setPage(0);
  };

  const handleFilterModalOpen = () => {
    setFilterModalOpen(true);
  };

  const handleFilterModalClose = () => {
    setFilterModalOpen(false);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyFilters = () => {
    setStatusFilter(filters.status === "All Statuses" ? null : filters.status);
    setFilterModalOpen(false);
  };

  const resetFilters = () => {
    setFilters({
      status: "All Statuses",
      project: "All Projects",
      startDate: null,
      endDate: new Date(),
    });
    setStatusFilter(null);
    setFilterModalOpen(false);
  };

  const filteredEntries = entries.filter(
    (entry) =>
      (entry.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.timeCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.resourcePlan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.status.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter ? entry.status === statusFilter : true) &&
      (filters.project !== "All Projects" ? entry.projectName === filters.project : true) &&
      (filters.startDate && filters.endDate ? 
        new Date(entry.weekStart) >= new Date(filters.startDate) && 
        new Date(entry.weekStart) <= new Date(filters.endDate) : true)
  );

  const totalHours = entries.reduce((total, entry) => {
    return total + entry.hours.reduce((sum, hour) => sum + hour, 0);
  }, 0);

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "SUBMITTED":
        return <CheckCircle color="success" fontSize="small" />;
      case "DRAFT":
        return <Drafts color="info" fontSize="small" />;
      case "PENDING":
        return <Pending color="warning" fontSize="small" />;
      case "APPROVED":
        return <CheckCircle color="success" fontSize="small" />;
      case "REJECTED":
        return <Pending color="error" fontSize="small" />;
      default:
        return <Drafts color="action" fontSize="small" />;
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/notifications/unread`);
      setNotifications(response.data);
      setUnreadCount(response.data.length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={0} sx={{ p: 3, width: "100%", maxWidth: 1400, mx: "auto" }}>
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Grid item>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              My Time Sheet
            </Typography>
          </Grid>

          <Grid item>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton
                  onClick={() => handleWeekNavigation(-1)}
                  size="small"
                  disabled={loading}
                >
                  <ArrowBackIos fontSize="small" />
                </IconButton>
                <Typography variant="subtitle1" sx={{ mx: 1 }}>
                  {format(weekStart, "dd")} - {format(
                    addDays(weekStart, 6),
                    "dd MMMM yyyy"
                  )}
                </Typography>
                <IconButton
                  onClick={() => handleWeekNavigation(1)}
                  size="small"
                  disabled={loading}
                >
                  <ArrowForwardIos fontSize="small" />
                </IconButton>
              </Box>

              <Chip
                label={`${entries.filter((e) => e.status === "SUBMITTED").length
                  } Submitted`}
                color="success"
                size="small"
                variant={statusFilter === "SUBMITTED" ? "filled" : "outlined"}
                onClick={() => handleStatusFilter("SUBMITTED")}
                clickable
              />
              <Chip
                label={`${entries.filter((e) => e.status === "DRAFT").length} Draft`}
                color="info"
                size="small"
                variant={statusFilter === "DRAFT" ? "filled" : "outlined"}
                onClick={() => handleStatusFilter("DRAFT")}
                clickable
              />
              <Chip
                label={`${entries.filter((e) => e.status === "APPROVED").length} Approved`}
                color="success"
                size="small"
                variant={statusFilter === "APPROVED" ? "filled" : "outlined"}
                onClick={() => handleStatusFilter("APPROVED")}
                clickable
              />
              <Chip
                label={`${entries.filter((e) => e.status === "REJECTED").length} Rejected`}
                color="error"
                size="small"
                variant={statusFilter === "REJECTED" ? "filled" : "outlined"}
                onClick={() => handleStatusFilter("REJECTED")}
                clickable
              />

              <IconButton
                onClick={handleNotificationClick}
                disabled={loading}
                sx={{ mr: 1 }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <Notifications />
                </Badge>
              </IconButton>

              <Tooltip title="Export to Excel">
                <IconButton disabled={loading}>
                  <InsertDriveFile />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>

        {/* Filter Modal */}
        <Dialog open={filterModalOpen} onClose={handleFilterModalClose} maxWidth="sm" fullWidth>
          <DialogTitle>Filter Timesheets</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="All Statuses">All Statuses</MenuItem>
                  <MenuItem value="DRAFT">Draft</MenuItem>
                  <MenuItem value="SUBMITTED">Submitted</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Project</InputLabel>
                <Select
                  value={filters.project}
                  label="Project"
                  onChange={(e) => handleFilterChange('project', e.target.value)}
                >
                  <MenuItem value="All Projects">All Projects</MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.name}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(newValue) => handleFilterChange('startDate', newValue)}
                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                maxDate={filters.endDate}
              />

              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(newValue) => handleFilterChange('endDate', newValue)}
                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                minDate={filters.startDate}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={resetFilters} color="error">
              Reset
            </Button>
            <Button onClick={applyFilters} variant="contained" color="primary">
              Apply Filters
            </Button>
          </DialogActions>
        </Dialog>

        <Menu
          anchorEl={notificationAnchorEl}
          open={Boolean(notificationAnchorEl)}
          onClose={handleNotificationClose}
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
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => {
                  markAsRead(notification.id);
                  if (notification.timesheetId) {
                    navigate(`/user/employee-dashboard/timesheet-view`, {
                      state: { entry: { timesheetId: notification.timesheetId } }
                    });
                  }
                  handleNotificationClose();
                }}
                sx={{
                  backgroundColor: notification.isRead ? 'inherit' : '#f5f5f5',
                  maxWidth: 300,
                  whiteSpace: 'normal'
                }}
              >
                <Typography variant="body2">
                  {notification.message}
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    {format(parseISO(notification.createdAt), "MMM dd, h:mm a")}
                  </Typography>
                </Typography>
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>
              No new notifications
            </MenuItem>
          )}
        </Menu>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 3,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddTimesheetEntry}
            sx={{ minWidth: 150 }}
            disabled={loading}
          >
            Add Entry
          </Button>

          <TextField
            size="small"
            placeholder="Search tasks, projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 250 }}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          <IconButton
            onClick={handleFilterModalOpen}
            color={filters.status !== "All Statuses" || filters.project !== "All Projects" || filters.startDate ? "primary" : "default"}
            disabled={loading}
          >
            <FilterList />
          </IconButton>
        </Box>

        {loading && entries.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Time Sheet Summary
              </Typography>
              <Grid container spacing={1} sx={{ mb: 2 }}>
                {daysOfWeek.map((day, idx) => (
                  <Grid item xs={4} sm={2} key={idx}>
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{
                        fontWeight: "bold",
                        color: day.isWeekend ? "#f44336" : "inherit",
                      }}
                    >
                      {day.label}
                    </Typography>
                    <Typography>
                      {entries.reduce(
                        (sum, entry) => sum + (entry.hours[idx] || 0),
                        0
                      )}{" "}
                      hours
                    </Typography>
                  </Grid>
                ))}
                <Grid item xs={12} sm={2}>
                  <Typography variant="caption" display="block" sx={{ fontWeight: "bold" }}>
                    Total
                  </Typography>
                  <Typography>{totalHours.toFixed(2)} hours</Typography>
                </Grid>
              </Grid>
            </Paper>

            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Paper elevation={2} sx={{ p: 2, height: "100%" }}>
                  {selectedEntry ? (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: "bold" }}>
                        {selectedEntry.taskName}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Project: {selectedEntry.projectName}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Task ID:{selectedEntry.taskId.toString().slice(-4)}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Status: {selectedEntry.status}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Created At: {selectedEntry.createdAtFormatted}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Comments: {selectedEntry.comments}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Total Hours: {selectedEntry.hours.reduce((sum, hour) => sum + hour, 0)} hours
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Select an entry to view details
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={9}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Logged Time
                  </Typography>

                  <TableContainer>
                    <Table size="small" sx={{ minWidth: 800 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ width: "15%" }}>Task</TableCell>
                          <TableCell sx={{ width: "12%" }}>Project</TableCell>
                          <TableCell sx={{ width: "10%" }}>Time Category</TableCell>
                          <TableCell sx={{ width: "10%" }}>Resource Plan</TableCell>
                          <TableCell sx={{ width: "10%" }}>Created At</TableCell>
                          {daysOfWeek.map((day, idx) => (
                            <TableCell
                              key={idx}
                              align="center"
                              sx={{
                                color: day.isWeekend ? "#f44336" : "inherit",
                                fontWeight: "bold",
                                width: "5%",
                              }}
                            >
                              {day.dayName}
                            </TableCell>
                          ))}
                          <TableCell
                            align="center"
                            sx={{ width: "5%", fontWeight: "bold" }}
                          >
                            Total
                          </TableCell>
                          <TableCell sx={{ width: "8%" }}>Status</TableCell>
                          <TableCell sx={{ width: "5%" }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredEntries
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((entry) => {
                            const entryTotal = entry.hours.reduce(
                              (sum, hour) => sum + hour,
                              0
                            );
                            return (
                              <TableRow
                                key={entry.id}
                                hover
                                selected={selectedEntry?.id === entry.id}
                                onClick={() => setSelectedEntry(entry)}
                                sx={{
                                  cursor: "pointer",
                                  backgroundColor:
                                    entry.status === "SUBMITTED" ? "#f5f5f5" :
                                      entry.status === "APPROVED" ? "#e8f5e9" :
                                        entry.status === "REJECTED" ? "#ffebee" : "inherit",
                                  opacity:
                                    entry.status === "SUBMITTED" ||
                                      entry.status === "APPROVED" ? 0.8 : 1
                                }}
                              >
                                <TableCell>
                                  <Typography fontWeight="bold">
                                    {entry.taskName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {entry.comments
                                      ? entry.comments.substring(0, 30) +
                                      (entry.comments.length > 30 ? "..." : "")
                                      : ""}
                                  </Typography>
                                </TableCell>
                                <TableCell>{entry.projectName}</TableCell>
                                <TableCell>{entry.timeCategory}</TableCell>
                                <TableCell>{entry.resourcePlan}</TableCell>
                                <TableCell>{entry.createdAtFormatted}</TableCell>
                                {entry.hours.map((hour, dayIdx) => (
                                  <TableCell
                                    key={dayIdx}
                                    align="center"
                                    sx={{
                                      backgroundColor: hour > 0 ? "#e8f5e9" : "inherit",
                                      color:
                                        daysOfWeek[dayIdx].isWeekend && hour > 0
                                          ? "#f44336"
                                          : "inherit",
                                    }}
                                  >
                                    {hour > 0 ? hour : "-"}
                                  </TableCell>
                                ))}
                                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                                  {entryTotal}
                                </TableCell>
                                <TableCell>
                                  <Box
                                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                                  >
                                    {getStatusIcon(entry.status)}
                                    <Typography variant="body2">
                                      {entry.status}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMenuOpen(e, entry);
                                    }}
                                  >
                                    <MoreVert />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredEntries.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />

                  <Divider sx={{ my: 2 }} />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Showing {filteredEntries.length} of {entries.length} entries
                      {statusFilter && ` (Filtered by ${statusFilter})`}
                    </Typography>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmitAll}
                        disabled={
                          loading || !entries.some((e) => e.status === "DRAFT")
                        }
                        startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                      >
                        Submit All Drafts
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleView}>
          <Visibility fontSize="small" sx={{ mr: 1 }} /> View
        </MenuItem>

        {selectedEntry?.status !== "SUBMITTED" && (
          <>
            {(selectedEntry?.status === "DRAFT" || selectedEntry?.status === "REJECTED") && (
              <MenuItem onClick={handleEdit}>
                <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
              </MenuItem>
            )}

            {selectedEntry?.status !== "APPROVED" && (
              <MenuItem onClick={handleDelete}>
                <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
              </MenuItem>
            )}

            {(selectedEntry?.status === "DRAFT" || selectedEntry?.status === "REJECTED") && (
              <MenuItem
                onClick={handleSubmitEntry}
                disabled={loading}
              >
                <Send fontSize="small" sx={{ mr: 1 }} />
                {loading ? "Submitting..." : "Submit"}
              </MenuItem>
            )}
          </>
        )}
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
};

export default TimesheetDetailPage;