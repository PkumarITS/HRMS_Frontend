import React, { useState } from "react";
import { getNames } from "country-list";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { 
  Autocomplete, 
  Container, 
  TextField, 
  MenuItem, 
  Button, 
  Stepper, 
  Step, 
  StepLabel, 
  Box, 
  Typography, 
  Select, 
  InputLabel, 
  FormControl, 
  IconButton, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  Snackbar, 
  Alert,
  CircularProgress
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const steps = ["Personal", "Identification", "Work", "Contact", "Report"];

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

  const [errors, setErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = Cookies.get("token");

  const handleNext = () => {
    const requiredFields = getRequiredFieldsForStep(activeStep);
    const newErrors = validateFields(requiredFields);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showSnackbar("Please fill all required fields correctly.", "error");
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
    const [section, field] = name.includes('.') ? name.split('.') : [activeStep === 0 ? 'personal' : 
                                 activeStep === 1 ? 'identification' : 
                                 activeStep === 2 ? 'work' : 
                                 activeStep === 3 ? 'contact' : 'report', name];
    
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));

    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
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
    if (formData.report.note) {
      setNotes(prev => [...prev, formData.report.note]);
      setFormData(prev => ({ 
        ...prev, 
        report: { ...prev.report, note: '' } 
      }));
      setIsNoteFormVisible(false);
    }
  };

  const handleDeleteNote = (index) => {
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
  };

  const handleEditNote = (index) => {
    setFormData(prev => ({ 
      ...prev, 
      report: { ...prev.report, note: notes[index] } 
    }));
    setIsNoteFormVisible(true);
    handleDeleteNote(index);
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const validateFields = (fields) => {
    const newErrors = {};
    fields.forEach(field => {
      const [section, fieldName] = field.includes('.') ? field.split('.') : 
        [activeStep === 0 ? 'personal' : 
         activeStep === 1 ? 'identification' : 
         activeStep === 2 ? 'work' : 
         activeStep === 3 ? 'contact' : 'report', field];
      
      const value = formData[section][fieldName];
      
      // Skip validation for optional fields when empty
      const optionalFields = [
        'middleName', 'personalEmail', 'secondaryEmergencyContactNumber',
        'familyDoctorContactNumber', 'personalTaxId', 'socialInsurance',
        'documentName', 'permanentAddress', 'ethnicity', 'payGrade',
        'workstationId', 'terminationDate', 'shiftStartTime', 'shiftEndTime',
        'indirectManager', 'firstLevelApprover', 'secondLevelApprover', 'thirdLevelApprover'
      ];
      
      if (!value && !optionalFields.includes(fieldName)) {
        newErrors[field] = "This field is required.";
        return;
      }

      switch (fieldName) {
        case "mobileNumber":
        case "primaryEmergencyContactNumber":
          if (!/^\d{10,15}$/.test(value)) {
            newErrors[field] = "Must be 10-15 digits";
          }
          break;
        case "secondaryEmergencyContactNumber":
        case "familyDoctorContactNumber":
          if (value && !/^\d{10,15}$/.test(value)) {
            newErrors[field] = "Must be 10-15 digits if provided";
          }
          break;
        case "workEmail":
        case "personalEmail":
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            newErrors[field] = "Invalid email format";
          }
          break;
        case "postalCode":
          if (!/^[a-zA-Z0-9\s-]{3,10}$/.test(value)) {
            newErrors[field] = "Invalid postal code";
          }
          break;
        case "documentNumber":
          validateDocumentNumber(newErrors, field, value);
          break;
        case "personalTaxId":
          if (value && !/^\d{10}$/.test(value)) {
            newErrors[field] = "Must be exactly 10 digits if provided";
          }
          break;
      }
    });
    return newErrors;
  };

  const validateDocumentNumber = (errors, field, value) => {
    const idProof = formData.identification.idProof;
    
    if (!idProof) return;

    switch (idProof) {
      case "Aadhar Card":
        if (!/^\d{12}$/.test(value)) {
          errors[field] = "Aadhar must be 12 digits";
        }
        break;
      case "Pan Card":
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
          errors[field] = "Invalid PAN format (AAAAA9999A)";
        }
        break;
      case "Driving Licence":
        if (!/^[A-Za-z0-9]{16}$/.test(value)) {
          errors[field] = "DL must be 16 alphanumeric chars";
        }
        break;
      case "Passport":
        if (!/^[A-Za-z]{1}\d{7}$/.test(value)) {
          errors[field] = "Passport must be 1 letter + 7 digits";
        }
        break;
      case "Other":
        if (!value) {
          errors[field] = "Document number required";
        }
        break;
    }
  };

  const getRequiredFieldsForStep = (step) => {
    switch (step) {
      case 0: // Personal
        return [
          "personal.empId", 
          "personal.firstName", 
          "personal.lastName", 
          "personal.dateOfBirth", 
          "personal.gender", 
          "personal.maritalStatus", 
          "personal.nationality"
        ];
      case 1: // Identification
        return [
          "identification.immigrationStatus", 
          "identification.idProof", 
          "identification.documentNumber"
        ];
      case 2: // Work
        return [
          "work.employmentStatus", 
          "work.department", 
          "work.jobTitle", 
          "work.doj", 
          "work.timeZone"
        ];
      case 3: // Contact
        return [
          "contact.residentialAddress", 
          "contact.city", 
          "contact.state", 
          "contact.country", 
          "contact.postalCode", 
          "contact.workEmail", 
          "contact.mobileNumber", 
          "contact.primaryEmergencyContactName", 
          "contact.primaryEmergencyContactNumber", 
          "contact.relationshipToPrimaryEmergencyContact"
        ];
      case 4: // Report
        return ["report.manager"];
      default:
        return [];
    }
  };

  const formatDateForBackend = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const handleApiResponse = async (response) => {
    const text = await response.text();
    if (!text) {
      return {
        status: response.ok ? "success" : "error",
        message: response.ok ? "Operation successful" : "Empty response from server"
      };
    }

    try {
      const data = JSON.parse(text);
      if (!response.ok) {
        return {
          status: "error",
          message: data.message || "Request failed"
        };
      }
      return data;
    } catch (e) {
      return {
        status: "error",
        message: text || "Invalid response from server"
      };
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Validate all steps before submission
    let allErrors = {};
    for (let step = 0; step < steps.length; step++) {
      const requiredFields = getRequiredFieldsForStep(step);
      const stepErrors = validateFields(requiredFields);
      allErrors = { ...allErrors, ...stepErrors };
    }

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      showSnackbar("Please fill all required fields correctly before submitting.", "error");
      setIsSubmitting(false);
      return;
    }

    try {
      // Format dates properly before sending
      const formattedData = {
        ...formData,
        personal: {
          ...formData.personal,
          dateOfBirth: formatDateForBackend(formData.personal.dateOfBirth)
        },
        identification: {
          ...formData.identification,
          personalTaxId: formData.identification.personalTaxId || null,
          socialInsurance: formData.identification.socialInsurance || null
        },
        work: {
          ...formData.work,
          doj: formatDateForBackend(formData.work.doj),
          terminationDate: formData.work.terminationDate 
            ? formatDateForBackend(formData.work.terminationDate)
            : null
        },
        report: {
          ...formData.report,
          note: notes.join('\n')
        }
      };

      const response = await fetch("http://localhost:1010/api/employees/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formattedData)
      });

      const responseData = await handleApiResponse(response);

      if (responseData.status === "success") {
        showSnackbar(`Employee added successfully! ID: ${responseData.data.id}`);
        navigate("/dashboard/employee");
      } else {
        throw new Error(responseData.message || "Failed to add employee");
      }
    } catch (error) {
      console.error("Submission error:", error);
      showSnackbar(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const getError = (fieldName) => {
    return errors[fieldName] || 
           errors[`personal.${fieldName}`] || 
           errors[`identification.${fieldName}`] || 
           errors[`work.${fieldName}`] || 
           errors[`contact.${fieldName}`] || 
           errors[`report.${fieldName}`];
  };

  const renderFormSection = () => {
    switch (activeStep) {
      case 0: // Personal
        return (
          <>
            <TextField 
              fullWidth 
              margin="normal" 
              label="Employee Number" 
              name="personal.empId" 
              value={formData.personal.empId} 
              onChange={handleChange} 
              required 
              error={!!getError("personal.empId")} 
              helperText={getError("personal.empId")} 
            />
            <TextField 
              fullWidth 
              margin="normal" 
              label="First Name" 
              name="personal.firstName" 
              value={formData.personal.firstName} 
              onChange={handleChange} 
              required 
              error={!!getError("personal.firstName")} 
              helperText={getError("personal.firstName")} 
            />
            <TextField 
              fullWidth 
              margin="normal" 
              label="Middle Name" 
              name="personal.middleName" 
              value={formData.personal.middleName} 
              onChange={handleChange} 
            />
            <TextField 
              fullWidth 
              margin="normal" 
              label="Last Name" 
              name="personal.lastName" 
              value={formData.personal.lastName} 
              onChange={handleChange} 
              required 
              error={!!getError("personal.lastName")} 
              helperText={getError("personal.lastName")} 
            />
            <TextField 
              fullWidth 
              margin="normal" 
              type="date" 
              label="Date Of Birth" 
              name="personal.dateOfBirth" 
              value={formData.personal.dateOfBirth} 
              onChange={handleChange} 
              required 
              InputLabelProps={{ shrink: true }} 
              error={!!getError("personal.dateOfBirth")} 
              helperText={getError("personal.dateOfBirth")} 
            />
            <FormControl 
              fullWidth 
              margin="normal" 
              error={!!getError("personal.gender")}
            >
              <InputLabel>Gender</InputLabel>
              <Select 
                name="personal.gender" 
                value={formData.personal.gender} 
                onChange={handleChange} 
                label="Gender" 
                required
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
              {getError("personal.gender") && <Typography variant="caption" color="error">{getError("personal.gender")}</Typography>}
            </FormControl>
            <FormControl 
              fullWidth 
              margin="normal" 
              error={!!getError("personal.maritalStatus")}
            >
              <InputLabel>Marital Status</InputLabel>
              <Select 
                name="personal.maritalStatus" 
                value={formData.personal.maritalStatus} 
                onChange={handleChange} 
                label="Marital Status" 
                required
              >
                <MenuItem value="Unmarried">Unmarried</MenuItem>
                <MenuItem value="Married">Married</MenuItem>
              </Select>
              {getError("personal.maritalStatus") && <Typography variant="caption" color="error">{getError("personal.maritalStatus")}</Typography>}
            </FormControl>
            <FormControl 
              fullWidth 
              margin="normal" 
              error={!!getError("personal.nationality")}
            >
              <InputLabel>Nationality</InputLabel>
              <Select 
                name="personal.nationality" 
                value={formData.personal.nationality || ""} 
                onChange={handleChange} 
                label="Nationality" 
                required
              >
                <MenuItem disabled>
                  <TextField value={search} onChange={handleSearchChange} label="Search" fullWidth variant="standard" />
                </MenuItem>
                {filteredOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {getError("personal.nationality") && <Typography variant="caption" color="error">{getError("personal.nationality")}</Typography>}
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Ethnicity</InputLabel>
              <Select 
                name="personal.ethnicity" 
                value={formData.personal.ethnicity} 
                onChange={handleChange} 
                label="Ethnicity"
              >
                <MenuItem value="Asian">Asian</MenuItem>
                <MenuItem value="Hispanic">Hispanic</MenuItem>
                <MenuItem value="African">African</MenuItem>
              </Select>
            </FormControl>
          </>
        );
      case 1: // Identification
        return (
          <>
            <FormControl 
              fullWidth 
              margin="normal" 
              error={!!getError("identification.immigrationStatus")}
            >
              <InputLabel>Immigration Status</InputLabel>
              <Select
                name="identification.immigrationStatus"
                value={formData.identification.immigrationStatus}
                onChange={handleChange}
                label="Immigration Status"
                required
              >
                <MenuItem value="Citizen">Citizen</MenuItem>
                <MenuItem value="Permanent Resident">Permanent Resident</MenuItem>
              </Select>
              {getError("identification.immigrationStatus") && <Typography variant="caption" color="error">{getError("identification.immigrationStatus")}</Typography>}
            </FormControl>

            <TextField
              fullWidth
              margin="normal"
              label="Personal Tax ID"
              name="identification.personalTaxId"
              value={formData.identification.personalTaxId || ''}
              onChange={handleChange}
              error={!!getError("identification.personalTaxId")}
              helperText={getError("identification.personalTaxId") || "Optional - must be exactly 10 digits"}
              inputProps={{
                maxLength: 10,
                inputMode: 'numeric',
                pattern: '[0-9]*'
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Social Insurance"
              name="identification.socialInsurance"
              value={formData.identification.socialInsurance}
              onChange={handleChange}
            />

            <FormControl 
              fullWidth 
              margin="normal" 
              error={!!getError("identification.idProof")}
            >
              <InputLabel>ID Proof</InputLabel>
              <Select
                name="identification.idProof"
                value={formData.identification.idProof}
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
              {getError("identification.idProof") && <Typography variant="caption" color="error">{getError("identification.idProof")}</Typography>}
            </FormControl>

            {formData.identification.idProof && formData.identification.idProof !== "Other" && (
              <TextField
                fullWidth
                margin="normal"
                label={`Enter ${formData.identification.idProof} Number`}
                name="identification.documentNumber"
                value={formData.identification.documentNumber}
                onChange={handleChange}
                required
                error={!!getError("identification.documentNumber")}
                helperText={getError("identification.documentNumber") || 
                  (formData.identification.idProof === "Aadhar Card" ? "Aadhar Number must be 12 digits" :
                  formData.identification.idProof === "Pan Card" ? "PAN Number must be 10 characters" :
                  formData.identification.idProof === "Driving Licence" ? "Driving Licence Number must be 16 characters" :
                  formData.identification.idProof === "Passport" ? "Passport Number must be 8 characters" : "")
                }
                inputProps={{
                  maxLength:
                    formData.identification.idProof === "Aadhar Card" ? 12 :
                    formData.identification.idProof === "Pan Card" ? 10 :
                    formData.identification.idProof === "Driving Licence" ? 16 :
                    formData.identification.idProof === "Passport" ? 8 : 20,
                }}
              />
            )}

            {formData.identification.idProof === "Other" && (
              <>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Document Name"
                  name="identification.documentName"
                  value={formData.identification.documentName}
                  onChange={handleChange}
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Document Number"
                  name="identification.documentNumber"
                  value={formData.identification.documentNumber}
                  onChange={handleChange}
                  required
                  error={!!getError("identification.documentNumber")}
                  helperText={getError("identification.documentNumber")}
                />
              </>
            )}
          </>
        );
      case 2: // Work
        return (
          <>
            <FormControl 
              fullWidth 
              margin="normal" 
              error={!!getError("work.employmentStatus")}
            >
              <InputLabel>Employment Status</InputLabel>
              <Select
                name="work.employmentStatus"
                value={formData.work.employmentStatus}
                onChange={handleChange}
                label="Employment Status"
                required
              >
                <MenuItem value="Full-Time Internship">Full-Time Internship</MenuItem>
                <MenuItem value="Full-Time Contract">Full-Time Contract</MenuItem>
                <MenuItem value="Full-Time Permanent">Full-Time Permanent</MenuItem>
                <MenuItem value="Part-Time Internship">Part-Time Internship</MenuItem>
                <MenuItem value="Part-Time Contract">Part-Time Contract</MenuItem>
                <MenuItem value="Part-Time Permanent">Part-Time Permanent</MenuItem>
              </Select>
              {getError("work.employmentStatus") && <Typography variant="caption" color="error">{getError("work.employmentStatus")}</Typography>}
            </FormControl>

            <TextField 
              fullWidth 
              margin="normal" 
              label="Department" 
              name="work.department" 
              value={formData.work.department} 
              onChange={handleChange} 
              required 
              error={!!getError("work.department")} 
              helperText={getError("work.department")} 
            />
            <TextField 
              fullWidth 
              margin="normal" 
              label="Job Title" 
              name="work.jobTitle" 
              value={formData.work.jobTitle} 
              onChange={handleChange} 
              required 
              error={!!getError("work.jobTitle")} 
              helperText={getError("work.jobTitle")} 
            />
            <TextField 
              fullWidth 
              margin="normal" 
              label="Pay Grade" 
              name="work.payGrade" 
              value={formData.work.payGrade} 
              onChange={handleChange} 
            />
            <TextField 
              fullWidth 
              margin="normal" 
              label="Date Of Joining" 
              name="work.doj" 
              type="date" 
              value={formData.work.doj} 
              onChange={handleChange} 
              required 
              InputLabelProps={{ shrink: true }} 
              error={!!getError("work.doj")} 
              helperText={getError("work.doj")} 
            />
            <TextField 
              fullWidth 
              margin="normal" 
              label="Termination Date" 
              name="work.terminationDate" 
              type="date" 
              value={formData.work.terminationDate} 
              onChange={handleChange} 
              InputLabelProps={{ shrink: true }} 
            />
            <TextField 
              fullWidth 
              margin="normal" 
              label="Workstation ID" 
              name="work.workstationId" 
              value={formData.work.workstationId} 
              onChange={handleChange} 
            />
            <Autocomplete
              fullWidth
              options={timeZones}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Time Zone" 
                  margin="normal" 
                  required 
                  error={!!getError("work.timeZone")}
                  helperText={getError("work.timeZone")}
                />
              )}
              value={formData.work.timeZone}
              onChange={(event, newValue) =>
                setFormData(prev => ({
                  ...prev,
                  work: {
                    ...prev.work,
                    timeZone: newValue
                  }
                }))
              }
            />
            <TextField 
              fullWidth 
              margin="normal" 
              label="Shift Start Time" 
              name="work.shiftStartTime" 
              type="time" 
              value={formData.work.shiftStartTime} 
              onChange={handleChange} 
              InputLabelProps={{ shrink: true }} 
            />
            <TextField 
              fullWidth 
              margin="normal" 
              label="Shift End Time" 
              name="work.shiftEndTime" 
              type="time" 
              value={formData.work.shiftEndTime} 
              onChange={handleChange} 
              InputLabelProps={{ shrink: true }} 
            />
          </>
        );
      case 3: // Contact
        return (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="Residential Address"
              name="contact.residentialAddress"
              value={formData.contact.residentialAddress}
              onChange={handleChange} 
              required
              error={!!getError("contact.residentialAddress")}
              helperText={getError("contact.residentialAddress")}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Permanent Address"
              name="contact.permanentAddress"
              value={formData.contact.permanentAddress}
              onChange={handleChange} 
            />

            <TextField
              fullWidth
              margin="normal"
              label="City"
              name="contact.city"
              value={formData.contact.city}
              onChange={handleChange} 
              required
              error={!!getError("contact.city")}
              helperText={getError("contact.city")}
            />
            <TextField
              fullWidth
              margin="normal"
              label="State"
              name="contact.state"
              value={formData.contact.state}
              onChange={handleChange} 
              required
              error={!!getError("contact.state")}
              helperText={getError("contact.state")}
            />
            <FormControl 
              fullWidth 
              margin="normal" 
              error={!!getError("contact.country")}
            >
              <InputLabel>Country</InputLabel>
              <Select
                name="contact.country"
                value={formData.contact.country || ""}
                onChange={handleChange}
                label="Country"
                required
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
                    value={search}
                    onChange={handleSearchChange}
                    label="Search"
                    fullWidth
                    variant="standard"
                  />
                </MenuItem>

                {filteredOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {getError("contact.country") && <Typography variant="caption" color="error">{getError("contact.country")}</Typography>}
            </FormControl>

            <TextField
              fullWidth
              margin="normal"
              label="Postal Code"
              name="contact.postalCode"
              value={formData.contact.postalCode}
              onChange={handleChange} 
              required
              error={!!getError("contact.postalCode")}
              helperText={getError("contact.postalCode")}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Work Email"
              name="contact.workEmail"
              value={formData.contact.workEmail}
              onChange={handleChange} 
              required
              error={!!getError("contact.workEmail")}
              helperText={getError("contact.workEmail")}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Personal Email"
              name="contact.personalEmail"
              value={formData.contact.personalEmail}
              onChange={handleChange}
              error={!!getError("contact.personalEmail")}
              helperText={getError("contact.personalEmail")}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Mobile Number"
              name="contact.mobileNumber"
              value={formData.contact.mobileNumber}
              onChange={handleChange} 
              required
              error={!!getError("contact.mobileNumber")}
              helperText={getError("contact.mobileNumber")}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Primary Emergency Contact Name"
              name="contact.primaryEmergencyContactName"
              value={formData.contact.primaryEmergencyContactName}
              onChange={handleChange} 
              required
              error={!!getError("contact.primaryEmergencyContactName")}
              helperText={getError("contact.primaryEmergencyContactName")}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Primary Emergency Contact Number"
              name="contact.primaryEmergencyContactNumber"
              value={formData.contact.primaryEmergencyContactNumber}
              onChange={handleChange} 
              required
              error={!!getError("contact.primaryEmergencyContactNumber")}
              helperText={getError("contact.primaryEmergencyContactNumber")}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Relationship to Primary Emergency Contact"
              name="contact.relationshipToPrimaryEmergencyContact"
              value={formData.contact.relationshipToPrimaryEmergencyContact}
              onChange={handleChange} 
              required
              error={!!getError("contact.relationshipToPrimaryEmergencyContact")}
              helperText={getError("contact.relationshipToPrimaryEmergencyContact")}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Secondary Emergency Contact Name"
              name="contact.secondaryEmergencyContactName"
              value={formData.contact.secondaryEmergencyContactName}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Secondary Emergency Contact Number"
              name="contact.secondaryEmergencyContactNumber"
              value={formData.contact.secondaryEmergencyContactNumber}
              onChange={handleChange}
              error={!!getError("contact.secondaryEmergencyContactNumber")}
              helperText={getError("contact.secondaryEmergencyContactNumber")}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Relationship to Secondary Emergency Contact"
              name="contact.relationshipToSecondaryEmergencyContact"
              value={formData.contact.relationshipToSecondaryEmergencyContact}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Family Doctor Name"
              name="contact.familyDoctorName"
              value={formData.contact.familyDoctorName}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Family Doctor Contact Number"
              name="contact.familyDoctorContactNumber"
              value={formData.contact.familyDoctorContactNumber}
              onChange={handleChange}
              error={!!getError("contact.familyDoctorContactNumber")}
              helperText={getError("contact.familyDoctorContactNumber")}
            />
          </>
        );
      case 4: // Report
        return (
          <Box sx={{ padding: 3 }}>
            <FormControl 
              fullWidth 
              margin="normal" 
              error={!!getError("report.manager")}
            >
              <InputLabel>Manager</InputLabel>
              <Select
                name="report.manager"
                value={formData.report.manager}
                onChange={handleChange}
                label="Manager"
                required
              >
                <MenuItem value="Manager 1">Manager 1</MenuItem>
                <MenuItem value="Manager 2">Manager 2</MenuItem>
                <MenuItem value="Manager 3">Manager 3</MenuItem>
              </Select>
              {getError("report.manager") && <Typography variant="caption" color="error">{getError("report.manager")}</Typography>}
            </FormControl>
      
            <FormControl fullWidth margin="normal">
              <InputLabel>Indirect Manager</InputLabel>
              <Select
                name="report.indirectManager"
                value={formData.report.indirectManager}
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
                name="report.firstLevelApprover"
                value={formData.report.firstLevelApprover}
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
                name="report.secondLevelApprover"
                value={formData.report.secondLevelApprover}
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
                name="report.thirdLevelApprover"
                value={formData.report.thirdLevelApprover}
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
                  name="report.note"
                  value={formData.report.note}
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
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 3, p: 6, borderRadius: 1, boxShadow: 2, bgcolor: "white", maxWidth: "500", height: "auto" }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center" pb={3}>
        Employee Registration
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel onClick={() => setActiveStep(index)}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 2 }}>
        {renderFormSection()}

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
            <Button 
              variant="contained" 
              color="success" 
              onClick={handleSubmit}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          )}
        </Box>
      </Box>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Employee;