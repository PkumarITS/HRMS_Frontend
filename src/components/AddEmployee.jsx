import React, { useState, useEffect } from "react";
import { getNames } from "country-list";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Autocomplete, Container, TextField, MenuItem, Button, Stepper, Step, StepLabel, Box, Typography, Select, InputLabel, FormControl, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";

const steps = ["Personal", "Identification", "Work", "Contact", "Documents","Report"];

const Employee = () => {
  const countryOptions = getNames().map((country) => ({
    label: country,
    value: country,
  }));

  const navigate = useNavigate();


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

  const [notes, setNotes] = useState([]);
  const [isNoteFormVisible, setIsNoteFormVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(countryOptions);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Personal Details
    employeeNumber: "",
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    nationality: "",
    ethnicity: "",
    // Identification Details
    immigrationStatus: "",
    personalTaxId: "",
    socialInsurance: "",
    idProof: "",
    documentName: "",
    documentNumber: "",
    documentFile: null,
    // Work Details
    employmentStatus: "",
    department: "",
    jobTitle: "",
    payGrade: "",
    doj: "",
    terminationDate: "",
    workstationId: "",
    timeZone: "",
    shiftStartTime: "",
    shiftEndTime: "",
    // Contact Details
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
    familyDoctorContactNumber: "",
    // Documents
    passportPhoto: null,
    adharCard: null,
    panCard: null,
    degreeCertificate: null,
    appointmentLetter: null,
    relievingLetter: null,
    experienceLetter: null,
    previousCompanyPaySlip: null,
    // Report Details
    manager: "",
    indirectManager: "",
    firstLevelApprover: "",
    secondLevelApprover: "",
    thirdLevelApprover: "",
    note: "",
  });

  const [errors, setErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleNext = () => {
    const requiredFields = getRequiredFieldsForStep(activeStep);
    const newErrors = validateFields(requiredFields);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSnackbarMessage("Please fill all required fields correctly.");
      setSnackbarOpen(true);
    } else {
      setActiveStep((prevStep) => prevStep + 1);
      setErrors({});
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  const handleFileChange = (event) => {
    const { name, files } = event.target;
    const file = files[0];

    // Validate file size and format
    const allowedFormats = ["image/jpeg", "image/png", "application/pdf"];
    const maxSize = 200 * 1024; // 100KB

    if (!allowedFormats.includes(file.type)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "File format must be JPEG, PNG, or PDF.",
      }));
      return;
    }

    if (file.size > maxSize) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "File size must be less than 100KB.",
      }));
      return;
    }
   
    setFormData((prevData) => ({
      ...prevData,
      [name]: file,
    }));

    // Clear error if validation passes
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearch(query);
    const filtered = countryOptions.filter((option) =>
      option.label.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredOptions(filtered);
  };

  const handleAddNote = () => {
    if (formData.note) {
      setNotes((prev) => [...prev, formData.note]);
      setFormData((prev) => ({ ...prev, note: '' }));
      setIsNoteFormVisible(false);
    }
  };

  const handleDeleteNote = (index) => {
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
  };

  const handleEditNote = (index) => {
    setFormData((prev) => ({ ...prev, note: notes[index] }));
    setIsNoteFormVisible(true);
    handleDeleteNote(index);
  };

  const validateFields = (fields) => {
    const newErrors = {};
    fields.forEach((field) => {
      const value = formData[field];
      if (!value) {
        newErrors[field] = "This field is required.";
      } else if (field === "mobileNumber" && !/^\d{10}$/.test(value)) {
        newErrors[field] = "Mobile number must be 10 digits.";
      } else if (field === "workEmail" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors[field] = "Invalid email address.";
      } else if (field === "postalCode" && !/^\d{6}$/.test(value)) {
        newErrors[field] = "Postal code must be 6 digits.";
      } else if (field === "documentNumber" && formData.idProof === "Aadhar Card" && !/^\d{12}$/.test(value)) {
        newErrors[field] = "Aadhar Card number must be 12 digits.";
      } else if (field === "documentNumber" && formData.idProof === "Pan Card" && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
        newErrors[field] = "PAN Card number must be in the format: AAAAA9999A.";
      } else if (field === "documentNumber" && formData.idProof === "Driving Licence" && !/^[A-Za-z0-9]{16}$/.test(value)) {
        newErrors[field] = "Driving Licence number must be 16 alphanumeric characters.";
      } else if (field === "documentNumber" && formData.idProof === "Passport" && !/^[A-Za-z]{1}\d{7}$/.test(value)) {
        newErrors[field] = "Passport number must be 1 letter followed by 7 digits.";
      } else if (field === "personalTaxId" && !/^\d{10}$/.test(value)) {
        newErrors[field] = "Personal Tax ID must be 10 digits.";
      }
    });
    return newErrors;
  };

   const getRequiredFieldsForStep = (step) => {
    switch (step) {
      case 0:
        return ["employeeNumber", "firstName", "lastName", "dateOfBirth", "gender", "maritalStatus", "nationality"];
      case 1:
        return ["immigrationStatus", "idProof", "documentNumber"];
      case 2:
        return ["employmentStatus", "department", "jobTitle", "doj", "timeZone", "shiftStartTime", "shiftEndTime"];
      case 3:
        return ["residentialAddress", "city", "state", "country", "postalCode", "workEmail", "mobileNumber", "primaryEmergencyContactName", "primaryEmergencyContactNumber", "relationshipToPrimaryEmergencyContact"];
      case 4:
        return ["passportPhoto", "adharCard", "panCard", "degreeCertificate"];
      case 5:
        return ["manager"];
      default:
        return [];
    }
  };

  // const handleSubmit = async () => {
  //   const requiredFields = getRequiredFieldsForStep(activeStep);
  //   const newErrors = validateFields(requiredFields);
  //   if (Object.keys(newErrors).length > 0) {
  //     setErrors(newErrors);
  //     setSnackbarMessage("Please fill all required fields correctly.");
  //     setSnackbarOpen(true);
  //   } else {
  //     try {
  //       const response = await fetch('http://192.168.1.43:8080/api/employees', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
            
  //         },
  //         mode: 'cors' , // Ensure CORS is enabled
  //         body: JSON.stringify(formData),
  //       });
  //       if (!response.ok) {
  //         throw new Error('Network response was not ok');
  //       }
  //       const data = await response.json();
  //       setSnackbarMessage("Form submitted successfully!");
  //       setSnackbarOpen(true);
  //     } catch (error) {
  //       setSnackbarMessage("Failed to submit form.");
  //       setSnackbarOpen(true);
  //     }
  //   }
  // };



  const handleSubmit = async () => {
    navigate("/dashboard/employee", { state: { refresh: true } });
    const data = new FormData();
    data.append("employee", new Blob([JSON.stringify(formData)], { type: "application/json" }));
    if (formData.documentFile) {
      data.append("file", formData.documentFile);
    }
   
    try {
      const response = await fetch("http://localhost:8080/api/employees/add", {
        method: "POST",
        body: data,
        mode: "cors", // Ensures CORS is handled
        credentials: "include", // Required if backend uses authentication
      });
   
      if (response.ok) {
        const result = await response.json();
        alert("Employee added successfully! ID: " + result.id);
      } else {
        alert("Error adding employee.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while submitting the form.");
    }
  };


 

 
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 3, p: 6, borderRadius: 1, boxShadow: 2, bgcolor: "white", maxWidth: "500", height: "auto" }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center" pb={3}>
        Employee
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel onClick={() => setActiveStep(index)}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 2 }}>
        {activeStep === 0 && (
          <>
            <TextField fullWidth margin="normal" label="Employee Number" name="employeeNumber" value={formData.employeeNumber} onChange={handleChange} required error={!!errors.employeeNumber} helperText={errors.employeeNumber} />
            <TextField fullWidth margin="normal" label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required error={!!errors.firstName} helperText={errors.firstName} />
            <TextField fullWidth margin="normal" label="Middle Name" name="middleName" value={formData.middleName} onChange={handleChange} />
            <TextField fullWidth margin="normal" label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required error={!!errors.lastName} helperText={errors.lastName} />
            <TextField fullWidth margin="normal" type="date" label="Date Of Birth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required InputLabelProps={{ shrink: true }} error={!!errors.dateOfBirth} helperText={errors.dateOfBirth} />
            <FormControl fullWidth margin="normal">
              <InputLabel>Gender</InputLabel>
              <Select name="gender" value={formData.gender} onChange={handleChange} label="Gender" required error={!!errors.gender}>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Marital Status</InputLabel>
              <Select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} label="Marital Status" required error={!!errors.maritalStatus}>
                <MenuItem value="Unmarried">Unmarried</MenuItem>
                <MenuItem value="Married">Married</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Nationality</InputLabel>
              <Select name="nationality" value={formData.nationality || ""} onChange={handleChange} label="Nationality" required error={!!errors.nationality}>
                <MenuItem disabled>
                  <TextField value={search} onChange={handleSearchChange} label="Search" fullWidth variant="standard" />
                </MenuItem>
                {filteredOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
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

        {/* Step 2: Identification Information */}
        {activeStep === 1 && (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Immigration Status</InputLabel>
              <Select
                name="immigrationStatus"
                value={formData.immigrationStatus}
                onChange={handleChange}
                label="Immigration Status"
              >
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
              <Select
                name="idProof"
                value={formData.idProof}
                onChange={handleChange}
                label="ID Proof"
                required
              >
                <MenuItem value="Aadhar Card">Aadhar Card</MenuItem>
                <MenuItem value="Pan Card">Pan Card</MenuItem>
                <MenuItem value="Driving Licence">Driving Licence</MenuItem>
                <MenuItem value="Passport">Passport</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            {/* Show Document Number only after selecting an ID Proof */}
            {formData.idProof && formData.idProof !== "Other" && (
              <>
                <TextField
                  fullWidth
                  margin="normal"
                  label={`Enter ${formData.idProof} Number`}
                  name="documentNumber"
                  value={formData.documentNumber}
                  onChange={handleChange}
                  required
                  inputProps={{
                    maxLength:
                      formData.idProof === "Aadhar Card" ? 12 :
                      formData.idProof === "Pan Card" ? 10 :
                      formData.idProof === "Driving Licence" ? 16 :
                      formData.idProof === "Passport" ? 8 : 20, // Default max length
                  }}
                  helperText={
                    formData.idProof === "Aadhar Card"
                      ? "Aadhar Number must be 12 digits"
                      : formData.idProof === "Pan Card"
                      ? "PAN Number must be 10 characters"
                      : formData.idProof === "Driving Licence"
                      ? "Driving Licence Number must be 16 characters"
                      : formData.idProof === "Passport"
                      ? "Passport Number must be 8 characters"
                      : ""
                  }
                />
              </>
            )}

            {/* If "Other" is selected, show Document Name and Document Number */}
            {formData.idProof === "Other" && (
              <>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Document Name"
                  name="documentName"
                  value={formData.documentName}
                  onChange={handleChange}
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Document Number"
                  name="documentNumber"
                  value={formData.documentNumber}
                  onChange={handleChange}
                  required
                />
              </>
            )}

            {/* File Upload Section */}
            {formData.idProof && (
              <>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
                      if (allowedTypes.includes(file.type)) {
                        setFormData({ ...formData, documentFile: file });
                      } else {
                        alert("Invalid file format. Only JPG, PNG, and PDF are allowed.");
                        e.target.value = ""; // Reset file input
                      }
                    }
                  }}
                />
              </>
            )}
          </>
        )}

        {/* Step 3: Work Information */}
        {activeStep === 2 && (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Employment Status</InputLabel>
              <Select
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleChange}
                label="Employment Status"
              >
                <MenuItem value="Full-Time Internship">Full-Time Internship</MenuItem>
                <MenuItem value="Full-Time Contract">Full-Time Contract</MenuItem>
                <MenuItem value="Full-Time Permanent">Full-Time Permanent</MenuItem>
                <MenuItem value="Part-Time Internship">Part-Time Internship</MenuItem>
                <MenuItem value="Part-Time Contract">Part-Time Contract</MenuItem>
                <MenuItem value="Part-Time Permanent">Part-Time Permanent</MenuItem>
              </Select>
            </FormControl>

            <TextField fullWidth margin="normal" label="Department" name="department" value={formData.department} onChange={handleChange} required />
            <TextField fullWidth margin="normal" label="Job Title" name="jobTitle" value={formData.jobTitle} onChange={handleChange} required />
            <TextField fullWidth margin="normal" label="Pay Grade" name="payGrade" value={formData.payGrade} onChange={handleChange} />
            <TextField fullWidth margin="normal" label="Date Of Joining" name="doj" type="date" value={formData.doj} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            <TextField fullWidth margin="normal" label="Termination Date" name="terminationDate" type="date" value={formData.terminationDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            <TextField fullWidth margin="normal" label="Workstation ID" name="workstationId" value={formData.workstationId} onChange={handleChange} />
            <Autocomplete
              fullWidth
              options={timeZones}
              renderInput={(params) => (
                <TextField {...params} label="Time Zone" margin="normal" required />
              )}
              value={formData.timeZone}
              onChange={(event, newValue) =>
                setFormData({ ...formData, timeZone: newValue })
              }
            />
            <TextField fullWidth margin="normal" label="Shift Start Time" name="shiftStartTime" type="time" value={formData.shiftStartTime} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            <TextField fullWidth margin="normal" label="Shift End Time" name="shiftEndTime" type="time" value={formData.shiftEndTime} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          </>
        )}

        {/* Step 4: Contact Information */}
        {activeStep === 3 && (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="Residential Address"
              name="residentialAddress"
              value={formData.residentialAddress}
              onChange={handleChange} required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Permanent Address"
              name="permanentAddress"
              value={formData.permanentAddress}
              onChange={handleChange} 
            />

            {/* Additional Fields */}
            <TextField
              fullWidth
              margin="normal"
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange} required
            />
            <TextField
              fullWidth
              margin="normal"
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange} required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Country</InputLabel>
              <Select
                name="country"
                value={formData.country || ""}
                onChange={handleChange}
                label="Country"
                required
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 300, // Optional: Control the dropdown height
                    },
                  },
                }}
              >
                {/* TextField for search functionality */}
                <MenuItem disabled>
                  <TextField
                    value={search}
                    onChange={handleSearchChange}
                    label="Search"
                    fullWidth
                    variant="standard"
                  />
                </MenuItem>

                {/* Render filtered options */}
                {filteredOptions.map((option) => (
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
              onChange={handleChange} required
            />

            <TextField
              fullWidth
              margin="normal"
              label="Work Email"
              name="workEmail"
              value={formData.workEmail}
              onChange={handleChange} required
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
              onChange={handleChange} required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Primary Emergency Contact Name"
              name="primaryEmergencyContactName"
              value={formData.primaryEmergencyContactName}
              onChange={handleChange} required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Primary Emergency Contact Number"
              name="primaryEmergencyContactNumber"
              value={formData.primaryEmergencyContactNumber}
              onChange={handleChange} required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Relationship to  Primary Emergency Contact"
              name="relationshipToPrimaryEmergencyContact"
              value={formData.relationshipToPrimaryEmergencyContact}
              onChange={handleChange} required
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
              label="Relationship to  Secondary Emergency Contact"
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

        {/* Step 5: Documents */}
        {activeStep === 4 && (
          <>
            <Typography variant="h6" gutterBottom>
              Upload Required Documents
            </Typography>
            <Box sx={{ mt: 2 }}> 
              <TextField
                fullWidth
                margin="normal"
                type="file"
                label="Passport Photo"
                name="passportPhoto"
                onChange={handleFileChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.passportPhoto}
                helperText={errors.passportPhoto}
              />
              <TextField
                fullWidth
                margin="normal"
                type="file"
                label="Aadhar Card"
                name="adharCard"
                onChange={handleFileChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.adharCard}
                helperText={errors.adharCard}
              />
              <TextField
                fullWidth
                margin="normal"
                type="file"
                label="PAN Card"
                name="panCard"
                onChange={handleFileChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.panCard}
                helperText={errors.panCard}
              />
              <TextField
                fullWidth
                margin="normal"
                type="file"
                label="Degree Certificate"
                name="degreeCertificate"
                onChange={handleFileChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.degreeCertificate}
                helperText={errors.degreeCertificate}
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
            </Box>
          </>
        )}


        {/* Step 6: Report Information */}
        {activeStep === 5 && (
           <Box sx={{ padding: 3 }}>
           <FormControl fullWidth margin="normal">
             <InputLabel>Manager</InputLabel>
             <Select
               name="manager"
               value={formData.manager}
               onChange={handleChange}
               label="Manager"
             >
               <MenuItem value="Manager 1">Manager 1</MenuItem>
               <MenuItem value="Manager 2">Manager 2</MenuItem>
               <MenuItem value="Manager 3">Manager 3</MenuItem>
             </Select>
           </FormControl>
     
           <FormControl fullWidth margin="normal">
             <InputLabel>Indirect Manager</InputLabel>
             <Select
               name="indirectManager"
               value={formData.indirectManager}
               onChange={handleChange}
               label="Indirect Manager"
             >
               <MenuItem value="Indirect Manager 1">Indirect Manager 1</MenuItem>
               <MenuItem value="Indirect Manager 2">Indirect Manager 2</MenuItem>
               <MenuItem value="Indirect Manager 3">Indirect Manager 3</MenuItem>
             </Select>
           </FormControl>
     
           <FormControl fullWidth margin="normal">
             <InputLabel>First Level Approver</InputLabel>
             <Select
               name="firstLevelApprover"
               value={formData.firstLevelApprover}
               onChange={handleChange}
               label="First Level Approver"
             >
               <MenuItem value="Approver 1">Approver 1</MenuItem>
               <MenuItem value="Approver 2">Approver 2</MenuItem>
               <MenuItem value="Approver 3">Approver 3</MenuItem>
             </Select>
           </FormControl>
     
           <FormControl fullWidth margin="normal">
             <InputLabel>Second Level Approver</InputLabel>
             <Select
               name="secondLevelApprover"
               value={formData.secondLevelApprover}
               onChange={handleChange}
               label="Second Level Approver"
             >
               <MenuItem value="Approver 1">Approver 1</MenuItem>
               <MenuItem value="Approver 2">Approver 2</MenuItem>
               <MenuItem value="Approver 3">Approver 3</MenuItem>
             </Select>
           </FormControl>
     
           <FormControl fullWidth margin="normal">
             <InputLabel>Third Level Approver</InputLabel>
             <Select
               name="thirdLevelApprover"
               value={formData.thirdLevelApprover}
               onChange={handleChange}
               label="Third Level Approver"
             >
               <MenuItem value="Approver 1">Approver 1</MenuItem>
               <MenuItem value="Approver 2">Approver 2</MenuItem>
               <MenuItem value="Approver 3">Approver 3</MenuItem>
             </Select>
           </FormControl>
     
           <Button
             variant="contained"
             color="primary"
             onClick={() => setIsNoteFormVisible(true)}
             sx={{ mt: 2 }}
           >
             Add Note
           </Button>
     
           {isNoteFormVisible && (
             <Box sx={{ mt: 2 }}>
               <TextField
                 fullWidth
                 name="note"
                 value={formData.note}
                 onChange={handleChange}
                 label="Note"
                 multiline
                 rows={4}
                 margin="normal"
               />
               <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                 <Button onClick={handleAddNote} variant="contained" color="secondary">
                   Save
                 </Button>
                 <Button onClick={() => setIsNoteFormVisible(false)} variant="outlined">
                   Cancel
                 </Button>
               </Box>
             </Box>
           )}
     
           <Table sx={{ mt: 3 }}>
             <TableHead>
               <TableRow>
                 <TableCell>Note</TableCell>
                 <TableCell>Action</TableCell>
               </TableRow>
             </TableHead>
             <TableBody>
               {notes.map((note, index) => (
                 <TableRow key={index}>
                   <TableCell>{note}</TableCell>
                   <TableCell>
                     <IconButton onClick={() => handleEditNote(index)} color="primary">
                       <EditIcon />
                     </IconButton>
                     <IconButton onClick={() => handleDeleteNote(index)} color="secondary">
                       <DeleteIcon />
                     </IconButton>
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </Box>
        )}


        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
          {activeStep > 0 && (
            <Button variant="contained" color="primary" onClick={handleBack}>
              Previous
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" color="primary" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button variant="contained" color="success" onClick={handleSubmit}>
              Save
            </Button>
          )}
        </Box>
      </Box>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={Object.keys(errors).length > 0 ? "error" : "success"} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Employee;