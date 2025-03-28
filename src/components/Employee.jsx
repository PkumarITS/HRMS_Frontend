import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Button,
  Box,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import Cookies from "js-cookie";

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const navigate = useNavigate();

  const token = Cookies.get("token");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get("http://localhost:1010/api/employees/all", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        const data = response.data.data || response.data;
        
        if (Array.isArray(data)) {
          setEmployees(data);
          setFilteredEmployees(data);
        } else {
          throw new Error("Invalid data format received from server");
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        setError("Failed to fetch employees. Please try again.");
        showSnackbar(
          error.response?.data?.message || "Failed to fetch employees", 
          "error"
        );
        
        if (error.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [token, navigate]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        const response = await axios.delete(
          `http://localhost:1010/api/employees/${id}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        );
        
        if (response.status === 200) {
          showSnackbar("Employee deleted successfully", "success");
          setEmployees(prev => prev.filter(emp => emp.id !== id));
          setFilteredEmployees(prev => prev.filter(emp => emp.id !== id));
        } else {
          throw new Error(response.data?.message || "Failed to delete employee");
        }
      } catch (error) {
        console.error("Error deleting employee:", error);
        showSnackbar(
          error.response?.data?.message || "Failed to delete employee", 
          "error"
        );
      }
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === "") {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(emp => {
        const personal = emp.personal || {};
        const work = emp.work || {};
        return (
          personal.firstName?.toLowerCase().includes(term) ||
          personal.lastName?.toLowerCase().includes(term) ||
          personal.empId?.toLowerCase().includes(term) ||
          work.department?.toLowerCase().includes(term) ||
          work.jobTitle?.toLowerCase().includes(term) ||
          emp.id.toString().includes(term)
        );
      });
      setFilteredEmployees(filtered);
    }
    setPage(0);
  };

  const handleExportCSV = () => {
    // Define all possible headers from all tabs
    const headers = [
      // Personal Information
      "ID",
      "Employee Number",
      "First Name",
      "Middle Name",
      "Last Name",
      "Date of Birth",
      "Gender",
      "Marital Status",
      "Nationality",
      "Ethnicity",
      
      // Identification Information
      "Immigration Status",
      "Personal Tax ID",
      "Social Insurance",
      "ID Proof",
      "Document Name",
      "Document Number",
      
      // Work Information
      "Employment Status",
      "Department",
      "Job Title",
      "Pay Grade",
      "Date of Joining",
      "Termination Date",
      "Workstation ID",
      "Time Zone",
      "Shift Start Time",
      "Shift End Time",
      
      // Contact Information
      "Residential Address",
      "Permanent Address",
      "City",
      "State",
      "Country",
      "Postal Code",
      "Work Email",
      "Personal Email",
      "Mobile Number",
      "Primary Emergency Contact Name",
      "Primary Emergency Contact Number",
      "Relationship to Primary Emergency Contact",
      "Secondary Emergency Contact Name",
      "Secondary Emergency Contact Number",
      "Relationship to Secondary Emergency Contact",
      "Family Doctor Name",
      "Family Doctor Contact Number",
      
      // Report Information
      "Manager",
      "Indirect Manager",
      "First Level Approver",
      "Second Level Approver",
      "Third Level Approver",
      "Notes"
    ].join(",");
  
    // Map through each employee and extract all fields
    const dataRows = filteredEmployees.map(emp => {
      const personal = emp.personal || {};
      const identification = emp.identification || {};
      const work = emp.work || {};
      const contact = emp.contact || {};
      const report = emp.report || {};
      
      return [
        // Personal Information
        emp.id,
        personal.empId || "",
        personal.firstName || "",
        personal.middleName || "",
        personal.lastName || "",
        personal.dateOfBirth ? new Date(personal.dateOfBirth).toISOString().split('T')[0] : "",
        personal.gender || "",
        personal.maritalStatus || "",
        personal.nationality || "",
        personal.ethnicity || "",
        
        // Identification Information
        identification.immigrationStatus || "",
        identification.personalTaxId || "",
        identification.socialInsurance || "",
        identification.idProof || "",
        identification.documentName || "",
        identification.documentNumber || "",
        
        // Work Information
        work.employmentStatus || "",
        work.department || "",
        work.jobTitle || "",
        work.payGrade || "",
        work.doj ? new Date(work.doj).toISOString().split('T')[0] : "",
        work.terminationDate ? new Date(work.terminationDate).toISOString().split('T')[0] : "",
        work.workstationId || "",
        work.timeZone || "",
        work.shiftStartTime || "",
        work.shiftEndTime || "",
        
        // Contact Information
        contact.residentialAddress || "",
        contact.permanentAddress || "",
        contact.city || "",
        contact.state || "",
        contact.country || "",
        contact.postalCode || "",
        contact.workEmail || "",
        contact.personalEmail || "",
        contact.mobileNumber || "",
        contact.primaryEmergencyContactName || "",
        contact.primaryEmergencyContactNumber || "",
        contact.relationshipToPrimaryEmergencyContact || "",
        contact.secondaryEmergencyContactName || "",
        contact.secondaryEmergencyContactNumber || "",
        contact.relationshipToSecondaryEmergencyContact || "",
        contact.familyDoctorName || "",
        contact.familyDoctorContactNumber || "",
        
        // Report Information
        report.manager || "",
        report.indirectManager || "",
        report.firstLevelApprover || "",
        report.secondLevelApprover || "",
        report.thirdLevelApprover || "",
        report.note || ""
      ].map(field => {
        // Handle fields that might contain commas or quotes
        if (typeof field === 'string') {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return `"${field}"`;
      }).join(",");
    });
  
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${dataRows.join("\n")}`;
  
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `employees_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSnackbar("CSV exported successfully with all employee data", "success");
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "80vh" 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "80vh",
        textAlign: "center",
        p: 3
      }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Refresh Page
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        mb: 3,
        gap: 2,
        flexWrap: 'wrap'
      }}>
        <Typography variant="h4" color="primary">
          Employee Management
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
            sx={{ 
              width: 200,
              '& .MuiOutlinedInput-root': {
                height: 40
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            component={Link}
            to="/dashboard/add_employee"
            variant="contained"
            color="primary"
            size="small"
          >
            Add Employee
          </Button>
          
          <Button
            onClick={handleExportCSV}
            variant="contained"
            color="secondary"
            size="small"
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "primary.light" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "common.white" }}>#</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "common.white" }}>Employee ID</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "common.white" }}>First Name</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "common.white" }}>Last Name</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "common.white" }}>Department</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "common.white" }}>Job Title</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "common.white" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((emp, index) => (
                  <TableRow key={emp.id} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{emp.personal?.empId || "-"}</TableCell>
                    <TableCell>{emp.personal?.firstName || "-"}</TableCell>
                    <TableCell>{emp.personal?.lastName || "-"}</TableCell>
                    <TableCell>{emp.work?.department || "-"}</TableCell>
                    <TableCell>{emp.work?.jobTitle || "-"}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/dashboard/edit_employee/${emp.id}`)}
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="info"
                        onClick={() => navigate(`/dashboard/employee_details/${emp.id}`)}
                        title="View Details"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(emp.id)}
                        title="Delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {employees.length === 0 
                      ? "No employees found in the system" 
                      : "No employees match your search criteria"}
                  </Typography>
                  {searchTerm && (
                    <Button 
                      variant="text" 
                      color="primary" 
                      onClick={() => setSearchTerm("")}
                      sx={{ mt: 1 }}
                    >
                      Clear search
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredEmployees.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredEmployees.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
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

export default Employee;