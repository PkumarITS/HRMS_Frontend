import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Avatar,
  Grid,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLocation, useNavigate } from "react-router-dom";

const EmployeeDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(location.state?.employeeData || {});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [activeSection, setActiveSection] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(formData.passportPhoto || null);

  // Handle case where location.state is not available
  if (!location.state?.employeeData) {
    return (
      <Container maxWidth="md" sx={{ mt: 3, p: 6, borderRadius: 1, boxShadow: 2, bgcolor: "white" }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Employee Details
        </Typography>
        <Typography variant="body1" color="error">
          No employee data found. Please go back and try again.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate("/dashboard")} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  const employeeData = location.state.employeeData;

  const handleClickOpen = (section) => {
    setActiveSection(section);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setActiveSection(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // Update the employeeData with the new formData
    Object.assign(employeeData, formData);
    setSnackbarMessage("Employee details updated successfully!");
    setSnackbarOpen(true);
    handleClose();
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleProfilePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setFormData((prevData) => ({
        ...prevData,
        passportPhoto: file,
      }));
    }
  };

  const handleRemoveProfilePhoto = () => {
    setProfilePhoto(null);
    setFormData((prevData) => ({
      ...prevData,
      passportPhoto: null,
    }));
  };

  const handleDownload = (document) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(document);
    link.download = document.name;
    link.click();
  };

  const handlePreview = (document) => {
    window.open(URL.createObjectURL(document), "_blank");
  };

  return (
    <Container maxWidth="md" sx={{ mt: 3, p: 6, borderRadius: 1, boxShadow: 2, bgcolor: "white" }}>
      {/* Employee Profile Section */}
      <Card sx={{ mb: 4, p: 3, bgcolor: "#f5f5f5", borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => handleClickOpen("profile")}>
          <Avatar
            alt={employeeData.firstName}
            src={profilePhoto ? URL.createObjectURL(profilePhoto) : ""}
            sx={{ width: 100, height: 100, mr: 3 }}
          />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {employeeData.firstName} {employeeData.lastName}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <BadgeIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="body1" fontSize="1.1rem">
                {employeeData.employeeNumber}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <EmailIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="body1" fontSize="1.1rem">
                {employeeData.workEmail}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="body1" fontSize="1.1rem">
                {employeeData.department}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Personal Information */}
      <Card sx={{ mb: 4 }}>
        <CardHeader
          title="Personal Information"
          action={
            <IconButton onClick={() => handleClickOpen("personal")}>
              <EditIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
          <TableContainer>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Employee Number</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.employeeNumber}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>First Name</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.firstName}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Middle Name</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.middleName}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Last Name</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.lastName}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Date of Birth</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.dateOfBirth}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Gender</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.gender}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Marital Status</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.maritalStatus}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Nationality</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.nationality}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Ethnicity</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.ethnicity}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Identification Information */}
      <Card sx={{ mb: 4 }}>
        <CardHeader
          title="Identification Information"
          action={
            <IconButton onClick={() => handleClickOpen("identification")}>
              <EditIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
          <TableContainer>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Immigration Status</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.immigrationStatus}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Personal Tax ID</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.personalTaxId}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Social Insurance</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.socialInsurance}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>ID Proof</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.idProof}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Document Number</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.documentNumber}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Work Information */}
      <Card sx={{ mb: 4 }}>
        <CardHeader
          title="Work Information"
          action={
            <IconButton onClick={() => handleClickOpen("work")}>
              <EditIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
          <TableContainer>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Employment Status</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.employmentStatus}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Department</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.department}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Job Title</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.jobTitle}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Pay Grade</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.payGrade}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Date of Joining</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.doj}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Termination Date</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.terminationDate}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Workstation ID</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.workstationId}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Time Zone</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.timeZone}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card sx={{ mb: 4 }}>
        <CardHeader
          title="Contact Information"
          action={
            <IconButton onClick={() => handleClickOpen("contact")}>
              <EditIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
          <TableContainer>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Residential Address</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.residentialAddress}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Permanent Address</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.permanentAddress}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>City</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.city}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>State</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.state}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Country</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.country}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Postal Code</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.postalCode}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Work Email</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.workEmail}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Personal Email</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.personalEmail}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Mobile Number</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.mobileNumber}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Primary Emergency Contact Name</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.primaryEmergencyContactName}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Primary Emergency Contact Number</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.primaryEmergencyContactNumber}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Relationship to Primary Emergency Contact</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.relationshipToPrimaryEmergencyContact}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Secondary Emergency Contact Name</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.secondaryEmergencyContactName}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Secondary Emergency Contact Number</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.secondaryEmergencyContactNumber}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Relationship to Secondary Emergency Contact</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.relationshipToSecondaryEmergencyContact}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Family Doctor Name</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.familyDoctorName}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Family Doctor Contact Number</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.familyDoctorContactNumber}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Documents Section */}
      <Card sx={{ mb: 4 }}>
        <CardHeader
          title="Documents"
          action={
            <IconButton onClick={() => handleClickOpen("documents")}>
              <EditIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Document Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employeeData.passportPhoto && (
                  <TableRow>
                    <TableCell sx={{ fontSize: "1.1rem" }}>Passport Photo</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handlePreview(employeeData.passportPhoto)}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDownload(employeeData.passportPhoto)}>
                        <DownloadIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )}
                {employeeData.adharCard && (
                  <TableRow>
                    <TableCell sx={{ fontSize: "1.1rem" }}>Aadhar Card</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handlePreview(employeeData.adharCard)}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDownload(employeeData.adharCard)}>
                        <DownloadIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )}
                {employeeData.panCard && (
                  <TableRow>
                    <TableCell sx={{ fontSize: "1.1rem" }}>PAN Card</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handlePreview(employeeData.panCard)}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDownload(employeeData.panCard)}>
                        <DownloadIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )}
                {employeeData.degreeCertificate && (
                  <TableRow>
                    <TableCell sx={{ fontSize: "1.1rem" }}>Degree Certificate</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handlePreview(employeeData.degreeCertificate)}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDownload(employeeData.degreeCertificate)}>
                        <DownloadIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )}
                {employeeData.appointmentLetter && (
                  <TableRow>
                    <TableCell sx={{ fontSize: "1.1rem" }}>Appointment Letter</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handlePreview(employeeData.appointmentLetter)}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDownload(employeeData.appointmentLetter)}>
                        <DownloadIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )}
                {employeeData.relievingLetter && (
                  <TableRow>
                    <TableCell sx={{ fontSize: "1.1rem" }}>Relieving Letter</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handlePreview(employeeData.relievingLetter)}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDownload(employeeData.relievingLetter)}>
                        <DownloadIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )}
                {employeeData.experienceLetter && (
                  <TableRow>
                    <TableCell sx={{ fontSize: "1.1rem" }}>Experience Letter</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handlePreview(employeeData.experienceLetter)}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDownload(employeeData.experienceLetter)}>
                        <DownloadIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )}
                {employeeData.previousCompanyPaySlip && (
                  <TableRow>
                    <TableCell sx={{ fontSize: "1.1rem" }}>Previous Company Pay Slip</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handlePreview(employeeData.previousCompanyPaySlip)}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDownload(employeeData.previousCompanyPaySlip)}>
                        <DownloadIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Report Information */}
      <Card sx={{ mb: 4 }}>
        <CardHeader
          title="Report Information"
          action={
            <IconButton onClick={() => handleClickOpen("report")}>
              <EditIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
          <TableContainer>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Manager</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.manager}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Indirect Manager</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.indirectManager}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>First Level Approver</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.firstLevelApprover}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Second Level Approver</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.secondLevelApprover}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Third Level Approver</TableCell>
                  <TableCell sx={{ fontSize: "1.1rem" }}>{employeeData.thirdLevelApprover}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Edit Dialogs */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit {activeSection}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {activeSection === "profile" && (
              <>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Avatar
                    alt={employeeData.firstName}
                    src={profilePhoto ? URL.createObjectURL(profilePhoto) : ""}
                    sx={{ width: 100, height: 100, mr: 3 }}
                  />
                  <Box>
                    <Button variant="contained" component="label" startIcon={<AddAPhotoIcon />}>
                      Upload Photo
                      <input type="file" hidden onChange={handleProfilePhotoChange} accept="image/*" />
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleRemoveProfilePhoto}
                      sx={{ ml: 2 }}
                    >
                      Remove Photo
                    </Button>
                  </Box>
                </Box>
              </>
            )}
            {activeSection === "personal" && (
              <>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Employee Number"
                  name="employeeNumber"
                  value={formData.employeeNumber}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Middle Name"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  type="date"
                  label="Date Of Birth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Gender</InputLabel>
                  <Select name="gender" value={formData.gender} onChange={handleChange} label="Gender">
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Marital Status</InputLabel>
                  <Select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} label="Marital Status">
                    <MenuItem value="Unmarried">Unmarried</MenuItem>
                    <MenuItem value="Married">Married</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Nationality</InputLabel>
                  <Select name="nationality" value={formData.nationality} onChange={handleChange} label="Nationality">
                    <MenuItem value="Indian">Indian</MenuItem>
                    <MenuItem value="American">American</MenuItem>
                    <MenuItem value="British">British</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Ethnicity</InputLabel>
                  <Select name="ethnicity" value={formData.ethnicity} onChange={handleChange} label="Ethnicity">
                    <MenuItem value="Asian">Asian</MenuItem>
                    <MenuItem value="Hispanic">Hispanic</MenuItem>
                    <MenuItem value="African">African</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
            {activeSection === "identification" && (
              <>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Immigration Status</InputLabel>
                  <Select name="immigrationStatus" value={formData.immigrationStatus} onChange={handleChange} label="Immigration Status">
                    <MenuItem value="Citizen">Citizen</MenuItem>
                    <MenuItem value="Permanent Resident">Permanent Resident</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Personal Tax ID"
                  name="personalTaxId"
                  value={formData.personalTaxId}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Social Insurance"
                  name="socialInsurance"
                  value={formData.socialInsurance}
                  onChange={handleChange}
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>ID Proof</InputLabel>
                  <Select name="idProof" value={formData.idProof} onChange={handleChange} label="ID Proof">
                    <MenuItem value="Aadhar Card">Aadhar Card</MenuItem>
                    <MenuItem value="Pan Card">Pan Card</MenuItem>
                    <MenuItem value="Driving Licence">Driving Licence</MenuItem>
                    <MenuItem value="Passport">Passport</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Document Number"
                  name="documentNumber"
                  value={formData.documentNumber}
                  onChange={handleChange}
                />
              </>
            )}
            {activeSection === "work" && (
              <>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Employment Status</InputLabel>
                  <Select name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} label="Employment Status">
                    <MenuItem value="Full-Time Internship">Full-Time Internship</MenuItem>
                    <MenuItem value="Full-Time Contract">Full-Time Contract</MenuItem>
                    <MenuItem value="Full-Time Permanent">Full-Time Permanent</MenuItem>
                    <MenuItem value="Part-Time Internship">Part-Time Internship</MenuItem>
                    <MenuItem value="Part-Time Contract">Part-Time Contract</MenuItem>
                    <MenuItem value="Part-Time Permanent">Part-Time Permanent</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Job Title"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Pay Grade"
                  name="payGrade"
                  value={formData.payGrade}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  type="date"
                  label="Date Of Joining"
                  name="doj"
                  value={formData.doj}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  type="date"
                  label="Termination Date"
                  name="terminationDate"
                  value={formData.terminationDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Workstation ID"
                  name="workstationId"
                  value={formData.workstationId}
                  onChange={handleChange}
                />
                <Autocomplete
                  fullWidth
                  options={timeZones}
                  renderInput={(params) => (
                    <TextField {...params} label="Time Zone" margin="normal" />
                  )}
                  value={formData.timeZone}
                  onChange={(event, newValue) =>
                    setFormData({ ...formData, timeZone: newValue })
                  }
                />
              </>
            )}
            {activeSection === "contact" && (
              <>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Residential Address"
                  name="residentialAddress"
                  value={formData.residentialAddress}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Permanent Address"
                  name="permanentAddress"
                  value={formData.permanentAddress}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Country</InputLabel>
                  <Select name="country" value={formData.country} onChange={handleChange} label="Country">
                    {countryOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Postal Code"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Work Email"
                  name="workEmail"
                  value={formData.workEmail}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Personal Email"
                  name="personalEmail"
                  value={formData.personalEmail}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Mobile Number"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Primary Emergency Contact Name"
                  name="primaryEmergencyContactName"
                  value={formData.primaryEmergencyContactName}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Primary Emergency Contact Number"
                  name="primaryEmergencyContactNumber"
                  value={formData.primaryEmergencyContactNumber}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Relationship to Primary Emergency Contact"
                  name="relationshipToPrimaryEmergencyContact"
                  value={formData.relationshipToPrimaryEmergencyContact}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Secondary Emergency Contact Name"
                  name="secondaryEmergencyContactName"
                  value={formData.secondaryEmergencyContactName}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Secondary Emergency Contact Number"
                  name="secondaryEmergencyContactNumber"
                  value={formData.secondaryEmergencyContactNumber}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Relationship to Secondary Emergency Contact"
                  name="relationshipToSecondaryEmergencyContact"
                  value={formData.relationshipToSecondaryEmergencyContact}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Family Doctor Name"
                  name="familyDoctorName"
                  value={formData.familyDoctorName}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Family Doctor Contact Number"
                  name="familyDoctorContactNumber"
                  value={formData.familyDoctorContactNumber}
                  onChange={handleChange}
                />
              </>
            )}
            {activeSection === "documents" && (
              <>
                <TextField
                  fullWidth
                  margin="normal"
                  type="file"
                  label="Passport Photo"
                  name="passportPhoto"
                  onChange={handleFileChange}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  type="file"
                  label="Aadhar Card"
                  name="adharCard"
                  onChange={handleFileChange}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  type="file"
                  label="PAN Card"
                  name="panCard"
                  onChange={handleFileChange}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  type="file"
                  label="Degree Certificate"
                  name="degreeCertificate"
                  onChange={handleFileChange}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  type="file"
                  label="Appointment Letter"
                  name="appointmentLetter"
                  onChange={handleFileChange}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  type="file"
                  label="Relieving Letter"
                  name="relievingLetter"
                  onChange={handleFileChange}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  type="file"
                  label="Experience Letter"
                  name="experienceLetter"
                  onChange={handleFileChange}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  type="file"
                  label="Previous Company Pay Slip"
                  name="previousCompanyPaySlip"
                  onChange={handleFileChange}
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}
            {activeSection === "report" && (
              <>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Manager</InputLabel>
                  <Select name="manager" value={formData.manager} onChange={handleChange} label="Manager">
                    <MenuItem value="Manager 1">Manager 1</MenuItem>
                    <MenuItem value="Manager 2">Manager 2</MenuItem>
                    <MenuItem value="Manager 3">Manager 3</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Indirect Manager</InputLabel>
                  <Select name="indirectManager" value={formData.indirectManager} onChange={handleChange} label="Indirect Manager">
                    <MenuItem value="Indirect Manager 1">Indirect Manager 1</MenuItem>
                    <MenuItem value="Indirect Manager 2">Indirect Manager 2</MenuItem>
                    <MenuItem value="Indirect Manager 3">Indirect Manager 3</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel>First Level Approver</InputLabel>
                  <Select name="firstLevelApprover" value={formData.firstLevelApprover} onChange={handleChange} label="First Level Approver">
                    <MenuItem value="Approver 1">Approver 1</MenuItem>
                    <MenuItem value="Approver 2">Approver 2</MenuItem>
                    <MenuItem value="Approver 3">Approver 3</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Second Level Approver</InputLabel>
                  <Select name="secondLevelApprover" value={formData.secondLevelApprover} onChange={handleChange} label="Second Level Approver">
                    <MenuItem value="Approver 1">Approver 1</MenuItem>
                    <MenuItem value="Approver 2">Approver 2</MenuItem>
                    <MenuItem value="Approver 3">Approver 3</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Third Level Approver</InputLabel>
                  <Select name="thirdLevelApprover" value={formData.thirdLevelApprover} onChange={handleChange} label="Third Level Approver">
                    <MenuItem value="Approver 1">Approver 1</MenuItem>
                    <MenuItem value="Approver 2">Approver 2</MenuItem>
                    <MenuItem value="Approver 3">Approver 3</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EmployeeDetails;