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
  CircularProgress,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextareaAutosize,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Visibility } from "@mui/icons-material";

const OverTimeForm = () => {
  const [formData, setFormData] = useState({
    employeeId: "",
    employeeName: "",
    category: "",
    startTime: "",
    endTime: "",
    project: "",
    notes: "",
  });

  const [overtimeHistory, setOvertimeHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [profileData, setProfileData] = useState(null);
  const [userProjects, setUserProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const recordsPerPage = 5;

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
    const fetchData = async () => {
      try {
        setLoading(true);
        setProjectsLoading(true);

        // Fetch employee profile data using UserService
        const token = Cookies.get("token");
        if (!token) throw new Error("No authentication token found");

        const profileResponse = await UserService.getCompleteProfile(token);
        if (profileResponse.employeeData) {
          setProfileData(profileResponse.employeeData);
          setFormData(prev => ({
            ...prev,
            employeeId: profileResponse.employeeData.personal.empId,
            employeeName: profileResponse.employeeData.personal.firstName
          }));
        } else {
          throw new Error("No employee data found in response");
        }

        // Fetch projects assigned to this user
        const projectsResponse = await api.get("/user/projects/by-emp");
        setUserProjects(projectsResponse.data);

        // Fetch overtime history
        const overtimeResponse = await api.get("/user/overtime");
        const sortedData = overtimeResponse.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOvertimeHistory(sortedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || "Failed to load data",
          severity: "error",
        });
      } finally {
        setLoading(false);
        setProjectsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validate time
    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      setSnackbar({
        open: true,
        message: "End time must be after start time",
        severity: "error",
      });
      setSubmitting(false);
      return;
    }

    try {
      await api.post("/user/overtime/add", {
        ...formData,
        status: "Pending",
        employeeId: profileData?.personal?.empId,
        employeeName: profileData?.personal?.firstName
      });

      setSnackbar({
        open: true,
        message: "Overtime request submitted successfully!",
        severity: "success",
      });

      // Reset form (keep employee details)
      setFormData(prev => ({
        ...prev,
        category: "",
        startTime: "",
        endTime: "",
        project: "",
        notes: "",
      }));

      // Refresh overtime history
      const response = await api.get("/user/overtime");
      const sortedData = response.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOvertimeHistory(sortedData);
    } catch (error) {
      console.error("Error submitting overtime:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 
                "Failed to submit overtime request. Please try again.",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(overtimeHistory.length / recordsPerPage) - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const statusColor = {
    Approved: "success",
    Rejected: "error",
    Pending: "warning",
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const paginatedData = overtimeHistory.slice(
    currentPage * recordsPerPage,
    (currentPage + 1) * recordsPerPage
  );

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Overtime Request
      </Typography>

      <Paper elevation={4} sx={{ p: 4, mb: 5, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          New Overtime Request
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Employee ID and Name fields */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Employee ID"
                name="employeeId"
                value={profileData?.personal?.empId || ""}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Employee Name"
                name="employeeName"
                value={profileData?.personal?.firstName || ""}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                >
                  <MenuItem value=""><em>Select Category</em></MenuItem>
                  <MenuItem value="Extra hours">Extra hours</MenuItem>
                  <MenuItem value="Weekend work">Weekend work</MenuItem>
                  <MenuItem value="Holiday work">Holiday work</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="datetime-local"
                name="startTime"
                label="Start Time"
                value={formData.startTime}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="datetime-local"
                name="endTime"
                label="End Time"
                value={formData.endTime}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: formData.startTime
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Project</InputLabel>
                <Select
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  label="Project"
                  disabled={projectsLoading || userProjects.length === 0}
                >
                  <MenuItem value=""><em>Select Project</em></MenuItem>
                  {userProjects.map((project) => (
                    <MenuItem key={project.id} value={project.name}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
                {projectsLoading && (
                  <FormHelperText>
                    <CircularProgress size={14} sx={{ mr: 1 }} />
                    Loading projects...
                  </FormHelperText>
                )}
                {!projectsLoading && userProjects.length === 0 && (
                  <FormHelperText error>
                    No projects assigned to you
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                name="notes"
                label="Notes"
                value={formData.notes}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                placeholder="Additional details about your overtime request"
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
          Overtime History
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : overtimeHistory.length > 0 ? (
          <>
            <Paper elevation={3} sx={{ overflowX: "auto", mb: 2, borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ backgroundColor: "primary.main" }}>
                  <TableRow>
                    {["Employee ID", "Employee Name", "Category", "Start Time", "End Time", "Project", "Status", "Actions"].map((head) => (
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
                  {paginatedData.map((record) => (
                    <TableRow key={record.id} hover>
                      <TableCell>{record.employeeId}</TableCell>
                      <TableCell>{record.employeeName}</TableCell>
                      <TableCell>{record.category}</TableCell>
                      <TableCell>{formatDateTime(record.startTime)}</TableCell>
                      <TableCell>{formatDateTime(record.endTime)}</TableCell>
                      <TableCell>{record.project}</TableCell>
                      <TableCell>
                        <Chip
                          label={record.status}
                          color={statusColor[record.status]}
                          sx={{ fontWeight: 600, minWidth: 100 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          color="info" 
                          startIcon={<Visibility />}
                          onClick={() => handleViewRequest(record)}
                          sx={{ mr: 1 }}
                        >
                          View
                        </Button>
                        <Button 
                          size="small" 
                          color="error" 
                          sx={{ mr: 1 }}
                          disabled={record.status !== "Pending"}
                        >
                          Cancel
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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
                Page {currentPage + 1} of {Math.ceil(overtimeHistory.length / recordsPerPage)}
              </Typography>
              
              <IconButton 
                onClick={handleNextPage} 
                disabled={currentPage === Math.ceil(overtimeHistory.length / recordsPerPage) - 1}
                sx={{ 
                  backgroundColor: currentPage === Math.ceil(overtimeHistory.length / recordsPerPage) - 1 
                    ? 'action.disabledBackground' : 'primary.main',
                  color: currentPage === Math.ceil(overtimeHistory.length / recordsPerPage) - 1 
                    ? 'text.disabled' : 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: currentPage === Math.ceil(overtimeHistory.length / recordsPerPage) - 1 
                      ? null : 'primary.dark'
                  }
                }}
              >
                <ChevronRight />
              </IconButton>
            </Box>
          </>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>
            No overtime records found.
          </Alert>
        )}
      </Box>

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
                  color={statusColor[selectedRequest.status]}
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

export default OverTimeForm;