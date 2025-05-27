import React, { useEffect, useState } from "react";
import {
  TextField,
  MenuItem,
  Select,
  Button,
  Grid,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  isWeekend,
  parseISO,
} from "date-fns";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import axios from "axios";
import API_BASE_URL from "../config/apiConfig";

const TimesheetForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const existingEntry = location.state?.existingEntry;
  const isEditMode = !!existingEntry;

  const [weekStart, setWeekStart] = useState(
    existingEntry?.weekStart
      ? parseISO(existingEntry.weekStart)
      : startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const [formData, setFormData] = useState({
    projectId: existingEntry?.projectId || "",
    taskId: existingEntry?.taskId || "",
    timeCategory: existingEntry?.timeCategory || "Keep The Lights On",
    resourcePlan: existingEntry?.resourcePlan || "None",
    hours: existingEntry?.hours || Array(7).fill(0),
    comments: existingEntry?.comments || "",
  });

  const [initialData, setInitialData] = useState({
    timesheetId: "",
    empId: "",
    projects: [],
  });

  const [projectTasks, setProjectTasks] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(
    existingEntry?.taskDetails || null
  );
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [dataLoaded, setDataLoaded] = useState(false);

  const daysOfWeek = Array.from({ length: 7 }).map((_, index) => {
    const dayDate = addDays(weekStart, index);
    return {
      date: dayDate,
      label: format(dayDate, "EEE dd/MM"),
      dayName: format(dayDate, "EEE"),
      isWeekend: isWeekend(dayDate),
      dateString: format(dayDate, "yyyy-MM-dd"),
    };
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/timesheet/get-initial-data`);
        setInitialData({
          timesheetId: response.data.timesheetId,
          empId: response.data.empId,
          projects: response.data.projectNameIds,
        });

        if (!isEditMode) {
          setFormData((prev) => ({
            ...prev,
            timesheetId: response.data.timesheetId,
            empId: response.data.empId,
          }));
        }
        setDataLoaded(true);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setSnackbar({
          open: true,
          message: "Failed to load initial data",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    if (!dataLoaded) {
      fetchInitialData();
    }
  }, [isEditMode, dataLoaded]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (formData.projectId) {
        try {
          setLoading(true);
          const response = await axios.get(
            `${API_BASE_URL}/timesheet/get-tasks/${formData.projectId}`
          );
          setProjectTasks(response.data);

          if (!existingEntry) {
            setFormData((prev) => ({ ...prev, taskId: "" }));
            setSelectedTaskDetails(null);
          }
        } catch (error) {
          console.error("Error fetching tasks:", error);
          setSnackbar({
            open: true,
            message: "Failed to load tasks for selected project",
            severity: "error",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTasks();
  }, [formData.projectId, existingEntry]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleHoursChange = (index, value) => {
    const newHours = [...formData.hours];
    const numValue = Number(value);

    if (isNaN(numValue)) {
      newHours[index] = "";
    } else if (numValue < 0) {
      newHours[index] = 0;
    } else if (numValue > 24) {
      newHours[index] = 24;
    } else {
      newHours[index] = Math.round(numValue * 4) / 4; // Round to nearest 0.25
    }

    setFormData({ ...formData, hours: newHours });
  };

  const handleWeekNavigation = (direction) => {
    setWeekStart(addDays(weekStart, direction * 7));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const selectedProject = initialData.projects.find(
        (p) => p.projectId === formData.projectId
      );
      const selectedTask = projectTasks.find((t) => t.taskId === formData.taskId);

      const payload = {
        timesheetId: isEditMode ? existingEntry.timesheetId : initialData.timesheetId,
        empId: initialData.empId,
        projectId: formData.projectId,
        taskId: formData.taskId,
        projectName: selectedProject?.projectName || "",
        taskName: selectedTask?.taskName || "",
        timeCategory: formData.timeCategory,
        resourcePlan: formData.resourcePlan,
        mondayHours: formData.hours[0] || 0,
        tuesdayHours: formData.hours[1] || 0,
        wednesdayHours: formData.hours[2] || 0,
        thursadyHours: formData.hours[3] || 0,
        fridayHours: formData.hours[4] || 0,
        saturdayHours: formData.hours[5] || 0,
        sundayHours: formData.hours[6] || 0,
        comments: formData.comments,
        status: isEditMode ? existingEntry.status : "DRAFT",
      };

      const response = isEditMode
        ? await axios.put(`${API_BASE_URL}/timesheet/${existingEntry.timesheetId}`, payload)
        : await axios.post(`${API_BASE_URL}/timesheet`, payload);

      navigate("/user/employee-dashboard/timesheet-detail", {
        state: {
          refresh: true,
          entry: {
            ...response.data,
            hours: [
              response.data.mondayHours,
              response.data.tuesdayHours,
              response.data.wednesdayHours,
              response.data.thursadyHours,
              response.data.fridayHours,
              response.data.saturdayHours,
              response.data.sundayHours,
            ],
            taskDetails: selectedTask,
            weekStart: format(weekStart, "yyyy-MM-dd"),
            weekEnd: format(endOfWeek(weekStart, { weekStartsOn: 1 }), "yyyy-MM-dd"),
          },
          isEditMode,
          weekRange: `${format(weekStart, "dd MMM")} - ${format(
            addDays(weekStart, 6),
            "dd MMM yyyy"
          )}`,
        },
      });
    } catch (error) {
      console.error("Error saving timesheet:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to save timesheet",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.projectId) newErrors.projectId = "Project is required";
    if (!formData.taskId) newErrors.taskId = "Task is required";

    if (formData.hours.every((hour) => !hour || hour === 0)) {
      newErrors.hours = "At least one day must have hours entered";
    } else if (formData.hours.some((hour) => hour < 0 || hour > 24)) {
      newErrors.hours = "Hours must be between 0 and 24";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Paper elevation={3} sx={{ p: 3, width: "100%", maxWidth: 1000, mx: "auto" }}>
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ color: "#1976d2", fontWeight: "bold" }}>
            {isEditMode ? "Edit Timesheet Entry" : "New Timesheet Entry"}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={() => handleWeekNavigation(-1)}
              size="small"
              disabled={loading}
            >
              <ArrowBackIosIcon fontSize="small" />
            </IconButton>
            <Typography variant="subtitle1" sx={{ mx: 2 }}>
              {format(weekStart, "dd MMM")} - {format(
                addDays(weekStart, 6),
                "dd MMM yyyy"
              )}
            </Typography>
            <IconButton
              onClick={() => handleWeekNavigation(1)}
              size="small"
              disabled={loading}
            >
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>

            <Chip
              label={isEditMode ? existingEntry.status : "Draft"}
              color={
                isEditMode && existingEntry.status === "Submitted"
                  ? "success"
                  : "info"
              }
              sx={{ ml: 2 }}
            />
          </Box>
        </Grid>

        {loading && !initialData.empId ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Timesheet ID"
                value={
                  isEditMode ? existingEntry.timesheetId : initialData.timesheetId
                }
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Employee ID"
                value={initialData.empId}
                fullWidth
                disabled
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.projectId}>
                <InputLabel>Project</InputLabel>
                <Select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  label="Project"
                  disabled={loading}
                >
                  <MenuItem value="">Select Project</MenuItem>
                  {initialData?.projects?.map((project) => (
                    <MenuItem key={project.projectId} value={project.projectId}>
                      {project.projectName}
                    </MenuItem>
                  ))}
                </Select>
                {errors.projectId && (
                  <Typography variant="caption" color="error">
                    {errors.projectId}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.taskId}>
                <InputLabel>Task</InputLabel>
                <Select
                  name="taskId"
                  value={formData.taskId}
                  onChange={handleChange}
                  label="Task"
                  disabled={!formData.projectId || loading}
                >
                  <MenuItem value="">Select Task</MenuItem>
                  {projectTasks.map((task) => (
                    <MenuItem key={task.taskId} value={task.taskId}>
                      {task.taskName}
                    </MenuItem>
                  ))}
                </Select>
                {errors.taskId && (
                  <Typography variant="caption" color="error">
                    {errors.taskId}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {selectedTaskDetails && (
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 2, backgroundColor: "#f5f5f5" }}>
                  <Typography variant="subtitle2">Task Details</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption">Task ID</Typography>
                      <Typography>PRJTASK00{selectedTaskDetails.taskId.toString().slice(-4)}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Time Category</InputLabel>
                <Select
                  name="timeCategory"
                  value={formData.timeCategory}
                  onChange={handleChange}
                  label="Time Category"
                  disabled={loading}
                >
                  {["Keep The Lights On", "Meeting", "Development", "Testing"].map(
                    (option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Resource Plan</InputLabel>
                <Select
                  name="resourcePlan"
                  value={formData.resourcePlan}
                  onChange={handleChange}
                  label="Resource Plan"
                  disabled={loading}
                >
                  {["None", "Sprint Plan", "Maintenance", "Client Project"].map(
                    (option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Daily Hours (Mon-Sun)
              </Typography>
              {errors.hours && (
                <Typography variant="caption" color="error" sx={{ mb: 1 }}>
                  {errors.hours}
                </Typography>
              )}
              <Box sx={{ display: 'flex', overflowX: 'auto', py: 1 }}>
                <Grid container spacing={1} sx={{ flexWrap: 'nowrap', minWidth: 'max-content' }}>
                  {daysOfWeek.map((day, idx) => (
                    <Grid item key={idx} sx={{ minWidth: 100 }}>
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{
                          fontWeight: "bold",
                          color: day.isWeekend ? "#f44336" : "inherit",
                          textAlign: 'center',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {day.label}
                      </Typography>
                      <TextField
                        type="number"
                        value={formData.hours[idx]}
                        onChange={(e) => handleHoursChange(idx, e.target.value)}
                        inputProps={{
                          min: 0,
                          max: 24,
                          step: 0.25,
                        }}
                        fullWidth
                        size="small"
                        disabled={loading}
                        sx={{
                          "& .MuiInputBase-input": {
                            textAlign: "center",
                          },
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="comments"
                label="Comments"
                multiline
                rows={3}
                fullWidth
                value={formData.comments}
                onChange={handleChange}
                sx={{ mt: 2 }}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                sx={{ mr: 2 }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : isEditMode ? (
                  "Update Entry"
                ) : (
                  "Add to Timesheet"
                )}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        )}
      </Paper>

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

export default TimesheetForm;