import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Grid,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider
} from "@mui/material";
import { format, parseISO, eachDayOfInterval, isWeekend } from "date-fns";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/apiConfig"; 

const TimesheetDetailView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [timesheet, setTimesheet] = useState(location.state?.timesheet || null);
  const [loading, setLoading] = useState(!location.state?.timesheet);

  useEffect(() => {
    if (!timesheet) {
      const fetchTimesheet = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/timesheets/${id}`);
          setTimesheet(response.data);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching timesheet:", error);
          navigate("/admin/timesheets");
        }
      };
      fetchTimesheet();
    }
  }, [id, navigate, timesheet]);

  const getStatusChip = (status) => {
    switch (status) {
      case "Approved":
      case "APPROVED":
        return <Chip label="Approved" color="success" />;
      case "Rejected":
      case "REJECTED":
        return <Chip label="Rejected" color="error" />;
      case "Pending Approval":
      case "SUBMITTED":
        return <Chip label="Pending" color="warning" />;
      case "Draft":
      case "DRAFT":
        return <Chip label="Draft" color="info" />;
      default:
        return <Chip label={status} />;
    }
  };

  if (loading) {
    return <Typography>Loading timesheet details...</Typography>;
  }

  if (!timesheet) {
    return <Typography>Timesheet not found</Typography>;
  }

  // Calculate days in the week
  const days = eachDayOfInterval({
    start: parseISO(timesheet.weekStart),
    end: parseISO(timesheet.weekEnd)
  });

  // Get hours in order
  const hours = [
    timesheet.mondayHours || 0,
    timesheet.tuesdayHours || 0,
    timesheet.wednesdayHours || 0,
    timesheet.thursadyHours || 0,
    timesheet.fridayHours || 0,
    timesheet.saturdayHours || 0,
    timesheet.sundayHours || 0
  ];

  const totalHours = hours.reduce((sum, hour) => sum + hour, 0);

  return (
    <Paper elevation={0} sx={{ p: 3, width: "100%", maxWidth: 1200, mx: "auto" }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/admin/dashboard/timesheets")}
        sx={{ mb: 3 }}
      >
        Back to Timesheets
      </Button>

      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
        Timesheet Details
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
            Employee Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption">Employee Name</Typography>
              <Typography>{timesheet.empName}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption">Employee ID</Typography>
              <Typography>{timesheet.empId}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption">Timesheet ID</Typography>
              <Typography>{timesheet.timesheetId}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption">Status</Typography>
              {getStatusChip(timesheet.status)}
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
            Work Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption">Project</Typography>
              <Typography>{timesheet.projectName}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption">Task</Typography>
              <Typography>{timesheet.taskName}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption">Week</Typography>
              <Typography>
                {format(parseISO(timesheet.weekStart), "MMM dd, yyyy")} -{" "}
                {format(parseISO(timesheet.weekEnd), "MMM dd, yyyy")}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption">Total Hours</Typography>
              <Typography>{totalHours}</Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
        Daily Hours
      </Typography>
      <TableContainer component={Paper} elevation={2} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              {days.map((day, index) => (
                <TableCell
                  key={index}
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    color: isWeekend(day) ? "#f44336" : "inherit"
                  }}
                >
                  {format(day, "EEE")}
                  <br />
                  {format(day, "MM/dd")}
                </TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Total
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {hours.map((hour, index) => (
                <TableCell
                  key={index}
                  align="center"
                  sx={{
                    backgroundColor: hour > 0 ? "#e8f5e9" : "inherit",
                    color: isWeekend(days[index]) && hour > 0 ? "#f44336" : "inherit"
                  }}
                >
                  {hour > 0 ? hour : "-"}
                </TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                {totalHours}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
        Comments
      </Typography>
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography>{timesheet.comments || "No comments provided"}</Typography>
      </Paper>

      {timesheet.status === "REJECTED" && (
        <>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
            Rejection Reason
          </Typography>
          <Paper elevation={2} sx={{ p: 2, mb: 3, backgroundColor: "#ffebee" }}>
            <Typography>{timesheet.rejectionReason || "No reason provided"}</Typography>
          </Paper>
        </>
      )}

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="caption">
          Submitted: {timesheet.submitted_at ? format(parseISO(timesheet.submitted_at), "MMM dd, yyyy h:mm a") : "Not submitted"}
        </Typography>
        {timesheet.status === "APPROVED" && (
          <Typography variant="caption">
            Approved: {timesheet.updatedAt ? format(parseISO(timesheet.updatedAt), "MMM dd, yyyy h:mm a") : "N/A"}
          </Typography>
        )}
        {timesheet.status === "REJECTED" && (
          <Typography variant="caption">
            Rejected: {timesheet.updatedAt ? format(parseISO(timesheet.updatedAt), "MMM dd, yyyy h:mm a") : "N/A"}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default TimesheetDetailView;