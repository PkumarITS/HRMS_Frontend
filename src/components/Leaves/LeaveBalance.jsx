import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";

const LeaveBalance = () => {
  const [empId, setEmpId] = useState("");
  const [leaveBalance, setLeaveBalance] = useState(null);

  const mockData = {
    "101": [
      { leaveType: "Casual Leave", totalLeaves: 10, usedLeaves: 4, balanceLeaves: 6 },
      { leaveType: "Sick Leave", totalLeaves: 8, usedLeaves: 2, balanceLeaves: 6 },
      { leaveType: "Personal Leave", totalLeaves: 5, usedLeaves: 1, balanceLeaves: 4 }
    ],
    "102": [
      { leaveType: "Casual Leave", totalLeaves: 12, usedLeaves: 5, balanceLeaves: 7 },
      { leaveType: "Sick Leave", totalLeaves: 7, usedLeaves: 3, balanceLeaves: 4 },
      { leaveType: "Personal Leave", totalLeaves: 6, usedLeaves: 2, balanceLeaves: 4 }
    ]
  };

  const handleSearch = () => {
    if (mockData[empId]) {
      setLeaveBalance(mockData[empId]);
    } else {
      alert("No records found for this Employee ID.");
      setLeaveBalance(null);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, p: 3, bgcolor: "#f9f9f9", borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "center", mb: 3 }}>
        Employee Leave Balance
      </Typography>

      <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "20px" }}>
        <TextField
          label="Enter Employee ID"
          variant="outlined"
          value={empId}
          onChange={(e) => setEmpId(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleSearch}>
          Search
        </Button>
      </div>

      {leaveBalance && (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Leave Type</b></TableCell>
                <TableCell><b>Total Leaves</b></TableCell>
                <TableCell><b>Used Leaves</b></TableCell>
                <TableCell><b>Balance Leaves</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveBalance.map((leave, index) => (
                <TableRow key={index}>
                  <TableCell>{leave.leaveType}</TableCell>
                  <TableCell>{leave.totalLeaves}</TableCell>
                  <TableCell>{leave.usedLeaves}</TableCell>
                  <TableCell>{leave.balanceLeaves}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default LeaveBalance;