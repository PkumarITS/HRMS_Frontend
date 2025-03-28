import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getNames } from "country-list";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Autocomplete,
  IconButton,
  Paper,
  Grid,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import ReportIcon from "@mui/icons-material/Report";
import PaletteIcon from "@mui/icons-material/Palette";

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [nationalitySearch, setNationalitySearch] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [activeTab, setActiveTab] = useState(0);

  const timeZones = [
    "UTC - Coordinated Universal Time",
    "GMT - Greenwich Mean Time",
    "IST - Indian Standard Time (UTC+5:30)",
    "EST - Eastern Standard Time (UTC-5)",
    "PST - Pacific Standard Time (UTC-8)",
    "CET - Central European Time (UTC+1)",
    "JST - Japan Standard Time (UTC+9)",
    "AEST - Australian Eastern Standard Time (UTC+10)",
    "CST - China Standard Time (UTC+8)",
    "MST - Mountain Standard Time (UTC-7)",
    "BST - British Summer Time (UTC+1)",
    "CST - Central Standard Time (UTC-6)",
    "EET - Eastern European Time (UTC+2)",
    "AKST - Alaska Standard Time (UTC-9)",
    "HST - Hawaii Standard Time (UTC-10)",
  ];

  const [employee, setEmployee] = useState({
    personal: {
      empId: "",
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      maritalStatus: "",
      nationality: "",
      ethnicity: ""
    },
    identification: {
      immigrationStatus: "",
      personalTaxId: "",
      socialInsurance: "",
      idProof: "",
      documentName: "",
      documentNumber: ""
    },
    work: {
      employmentStatus: "",
      department: "",
      jobTitle: "",
      payGrade: "",
      doj: "",
      terminationDate: "",
      workstationId: "",
      timeZone: "",
      shiftStartTime: "",
      shiftEndTime: ""
    },
    contact: {
      residentialAddress: "",
      permanentAddress: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      workEmail: "",
      personalEmail: "",
      mobileNumber: "",
      primaryEmergencyContactName: "",
      primaryEmergencyContactNumber: "",
      relationshipToPrimaryEmergencyContact: "",
      secondaryEmergencyContactName: "",
      secondaryEmergencyContactNumber: "",
      relationshipToSecondaryEmergencyContact: "",
      familyDoctorName: "",
      familyDoctorContactNumber: ""
    },
    report: {
      manager: "",
      indirectManager: "",
      firstLevelApprover: "",
      secondLevelApprover: "",
      thirdLevelApprover: "",
      note: ""
    }
  });

  const countryOptions = useMemo(() => {
    return getNames().map((country) => ({
      label: country,
      value: country,
    }));
  }, []);

  const [filteredCountries, setFilteredCountries] = useState(countryOptions);
  const [filteredNationalities, setFilteredNationalities] = useState(countryOptions);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("token");
        const response = await axios.get(
          `http://localhost:1010/api/employees/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (response.data && response.data.data) {
          setEmployee(response.data.data);
          setFilteredCountries(countryOptions);
          setFilteredNationalities(countryOptions);
        } else {
          throw new Error("Invalid employee data format");
        }
      } catch (err) {
        console.error("Error fetching employee:", err);
        setError(err.response?.data?.message || err.message);
        if (err.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id, navigate, countryOptions]);

  const handleCountrySearch = (event) => {
    const query = event.target.value;
    setCountrySearch(query);
    const filtered = countryOptions.filter((option) =>
      option.label.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCountries(filtered);
  };

  const handleNationalitySearch = (event) => {
    const query = event.target.value;
    setNationalitySearch(query);
    const filtered = countryOptions.filter((option) =>
      option.label.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredNationalities(filtered);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    const [section, field] = name.includes('.') ? name.split('.') : ['personal', name];
    
    setEmployee(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      const token = Cookies.get("token");
      const response = await axios.put(
        `http://localhost:1010/api/employees/${id}`,
        employee,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSnackbar({
        open: true,
        message: "Employee updated successfully!",
        severity: "success"
      });
      
      setTimeout(() => {
        navigate(`/dashboard/employee`);
      }, 2000);
    } catch (error) {
      console.error("Error updating employee:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to update employee",
        severity: "error"
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <CircularProgress size={80} thickness={4} sx={{ color: '#3f51b5' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ 
        mt: 3, 
        p: 6,
        background: 'linear-gradient(to right, #ffefba, #ffffff)',
        borderRadius: 3,
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
      }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate(-1)}
          sx={{ 
            mt: 2,
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)',
            }
          }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  if (!employee) {
    return (
      <Container maxWidth="md" sx={{ 
        mt: 3, 
        p: 6,
        background: 'linear-gradient(to right, #ffefba, #ffffff)',
        borderRadius: 3,
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
      }}>
        <Typography variant="h6" gutterBottom>
          Employee not found
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate(-1)}
          sx={{ 
            mt: 2,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)',
            }
          }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ 
      mt: 3, 
      mb: 6,
      p: { xs: 2, md: 4 },
      borderRadius: 3,
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      background: 'linear-gradient(to right, #f5f7fa 0%, #e4e8f0 100%)'
    }}>
      {/* Employee Profile Header */}
      <Paper elevation={4} sx={{ 
        mb: 4, 
        p: 3, 
        borderRadius: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={9}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                alt={`${employee.personal?.firstName} ${employee.personal?.lastName}`}
                sx={{ 
                  width: 100, 
                  height: 100, 
                  mr: 3, 
                  fontSize: '2.5rem',
                  background: 'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)'
                }}
              >
                {employee.personal?.firstName?.charAt(0)}{employee.personal?.lastName?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight="bold" sx={{ textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}>
                  {employee.personal?.firstName} {employee.personal?.lastName}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <Chip 
                    label={`ID: ${employee.personal?.empId}`} 
                    color="primary" 
                    variant="outlined" 
                    sx={{ 
                      mr: 1,
                      color: 'white',
                      borderColor: 'white',
                      fontWeight: 'bold'
                    }} 
                  />
                  <Chip 
                    label={employee.work?.jobTitle || "No job title"} 
                    color="secondary" 
                    sx={{ 
                      color: 'white',
                      fontWeight: 'bold'
                    }} 
                  />
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{
                  background: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
                  boxShadow: '0 3px 5px 2px rgba(0, 242, 254, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #00f2fe 0%, #4facfe 100%)',
                  }
                }}
              >
                Save Changes
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<CancelIcon />}
                onClick={() => navigate(-1)}
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: 'white'
                  }
                }}
              >
                Cancel
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Navigation Tabs */}
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        variant="scrollable"
        scrollButtons="auto"
        sx={{ 
          mb: 3,
          '& .MuiTabs-indicator': {
            height: 4,
            borderRadius: '4px 4px 0 0',
            background: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)'
          }
        }}
      >
        <Tab 
          label="Personal" 
          icon={<PersonIcon />} 
          iconPosition="start" 
          sx={{ 
            minHeight: 60,
            '&.Mui-selected': { color: '#4facfe' }
          }} 
        />
        <Tab 
          label="Identification" 
          icon={<FingerprintIcon />} 
          iconPosition="start" 
          sx={{ 
            minHeight: 60,
            '&.Mui-selected': { color: '#4facfe' }
          }} 
        />
        <Tab 
          label="Work" 
          icon={<WorkIcon />} 
          iconPosition="start" 
          sx={{ 
            minHeight: 60,
            '&.Mui-selected': { color: '#4facfe' }
          }} 
        />
        <Tab 
          label="Contact" 
          icon={<ContactMailIcon />} 
          iconPosition="start" 
          sx={{ 
            minHeight: 60,
            '&.Mui-selected': { color: '#4facfe' }
          }} 
        />
        <Tab 
          label="Reporting" 
          icon={<ReportIcon />} 
          iconPosition="start" 
          sx={{ 
            minHeight: 60,
            '&.Mui-selected': { color: '#4facfe' }
          }} 
        />
      </Tabs>

      {/* Personal Information Tab */}
      {activeTab === 0 && (
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
          <CardHeader 
            title="Personal Information" 
            avatar={<PersonIcon color="primary" />}
            sx={{ 
              background: 'linear-gradient(45deg, #f5f7fa 0%, #c3cfe2 100%)',
              borderBottom: '1px solid #e0e0e0'
            }}
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Employee Number"
                  name="personal.empId"
                  value={employee.personal?.empId || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  name="personal.dateOfBirth"
                  value={employee.personal?.dateOfBirth?.split('T')[0] || ""}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="personal.firstName"
                  value={employee.personal?.firstName || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Middle Name"
                  name="personal.middleName"
                  value={employee.personal?.middleName || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="personal.lastName"
                  value={employee.personal?.lastName || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="personal.gender"
                    value={employee.personal?.gender || ""}
                    onChange={handleChange}
                    label="Gender"
                    variant="outlined"
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Marital Status</InputLabel>
                  <Select
                    name="personal.maritalStatus"
                    value={employee.personal?.maritalStatus || ""}
                    onChange={handleChange}
                    label="Marital Status"
                    variant="outlined"
                  >
                    <MenuItem value="Unmarried">Unmarried</MenuItem>
                    <MenuItem value="Married">Married</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Nationality</InputLabel>
                  <Select
                    name="personal.nationality"
                    value={employee.personal?.nationality || ""}
                    onChange={handleChange}
                    label="Nationality"
                    variant="outlined"
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 300,
                        },
                      },
                    }}
                  >
                    <MenuItem disabled>
                      <TextField
                        value={nationalitySearch}
                        onChange={handleNationalitySearch}
                        label="Search country"
                        fullWidth
                        variant="standard"
                        sx={{ p: 1 }}
                      />
                    </MenuItem>
                    {filteredNationalities.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Ethnicity</InputLabel>
                  <Select
                    name="personal.ethnicity"
                    value={employee.personal?.ethnicity || ""}
                    onChange={handleChange}
                    label="Ethnicity"
                    variant="outlined"
                  >
                    <MenuItem value="Asian">Asian</MenuItem>
                    <MenuItem value="Hispanic">Hispanic</MenuItem>
                    <MenuItem value="African">African</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Identification Information Tab */}
      {activeTab === 1 && (
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
          <CardHeader 
            title="Identification Information" 
            avatar={<FingerprintIcon color="primary" />}
            sx={{ 
              background: 'linear-gradient(45deg, #f5f7fa 0%, #c3cfe2 100%)',
              borderBottom: '1px solid #e0e0e0'
            }}
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Immigration Status</InputLabel>
                  <Select
                    name="identification.immigrationStatus"
                    value={employee.identification?.immigrationStatus || ""}
                    onChange={handleChange}
                    label="Immigration Status"
                    variant="outlined"
                  >
                    <MenuItem value="Citizen">Citizen</MenuItem>
                    <MenuItem value="Permanent Resident">Permanent Resident</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Personal Tax ID"
                  name="identification.personalTaxId"
                  value={employee.identification?.personalTaxId || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Social Insurance"
                  name="identification.socialInsurance"
                  value={employee.identification?.socialInsurance || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>ID Proof</InputLabel>
                  <Select
                    name="identification.idProof"
                    value={employee.identification?.idProof || ""}
                    onChange={handleChange}
                    label="ID Proof"
                    variant="outlined"
                  >
                    <MenuItem value="Aadhar Card">Aadhar Card</MenuItem>
                    <MenuItem value="Pan Card">Pan Card</MenuItem>
                    <MenuItem value="Driving Licence">Driving Licence</MenuItem>
                    <MenuItem value="Passport">Passport</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {employee.identification?.idProof && employee.identification?.idProof !== "Other" && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Document Number"
                    name="identification.documentNumber"
                    value={employee.identification?.documentNumber || ""}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Grid>
              )}
              {employee.identification?.idProof === "Other" && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Document Name"
                      name="identification.documentName"
                      value={employee.identification?.documentName || ""}
                      onChange={handleChange}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Document Number"
                      name="identification.documentNumber"
                      value={employee.identification?.documentNumber || ""}
                      onChange={handleChange}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Work Information Tab */}
      {activeTab === 2 && (
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
          <CardHeader 
            title="Work Information" 
            avatar={<WorkIcon color="primary" />}
            sx={{ 
              background: 'linear-gradient(45deg, #f5f7fa 0%, #c3cfe2 100%)',
              borderBottom: '1px solid #e0e0e0'
            }}
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Employment Status</InputLabel>
                  <Select
                    name="work.employmentStatus"
                    value={employee.work?.employmentStatus || ""}
                    onChange={handleChange}
                    label="Employment Status"
                    variant="outlined"
                  >
                    <MenuItem value="Full-Time Internship">Full-Time Internship</MenuItem>
                    <MenuItem value="Full-Time Contract">Full-Time Contract</MenuItem>
                    <MenuItem value="Full-Time Permanent">Full-Time Permanent</MenuItem>
                    <MenuItem value="Part-Time Internship">Part-Time Internship</MenuItem>
                    <MenuItem value="Part-Time Contract">Part-Time Contract</MenuItem>
                    <MenuItem value="Part-Time Permanent">Part-Time Permanent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Department"
                  name="work.department"
                  value={employee.work?.department || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Job Title"
                  name="work.jobTitle"
                  value={employee.work?.jobTitle || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Pay Grade"
                  name="work.payGrade"
                  value={employee.work?.payGrade || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date of Joining"
                  type="date"
                  name="work.doj"
                  value={employee.work?.doj?.split('T')[0] || ""}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Termination Date"
                  type="date"
                  name="work.terminationDate"
                  value={employee.work?.terminationDate?.split('T')[0] || ""}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Workstation ID"
                  name="work.workstationId"
                  value={employee.work?.workstationId || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  fullWidth
                  options={timeZones}
                  value={employee.work?.timeZone || ""}
                  onChange={(event, newValue) => {
                    setEmployee(prev => ({
                      ...prev,
                      work: {
                        ...prev.work,
                        timeZone: newValue
                      }
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Time Zone" 
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Shift Start Time"
                  type="time"
                  name="work.shiftStartTime"
                  value={employee.work?.shiftStartTime || ""}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Shift End Time"
                  type="time"
                  name="work.shiftEndTime"
                  value={employee.work?.shiftEndTime || ""}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Contact Information Tab */}
      {activeTab === 3 && (
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
          <CardHeader 
            title="Contact Information" 
            avatar={<ContactMailIcon color="primary" />}
            sx={{ 
              background: 'linear-gradient(45deg, #f5f7fa 0%, #c3cfe2 100%)',
              borderBottom: '1px solid #e0e0e0'
            }}
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: '#3f51b5', mt: 1 }}>
                  Address Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Residential Address"
                  multiline
                  rows={2}
                  name="contact.residentialAddress"
                  value={employee.contact?.residentialAddress || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Permanent Address"
                  multiline
                  rows={2}
                  name="contact.permanentAddress"
                  value={employee.contact?.permanentAddress || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="City"
                  name="contact.city"
                  value={employee.contact?.city || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="State"
                  name="contact.state"
                  value={employee.contact?.state || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Country</InputLabel>
                  <Select
                    name="contact.country"
                    value={employee.contact?.country || ""}
                    onChange={handleChange}
                    label="Country"
                    variant="outlined"
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 300,
                        },
                      },
                    }}
                  >
                    <MenuItem disabled>
                      <TextField
                        value={countrySearch}
                        onChange={handleCountrySearch}
                        label="Search country"
                        fullWidth
                        variant="standard"
                        sx={{ p: 1 }}
                      />
                    </MenuItem>
                    {filteredCountries.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  name="contact.postalCode"
                  value={employee.contact?.postalCode || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: '#3f51b5', mt: 1 }}>
                  Contact Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Work Email"
                  type="email"
                  name="contact.workEmail"
                  value={employee.contact?.workEmail || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Personal Email"
                  type="email"
                  name="contact.personalEmail"
                  value={employee.contact?.personalEmail || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  name="contact.mobileNumber"
                  value={employee.contact?.mobileNumber || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: '#3f51b5', mt: 1 }}>
                  Emergency Contacts
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Primary Emergency Contact Name"
                  name="contact.primaryEmergencyContactName"
                  value={employee.contact?.primaryEmergencyContactName || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Primary Emergency Contact Number"
                  name="contact.primaryEmergencyContactNumber"
                  value={employee.contact?.primaryEmergencyContactNumber || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Relationship to Primary Emergency Contact"
                  name="contact.relationshipToPrimaryEmergencyContact"
                  value={employee.contact?.relationshipToPrimaryEmergencyContact || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Secondary Emergency Contact Name"
                  name="contact.secondaryEmergencyContactName"
                  value={employee.contact?.secondaryEmergencyContactName || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Secondary Emergency Contact Number"
                  name="contact.secondaryEmergencyContactNumber"
                  value={employee.contact?.secondaryEmergencyContactNumber || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Relationship to Secondary Emergency Contact"
                  name="contact.relationshipToSecondaryEmergencyContact"
                  value={employee.contact?.relationshipToSecondaryEmergencyContact || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: '#3f51b5', mt: 1 }}>
                  Medical Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Family Doctor Name"
                  name="contact.familyDoctorName"
                  value={employee.contact?.familyDoctorName || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Family Doctor Contact Number"
                  name="contact.familyDoctorContactNumber"
                  value={employee.contact?.familyDoctorContactNumber || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Reporting Information Tab */}
      {activeTab === 4 && (
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
          <CardHeader 
            title="Reporting Information" 
            avatar={<ReportIcon color="primary" />}
            sx={{ 
              background: 'linear-gradient(45deg, #f5f7fa 0%, #c3cfe2 100%)',
              borderBottom: '1px solid #e0e0e0'
            }}
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Manager"
                  name="report.manager"
                  value={employee.report?.manager || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Indirect Manager"
                  name="report.indirectManager"
                  value={employee.report?.indirectManager || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Level Approver"
                  name="report.firstLevelApprover"
                  value={employee.report?.firstLevelApprover || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Second Level Approver"
                  name="report.secondLevelApprover"
                  value={employee.report?.secondLevelApprover || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Third Level Approver"
                  name="report.thirdLevelApprover"
                  value={employee.report?.thirdLevelApprover || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={4}
                  name="report.note"
                  value={employee.report?.note || ""}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ 
            width: "100%",
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
            borderRadius: '8px'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditEmployee;