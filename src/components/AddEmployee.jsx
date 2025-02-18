import React, { useState } from "react";
import ReactSelect from "react-select";
// import countryList from "country-list";
import { getNames } from "country-list";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { Autocomplete, Container, TextField, MenuItem, Button, Stepper, Step, StepLabel, Box, Typography, Select, InputLabel, FormControl ,IconButton, Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";

const steps = ["Personal", "Identification", "Work", "Contact", "Report"];

const Employee = () => {
  // Generate country options from country-list library
  const countryOptions = getNames().map((country) => ({
    label: country,
    value: country,
  }));


  const [notes, setNotes] = useState([]);
  const [isNoteFormVisible, setIsNoteFormVisible] = useState(false);


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

  
  const [search, setSearch] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(countryOptions);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
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
    // Work Details
    employmentStatus: "",
    department: "",
    jobTitle: "",
    payGrade: "",
    doj: "",
    terminationDate: "",
    workstationId: "",
    timeZone: "",
    
    // Contact Details
    residentialAddress: "",
    permanentAddress: "",
    city: "",
    state: "",
    country: "",
    postalCode:"",
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
    // Report Details
    manager: "",
    indirectManager: "",
    firstLevelApprover: "",
    secondLevelApprover: "",
    thirdLevelApprover: "",
    note: "",
  });


  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // const handleChange = (event) => {
  //   setFormData({ ...formData, [event.target.name]: event.target.value });
  // };








  // Handle dropdown selection
  // const handleChange = (event, selectedOption) => {
  //   setFormData({
  //     ...formData,
  //     [event.target.name]: event.target.value,
  //     nationality: selectedOption ? selectedOption.value : event.target.value, // Ensuring nationality gets updated
  //   });
  // };
  // const handleChange = (selectedOption, action) => {
  //   setFormData({
  //     ...formData,
  //     [action.name]: selectedOption ? selectedOption.value : "",
  //   });
  // };

  // const handleChange = (event) => {
  //   const { name, value } = event.target;
  //   setFormData({
  //     ...formData,
  //     [name]: value,
  //   });
  // };

  // const handleChange = (event) => {
  //   const { name, value } = event.target;
  //   setFormData({
      
  //     ...formData,
  //     [name]: value,
  //     nationality: event.target.value,
      
  //   });
  // };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value, // Update only the field that triggered the event
    }));
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

  return (



    <Container maxWidth="md" sx={{ mt: 3, p: 6, borderRadius: 1, boxShadow: 2, bgcolor: "white", maxWidth: "500", height: "auto" }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Employee
      </Typography>

      {/* Stepper */}
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel onClick={() => setActiveStep(index)}>{label}</StepLabel>
          </Step>

        ))}
      </Stepper>


      <Box sx={{ mt: 2 }}>
        {/* Step 1: Personal Information */}
        {activeStep === 0 && (
          <>
            <TextField fullWidth margin="normal" label="Employee Number" name="employeeNumber" value={formData.employeeNumber} onChange={handleChange} required />
            <TextField fullWidth margin="normal" label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
            <TextField fullWidth margin="normal" label="Middle Name" name="middleName" value={formData.middleName} onChange={handleChange} />
            <TextField fullWidth margin="normal" label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />



            <TextField fullWidth margin="normal" type="date" label="Date Of Birth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required InputLabelProps={{ shrink: true }} />

            <FormControl fullWidth margin="normal">
              <InputLabel>Gender</InputLabel>
              <Select name="gender" value={formData.gender} onChange={handleChange} label="Gender" required>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Marital Status</InputLabel>
              <Select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} label="Marital Status" required>
                <MenuItem value="Unmarried">Unmarried</MenuItem>
                <MenuItem value="Married">Married</MenuItem>
              </Select>
            </FormControl>
            {/* <FormControl fullWidth margin="normal">
      <InputLabel>Nationality</InputLabel>
      <Select
        name="nationality"
        value={formData.nationality || ""}
        onChange={handleChange}
        label="Nationality"
      >
        {countryOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl> */}



            <FormControl fullWidth margin="normal">
              <InputLabel>Nationality</InputLabel>
              <Select
                name="nationality"
                value={formData.nationality || ""}
                onChange={handleChange}
                label="Nationality"
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


        {/* Placeholder for future steps */}
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
            {/* <TextField fullWidth margin="normal" label="Time Zone" name="timeZone" value={formData.timeZone} onChange={handleChange} required /> */}

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
            {/* <TextField
              fullWidth
              margin="normal"
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange} required
            /> */}

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

    {/* Step 5: Report Information */}
        {activeStep === 4 && (
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


        {/* Buttons */}
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
            <Button variant="contained" color="success">
              Save
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default Employee;
