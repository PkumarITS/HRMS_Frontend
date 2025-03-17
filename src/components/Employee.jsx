import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  IconButton,
  TextField,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";

const Employee = () => {
  const [employee, setEmployee] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [searchDept, setSearchDept] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [refreshData, setRefreshData] = useState(false); // State to trigger data refresh
  const navigate = useNavigate();
  const location = useLocation(); // Hook to access navigation state

  // Fetch employees when the component mounts or refreshData changes
  useEffect(() => {
    fetchEmployees();
  }, [refreshData]);

  const fetchEmployees = () => {
    axios
      .get("http://localhost:3000/auth/employee")
      .then((result) => {
        if (result.data.Status) {
          setEmployee(result.data.Result);
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  };

  // Check if navigation state contains a refresh flag
  useEffect(() => {
    if (location.state?.refresh) {
      setRefreshData((prev) => !prev); // Toggle refreshData to re-fetch data
    }
  }, [location.state]);

  const handleSearchById = () => {
    if (searchId) {
      axios
        .get(`http://localhost:3000/auth/employee/${searchId}`)
        .then((result) => {
          if (result.data.Status) {
            setEmployee([result.data.Result]);
          } else {
            alert(result.data.Error);
          }
        })
        .catch((err) => console.log(err));
    } else {
      alert("Please enter a valid Employee ID.");
    }
  };

  const handleSearchByDept = () => {
    if (searchDept) {
      axios
        .get(`http://localhost:3000/auth/employee/department/${searchDept}`)
        .then((result) => {
          if (result.data.Status) {
            setEmployee(result.data.Result);
          } else {
            alert(result.data.Error);
          }
        })
        .catch((err) => console.log(err));
    } else {
      alert("Please select a valid Department.");
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      axios
        .delete(`http://localhost:3000/auth/delete_employee/${id}`)
        .then((result) => {
          if (result.data.Status) {
            setRefreshData((prev) => !prev); // Toggle refreshData to re-fetch data
          } else {
            alert(result.data.Error);
          }
        });
    }
  };

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["ID,Name,Department,Role"]
        .concat(
          employee.map(
            (emp) =>
              `${emp.id},${emp.name},${emp.department},${emp.role}`
          )
        )
        .join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "employee_data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" color="primary">
          Employee Management
        </Typography>
        <Box>
          <Button
            component={Link}
            to="/dashboard/add_employee"
            variant="outlined"
            color="primary"
            sx={{ mr: 2 }}
          >
            Add Employee
          </Button>
          <Button
            component={Link}
            to="/dashboard/employee_details"
            variant="outlined"
            color="primary"
            sx={{ mr: 2 }}
          >
            View All Employee Details
          </Button>
          <Button onClick={handleExportCSV} variant="outlined" color="info">
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Search Fields */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          placeholder="Search by Employee ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          fullWidth
        />
        <Button onClick={handleSearchById} variant="contained" color="primary">
          Search by ID
        </Button>
        <Select
          value={searchDept}
          onChange={(e) => setSearchDept(e.target.value)}
          displayEmpty
          fullWidth
        >
          <MenuItem value="">Select Department</MenuItem>
          <MenuItem value="Management">Management</MenuItem>
          <MenuItem value="Project Manager">Project Manager</MenuItem>
          <MenuItem value="Team Lead">Team Lead</MenuItem>
          <MenuItem value="Development Department">Development Department</MenuItem>
          <MenuItem value="HR Team">HR Team</MenuItem>
          <MenuItem value="QA Department">QA Department</MenuItem>
        </Select>
        <Button onClick={handleSearchByDept} variant="contained" color="primary">
          Search by Department
        </Button>
      </Box>

      {/* Employee Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No</TableCell>
              <TableCell>Employee ID</TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Company Email</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employee
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((emp, index) => (
                <TableRow key={emp.id}>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{emp.id}</TableCell>
                  <TableCell>{emp.firstName}</TableCell>
                  <TableCell>{emp.lastName}</TableCell>
                  <TableCell>{emp.workEmail}</TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/dashboard/edit_employee/${emp.id}`)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="info"
                      onClick={() => navigate(`/dashboard/employee_details/${emp.id}`)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(emp.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={employee.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default Employee;