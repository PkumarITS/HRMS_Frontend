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
} from "@mui/icons-material";
import { format, startOfWeek, addDays, parseISO, isWeekend } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = "http://localhost:1010";

const TimesheetDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [entries, setEntries] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [notifications] = useState([
    "Timesheet submission reminder",
    "New project assigned",
    "System maintenance scheduled",
  ]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
      const response = await axios.get(`${API_BASE_URL}/user/timesheet/employee/current-week`);

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

  useEffect(() => {
    fetchTimesheetEntries();
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
      await axios.delete(`${API_BASE_URL}/user/timesheet/${selectedEntry.id}`);
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
        `${API_BASE_URL}/user/timesheet/${selectedEntry.id}/submit`
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
        `${API_BASE_URL}/user/timesheet/submit-all`,
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

  const filteredEntries = entries.filter(
    (entry) =>
      entry.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.timeCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.resourcePlan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalHours = entries.reduce((total, entry) => {
    return total + entry.hours.reduce((sum, hour) => sum + hour, 0);
  }, 0);

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
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
                variant="outlined"
              />
              <Chip
                label={`${entries.filter((e) => e.status === "DRAFT").length} Draft`}
                color="info"
                size="small"
                variant="outlined"
              />
              <Chip
                label={`${entries.filter((e) => e.status === "APPROVED").length} Approved`}
                color="success"
                size="small"
                variant="outlined"
              />
              <Chip
                label={`${entries.filter((e) => e.status === "REJECTED").length} Rejected`}
                color="error"
                size="small"
                variant="outlined"
              />

              <IconButton onClick={handleNotificationClick} disabled={loading}>
                <Badge badgeContent={notifications.length} color="error">
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

        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
        >
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <MenuItem key={index} onClick={handleNotificationClose}>
                {notification}
              </MenuItem>
            ))
          ) : (
            <MenuItem onClick={handleNotificationClose}>No notifications</MenuItem>
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

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>All Tasks</InputLabel>
            <Select value="" label="All Tasks" disabled={loading || entries.length === 0}>
              {entries.map((entry, index) => (
                <MenuItem key={index} value={entry.id}>
                  {entry.taskName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
                      <Typography variant="subtitle2" gutterBottom>
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
                          <TableCell sx={{ width: "20%" }}>Task</TableCell>
                          <TableCell sx={{ width: "15%" }}>Project</TableCell>
                          <TableCell sx={{ width: "12%" }}>Time Category</TableCell>
                          <TableCell sx={{ width: "12%" }}>Resource Plan</TableCell>
                          {daysOfWeek.map((day, idx) => (
                            <TableCell
                              key={idx}
                              align="center"
                              sx={{
                                color: day.isWeekend ? "#f44336" : "inherit",
                                fontWeight: "bold",
                                width: "6%",
                              }}
                            >
                              {day.dayName}
                            </TableCell>
                          ))}
                          <TableCell
                            align="center"
                            sx={{ width: "6%", fontWeight: "bold" }}
                          >
                            Total
                          </TableCell>
                          <TableCell sx={{ width: "10%" }}>Status</TableCell>
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
        
        {/* Show Edit only for DRAFT or REJECTED status */}
        {(selectedEntry?.status === "DRAFT" || selectedEntry?.status === "REJECTED") && (
          <MenuItem onClick={handleEdit}>
            <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
          </MenuItem>
        )}

        {/* Show Delete for all statuses except APPROVED */}
        {selectedEntry?.status !== "APPROVED" && (
          <MenuItem onClick={handleDelete}>
            <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
          </MenuItem>
        )}

        {/* Show Submit only for DRAFT or REJECTED status */}
        {(selectedEntry?.status === "DRAFT" || selectedEntry?.status === "REJECTED") && (
          <MenuItem
            onClick={handleSubmitEntry}
            disabled={loading}
          >
            <Send fontSize="small" sx={{ mr: 1 }} /> 
            {loading ? "Submitting..." : "Submit"}
          </MenuItem>
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
    </>
  );
};

export default TimesheetDetailPage;