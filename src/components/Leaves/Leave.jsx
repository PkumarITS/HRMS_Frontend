import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { Add } from "@mui/icons-material";

const Leave = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [newLeave, setNewLeave] = useState({
    empId: "",
    name: "",
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/leave-requests")
      .then((response) => {
        if (response.data.Status) {
          setLeaveRequests(response.data.Result);
          setFilteredRequests(response.data.Result);
        } else {
          alert(response.data.Error);
        }
      })
      .catch((error) => console.error(error));
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    setFilteredRequests(
      leaveRequests.filter((req) =>
        req.empId.toLowerCase().includes(value)
      )
    );
  };

  const filterByStatus = (status) => {
    setFilteredRequests(
      leaveRequests.filter((req) => req.status === status)
    );
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewLeave({ ...newLeave, [name]: value });
  };

  const handleAddLeave = () => {
    setLeaveRequests([...leaveRequests, newLeave]);
    setFilteredRequests([...leaveRequests, newLeave]);
    setOpen(false);
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <TextField
        className="form-control"
          label="Search by Employee ID"
          
          value={search}
          onChange={handleSearch}
          style={{ maxWidth: "300px" }}
        />
        
        <div style={{ display: "flex", gap: "10px" }}>
          <Button variant="outlined" onClick={() => setFilteredRequests(leaveRequests)}>
            All
          </Button>
          <Button variant="outlined" onClick={() => filterByStatus("Pending")}>
            Pending
          </Button>
          <Button variant="outlined" onClick={() => filterByStatus("Approved")}>
            Approved
          </Button>
          <Button variant="outlined" onClick={() => filterByStatus("Rejected")}>
            Rejected
          </Button>
          <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleOpen}>
            Add Leave
          </Button>
        </div>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee ID</TableCell>
              <TableCell>Employee Name</TableCell>
              <TableCell>Leave Type</TableCell>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell>Reason</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req, index) => (
                <TableRow key={index}>
                  <TableCell>{req.empId}</TableCell>
                  <TableCell>{req.name}</TableCell>
                  <TableCell>{req.leaveType}</TableCell>
                  <TableCell>{req.fromDate}</TableCell>
                  <TableCell>{req.toDate}</TableCell>
                  <TableCell>{req.reason}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="6" align="center">
                  No leave requests found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Leave Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Leave Request</DialogTitle>
        <DialogContent>
          <TextField label="Employee ID" name="empId" fullWidth margin="dense" onChange={handleChange} />
          <TextField label="Employee Name" name="name" fullWidth margin="dense" onChange={handleChange} />
          <FormControl fullWidth margin="dense">
            <InputLabel>Leave Type</InputLabel>
            <Select name="leaveType" value={newLeave.leaveType} onChange={handleChange}>
              <MenuItem value="Casual Leave">Casual Leave</MenuItem>
              <MenuItem value="Medical Leave">Medical Leave</MenuItem>
              <MenuItem value="Maternity Leave">Maternity Leave</MenuItem>
            </Select>
          </FormControl>
          <TextField label="From Date" type="date" name="fromDate" fullWidth margin="dense" onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <TextField label="To Date" type="date" name="toDate" fullWidth margin="dense" onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <TextField label="Reason" name="reason" fullWidth margin="dense" onChange={handleChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddLeave} color="primary">Add</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Leave;