import React from "react";
import {
  Paper,
  Typography,
  Grid,
  Box,
  Button,
  Divider,
  Chip,
} from "@mui/material";
import { format, parseISO } from "date-fns";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const TimesheetViewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const entry = location.state?.entry;

  if (!entry) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6">No timesheet data found</Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate("/user/employee-dashboard/timesheet-detail")}
        >
          Back to Timesheets
        </Button>
      </Box>
    );
  }

  const daysOfWeek = [
    { name: "Monday", hours: entry.mondayHours || 0 },
    { name: "Tuesday", hours: entry.tuesdayHours || 0 },
    { name: "Wednesday", hours: entry.wednesdayHours || 0 },
    { name: "Thursday", hours: entry.thursadyHours || 0 },
    { name: "Friday", hours: entry.fridayHours || 0 },
    { name: "Saturday", hours: entry.saturdayHours || 0 },
    { name: "Sunday", hours: entry.sundayHours || 0 },
  ];

  const totalHours = daysOfWeek.reduce((sum, day) => sum + day.hours, 0);

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Timesheet Details
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/user/employee-dashboard/timesheet-detail")}
        >
          Back
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
            Basic Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" display="block">
                Timesheet ID
              </Typography>
              <Typography>{entry.timesheetId}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" display="block">
                Employee ID
              </Typography>
              <Typography>{entry.empId}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" display="block">
                Status
              </Typography>
              <Chip
                label={entry.status}
                color={
                  entry.status === "SUBMITTED"
                    ? "success"
                    : entry.status === "DRAFT"
                    ? "info"
                    : "warning"
                }
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" display="block">
                Created At
              </Typography>
              <Typography>
                {format(parseISO(entry.createdAt), "dd MMM yyyy HH:mm")}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        {/* Project & Task Information */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
            Project & Task
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" display="block">
                Project
              </Typography>
              <Typography>
                {entry.projectName} (ID: {entry.projectId})
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" display="block">
                Task
              </Typography>
              <Typography>
                {entry.taskName} (ID: {entry.taskId})
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" display="block">
                Time Category
              </Typography>
              <Typography>{entry.timeCategory}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" display="block">
                Resource Plan
              </Typography>
              <Typography>{entry.resourcePlan}</Typography>
            </Grid>
          </Grid>
        </Grid>

        {/* Hours Breakdown */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
            Hours Breakdown
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {daysOfWeek.map((day, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="subtitle2">{day.name}</Typography>
                  <Typography variant="h6">
                    {day.hours > 0 ? day.hours + " hours" : "No hours logged"}
                  </Typography>
                </Paper>
              </Grid>
            ))}
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2, backgroundColor: "#f5f5f5" }}>
                <Typography variant="subtitle2">Total Hours</Typography>
                <Typography variant="h6">{totalHours} hours</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Comments */}
        {entry.comments && (
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
              Comments
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography>{entry.comments}</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default TimesheetViewPage;