import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Grid,
  Box,
  Button,
  TextField,
  Chip,
  FormControlLabel,
  Switch,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Autocomplete
} from "@mui/material";
import { ArrowBack, Send } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { listTimeZones } from 'timezone-support';
import { getData } from 'country-list';


import { getCountries, getCountryName } from "country-list";
import { getTimezonesForCountry } from 'countries-and-timezones';






// API endpoints from backend
const API = {
  GET_EMPLOYEES: "/api/employees/basic-info",
  SEND_EMAILS: "/api/emails/employee-reminders"
};

const API_BASE_URL = "http://localhost:1010";

// Get all countries with their codes and names
const COUNTRIES = getData().map(country => ({
  code: country.code,
  name: country.name
}));



// Predefined roles with emails
const ROLES = [
  { name: "HR Manager", email: "hr@infinevocloud.com" },
  { name: "Department Manager", email: "manager@infinevocloud.com" },
  { name: "Team Supervisor", email: "supervisor@infinevocloud.com" },
  { name: "CEO", email: "ceo@infinevocloud.com" }
];

const NotificationSettings = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [settings, setSettings] = useState({
    // Employee reminders with country/timezone support
    employeeReminders: [
      {
        enabled: true,
        level: 1,
        day: "Saturday",
        time: "23:59",
        country: null, // Changed from countries array to single country
        timezone: null,
        selectedEmployees: []
      },
      {
        enabled: true,
        level: 2,
        day: "Sunday",
        time: "23:59",
        selectedEmployees: [] // Level 2 doesn't need country/timezone
      }
    ],
   
    // Supervisor reminders with recipients
    supervisorReminders: [
      {
        enabled: true,
        level: 1,
        day: "Tuesday",
        time: "14:00",
        recipients: ["supervisor@company.com"],
        timezone: "UTC"
      },
      {
        enabled: true,
        level: 2,
        day: "Wednesday",
        time: "14:00",
        recipients: ["supervisor@company.com", "hr@company.com"],
        timezone: "UTC"
      }
    ],
   
    // HR reminders with recipients
    hrReminders: [
      {
        enabled: true,
        level: 1,
        day: "Tuesday",
        time: "14:00",
        recipients: ["hr@company.com"],
        timezone: "UTC"
      },
      {
        enabled: true,
        level: 2,
        day: "Wednesday",
        time: "14:00",
        recipients: ["hr@company.com", "manager@company.com"],
        timezone: "UTC"
      }
    ],
   
    // Escalation settings
    escalationEnabled: true,
    escalationDay: "Thursday",
    escalationTime: "14:00",
    escalationRecipients: ["ceo@company.com", "hr@company.com"],
    escalationTimezone: "UTC",
   
    // Approval reminders
    approvalReminders: [
      {
        enabled: true,
        level: 1,
        day: "Tuesday",
        time: "12:00",
        recipients: ["supervisor@company.com"],
        timezone: "UTC"
      },
      {
        enabled: true,
        level: 2,
        day: "Wednesday",
        time: "12:00",
        recipients: ["hr@company.com"],
        timezone: "UTC"
      },
      {
        enabled: true,
        level: 3,
        day: "Friday",
        time: "12:00",
        recipients: ["ceo@company.com", "hr-director@company.com"],
        timezone: "UTC"
      }
    ]
  });

  const [newEscalationEmail, setNewEscalationEmail] = useState("");
  const [selectedRoles, setSelectedRoles] = useState(["ceo@company.com", "hr@company.com"]);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [customEmail, setCustomEmail] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Fetch employees from backend on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}${API.GET_EMPLOYEES}`);
        setEmployees(response.data);
        showSnackbar("Employees loaded successfully", "success");
      } catch (error) {
        console.error("Error fetching employees:", error);
        showSnackbar("Failed to load employees", "error");
      }
    };
   
    fetchEmployees();
  }, []);

  // Get employees by country
  const getEmployeesByCountry = (countryCode) => {
    return employees.filter(emp => emp.country === countryCode);
  };

  // Get timezones for a country
  // const getTimezonesForCountry = (countryCode) => {
  //   try {
  //     return findTimezonesForCountry(countryCode) || ["UTC"];
  //   } catch (error) {
  //     console.error(`Error getting timezones for country ${countryCode}:`, error);
  //     return ["UTC"];
  //   }
  // };

  // const getTimezonesForCountry = (countryCode) => {
  //   try {
  //     return timezoneSupport.findTimezonesForCountry(countryCode) || ["UTC"];
  //   } catch (error) {
  //     console.error(`Error getting timezones for country ${countryCode}:`, error);
  //     return ["UTC"];
  //   }
  // };


  const getTimezonesForCountry = (countryCode) => {
    try {
      return Intl.supportedValuesOf('timeZone').filter(tz => 
        tz.includes(countryCode) || tz.startsWith(countryCode)
      ) || ["UTC"];
    } catch (error) {
      return ["UTC"];
    }
  };

  const findTimezonesForCountry = (countryCode) => {
    try {
      return timezoneSupport.findTimezonesForCountry(countryCode) || ["UTC"];
    } catch (error) {
      console.error(`Error getting timezones for country ${countryCode}:`, error);
      return ["UTC"];
    }
  };

  // Handle settings changes
  const handleSettingChange = (setting) => (event) => {
    setSettings({
      ...settings,
      [setting]: event.target.checked
    });
  };

  const handleTimeChange = (setting, value) => {
    setSettings({
      ...settings,
      [setting]: value
    });
  };

  // Update reminder settings
  const updateReminder = (type, index, field, value) => {
    const updatedReminders = [...settings[type]];
    updatedReminders[index][field] = value;
   
    // If country changes in employee reminders, update timezone and reset selected employees
    if (type === 'employeeReminders' && field === 'country') {
      const timezones = value ? getTimezonesForCountry(value.code) : ["UTC"];
      updatedReminders[index].timezone = timezones[0];
      updatedReminders[index].selectedEmployees = [];
    }
   
    setSettings({
      ...settings,
      [type]: updatedReminders
    });
  };

  // Email recipient management
  const handleAddEscalationEmail = () => {
    if (newEscalationEmail && !settings.escalationRecipients.includes(newEscalationEmail)) {
      setSettings({
        ...settings,
        escalationRecipients: [...settings.escalationRecipients, newEscalationEmail]
      });
      setNewEscalationEmail("");
    }
  };

  const handleRemoveEscalationEmail = (email) => {
    setSettings({
      ...settings,
      escalationRecipients: settings.escalationRecipients.filter(e => e !== email)
    });
    setSelectedRoles(selectedRoles.filter(e => e !== email));
  };

  const handleRoleSelectionChange = (event) => {
    const value = event.target.value;
    setSelectedRoles(typeof value === 'string' ? value.split(',') : value);
    setSettings({
      ...settings,
      escalationRecipients: typeof value === 'string' ? value.split(',') : value
    });
  };

  // Email sending functionality
  const handleSendEscalationEmail = () => {
    setSendDialogOpen(true);
  };

  const handleCloseSendDialog = () => {
    setSendDialogOpen(false);
    setSelectedEmployees([]);
    setCustomEmail("");
  };

  const handleSendEmail = async () => {
    try {
      // Prepare data for backend API
      const selectedEmails = employees
        .filter(emp => selectedEmployees.includes(emp.empId))
        .map(emp => ({
          email: emp.email,
          empId: emp.empId,
          name: emp.name
        }));

      // Include custom email if provided
      if (customEmail) {
        selectedEmails.push({
          email: customEmail,
          empId: `custom-${Date.now()}`,
          name: customEmail.split('@')[0]
        });
      }

      if (selectedEmails.length === 0) {
        showSnackbar("Please select at least one recipient", "error");
        return;
      }

      // Call backend API to send emails
      const response = await axios.post(`${API_BASE_URL}${API.SEND_EMAILS}`, {
        to: selectedEmails,
        cc: settings.escalationRecipients,
        subject: "Timesheet Reminder",
        messageBody: escalationEmailTemplate(selectedEmails[0].name)
      });

      if (response.status === 200) {
        showSnackbar(`Escalation emails sent to ${selectedEmails.length} recipient(s)`, "success");
        handleCloseSendDialog();
      } else {
        throw new Error("Failed to send emails");
      }
    } catch (error) {
      console.error("Error sending escalation email:", error);
      showSnackbar("Failed to send escalation emails", "error");
    }
  };

  // Save settings
  const handleSave = async () => {
    try {
      // In a real app, you would save settings to backend here
      console.log("Saved settings:", settings);
      showSnackbar("Settings saved successfully", "success");
    } catch (error) {
      console.error("Error saving settings:", error);
      showSnackbar("Failed to save settings", "error");
    }
  };

  // Snackbar helpers
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // System-generated escalation email template
  const escalationEmailTemplate = (employeeName) => `
Dear ${employeeName},

This is an urgent notification regarding your overdue timesheet submission.

This matter has been escalated to the following management team members:
${settings.escalationRecipients.map(email => `- ${email}`).join('\n')}

Required Actions:
1. Submit your timesheet immediately through the employee portal
2. Reply to this email to confirm submission
3. Contact your supervisor if you encounter any issues

Consequences of non-compliance:
- Immediate payroll processing delays
- Formal disciplinary action
- Further escalation to senior leadership

The deadline for resolution is ${settings.escalationDay} at ${settings.escalationTime} (${settings.escalationTimezone}).

Sincerely,
Timesheet Compliance Team
`;

  // Approval reminder email template
  const approvalReminderTemplate = (level) => `
Dear ${level === 1 ? 'Supervisor' : level === 2 ? 'HR Team' : 'Management Team'},

This is a reminder regarding pending timesheet approvals.

Pending Approvals:
- ${level === 1 ? 'Initial reminder' : level === 2 ? 'Second reminder' : 'Final escalation'}
- Action required by: ${settings.approvalReminders[level-1].day} at ${settings.approvalReminders[level-1].time} (${settings.approvalReminders[level-1].timezone})

Required Actions:
1. Review and approve pending timesheets immediately
2. Contact the employees if additional information is needed
3. Reply to this email once approvals are completed

${level === 3 ? `
Consequences of non-compliance:
- Payroll processing delays
- Formal reporting to senior leadership
` : ''}

Sincerely,
Timesheet Compliance Team
`;

  // Render country selector with search for employee reminders
  const renderCountrySelector = (index) => (
    <FormControl size="small" sx={{ minWidth: 200, mb: 2 }}>
      <Autocomplete
        options={COUNTRIES}
        getOptionLabel={(option) => option.name}
        value={settings.employeeReminders[index].country}
        onChange={(e, newValue) => {
          updateReminder('employeeReminders', index, 'country', newValue);
        }}
        disabled={!settings.employeeReminders[index].enabled || settings.employeeReminders[index].level === 2}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Country"
            variant="outlined"
            size="small"
          />
        )}
      />
    </FormControl>
  );

  // Render timezone selector based on selected country for employee reminders
  const renderTimezoneSelector = (index) => {
    const reminder = settings.employeeReminders[index];
    const timezones = reminder.country ? getTimezonesForCountry(reminder.country.code) : ["UTC"];

    return (
      <FormControl size="small" sx={{ minWidth: 200, mb: 2 }}>
        <InputLabel>Timezone</InputLabel>
        <Select
          value={reminder.timezone || timezones[0]}
          onChange={(e) => updateReminder('employeeReminders', index, 'timezone', e.target.value)}
          disabled={!reminder.enabled || reminder.level === 2 || !reminder.country}
        >
          {timezones.map(tz => (
            <MenuItem key={tz} value={tz}>{tz}</MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  // Render employee selector for employee reminders
  const renderEmployeeSelector = (index) => {
    const reminder = settings.employeeReminders[index];
    const countryCode = reminder.country?.code;

    if (reminder.level === 2) {
      // For level 2, show all employees without country filter
      return (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Select Employees:
          </Typography>
          <Autocomplete
            multiple
            options={employees}
            getOptionLabel={(option) => `${option.name} (${option.email})`}
            value={employees.filter(emp => reminder.selectedEmployees.includes(emp.empId))}
            onChange={(e, newValue) => {
              updateReminder('employeeReminders', index, 'selectedEmployees', newValue.map(emp => emp.empId));
            }}
            disabled={!reminder.enabled}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                placeholder="Select employees"
              />
            )}
          />
        </Box>
      );
    }

    return countryCode ? (
      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Employees in {reminder.country.name}:
        </Typography>
        <Autocomplete
          multiple
          options={getEmployeesByCountry(countryCode)}
          getOptionLabel={(option) => `${option.name} (${option.email})`}
          value={employees.filter(emp => reminder.selectedEmployees.includes(emp.empId))}
          onChange={(e, newValue) => {
            updateReminder('employeeReminders', index, 'selectedEmployees', newValue.map(emp => emp.empId));
          }}
          disabled={!reminder.enabled}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              size="small"
              placeholder="Select employees"
            />
          )}
        />
      </Box>
    ) : null;
  };

  // Render recipients selector for supervisor/HR/approval reminders
  const renderRecipientsSelector = (type, index) => (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Recipients:
      </Typography>
      <Autocomplete
        multiple
        freeSolo
        options={ROLES.map(role => role.email)}
        value={settings[type][index].recipients}
        onChange={(e, newValue) => {
          updateReminder(type, index, 'recipients', newValue);
        }}
        disabled={!settings[type][index].enabled}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            size="small"
            placeholder="Add recipients"
          />
        )}
      />
    </Box>
  );

  // Render day/time selectors with consistent spacing
  const renderDateTimeSelectors = (type, index, days, times) => (
    <Box sx={{ display: "flex", gap: 2, mt: 2, mb: 2, flexWrap: 'wrap' }}>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Day</InputLabel>
        <Select
          value={settings[type][index].day}
          onChange={(e) => updateReminder(type, index, 'day', e.target.value)}
          disabled={!settings[type][index].enabled}
        >
          {days.map(day => (
            <MenuItem key={day} value={day}>{day}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Time</InputLabel>
        <Select
          value={settings[type][index].time}
          onChange={(e) => updateReminder(type, index, 'time', e.target.value)}
          disabled={!settings[type][index].enabled}
        >
          {times.map(time => (
            <MenuItem key={time} value={time}>{time}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );

  return (
    <Paper elevation={0} sx={{ p: 4, width: "100%", maxWidth: 1200, mx: "auto", borderRadius: 3 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/admin/timesheets")}
        sx={{ mb: 3 }}
      >
        Back to Timesheets
      </Button>

      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
        Timesheet Notification Settings
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Configure automatic reminders and escalation emails for timesheet submission and approval
      </Typography>

      {/* Employee Reminders Section */}
      <Typography variant="h6" gutterBottom>
        Employee Reminders
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {settings.employeeReminders.map((reminder, index) => (
          <Grid item xs={12} md={6} key={`employee-reminder-${index}`}>
            <FormControlLabel
              control={
                <Switch
                  checked={reminder.enabled}
                  onChange={(e) => updateReminder('employeeReminders', index, 'enabled', e.target.checked)}
                />
              }
              label={`Reminder Level ${reminder.level}`}
            />
            <Box sx={{ ml: 4 }}>
              {reminder.level === 1 && (
                <Box sx={{ display: "flex", gap: 2, flexWrap: 'wrap' }}>
                  {renderCountrySelector(index)}
                  {renderTimezoneSelector(index)}
                </Box>
              )}
              {renderDateTimeSelectors('employeeReminders', index, ["Saturday", "Sunday"], ["23:59", "20:00", "18:00"])}
              {renderEmployeeSelector(index)}
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Supervisor Reminders Section */}
      <Typography variant="h6" gutterBottom>
        Supervisor Reminders
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {settings.supervisorReminders.map((reminder, index) => (
          <Grid item xs={12} md={6} key={`supervisor-reminder-${index}`}>
            <FormControlLabel
              control={
                <Switch
                  checked={reminder.enabled}
                  onChange={(e) => updateReminder('supervisorReminders', index, 'enabled', e.target.checked)}
                />
              }
              label={`Supervisor Reminder Level ${reminder.level}`}
            />
            <Box sx={{ ml: 4 }}>
              {renderDateTimeSelectors('supervisorReminders', index, ["Monday", "Tuesday", "Wednesday"], ["14:00", "12:00", "10:00"])}
              {renderRecipientsSelector('supervisorReminders', index)}
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* HR Reminders Section */}
      <Typography variant="h6" gutterBottom>
        HR Reminders
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {settings.hrReminders.map((reminder, index) => (
          <Grid item xs={12} md={6} key={`hr-reminder-${index}`}>
            <FormControlLabel
              control={
                <Switch
                  checked={reminder.enabled}
                  onChange={(e) => updateReminder('hrReminders', index, 'enabled', e.target.checked)}
                />
              }
              label={`HR Reminder Level ${reminder.level}`}
            />
            <Box sx={{ ml: 4 }}>
              {renderDateTimeSelectors('hrReminders', index, ["Tuesday", "Wednesday", "Thursday"], ["14:00", "12:00", "10:00"])}
              {renderRecipientsSelector('hrReminders', index)}
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Approval Reminders Section */}
      <Typography variant="h6" gutterBottom>
        Timesheet Approval Reminders
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {settings.approvalReminders.map((reminder, index) => (
          <Grid item xs={12} md={4} key={`approval-reminder-${index}`}>
            <FormControlLabel
              control={
                <Switch
                  checked={reminder.enabled}
                  onChange={(e) => updateReminder('approvalReminders', index, 'enabled', e.target.checked)}
                />
              }
              label={`Approval Level ${reminder.level}`}
            />
            <Box sx={{ ml: 4 }}>
              {renderDateTimeSelectors('approvalReminders', index, ["Tuesday", "Wednesday", "Friday"], ["12:00", "14:00", "10:00"])}
              {renderRecipientsSelector('approvalReminders', index)}
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Escalation Settings Section */}
      <Typography variant="h6" gutterBottom>
        Escalation Settings
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.escalationEnabled}
                onChange={handleSettingChange("escalationEnabled")}
              />
            }
            label="Enable Escalation"
          />
          <Box sx={{ display: "flex", gap: 2, mt: 2, ml: 4, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 120, mb: 2 }}>
              <InputLabel>Day</InputLabel>
              <Select
                value={settings.escalationDay}
                onChange={(e) => handleTimeChange("escalationDay", e.target.value)}
                disabled={!settings.escalationEnabled}
              >
                <MenuItem value="Thursday">Thursday</MenuItem>
                <MenuItem value="Friday">Friday</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120, mb: 2 }}>
              <InputLabel>Time</InputLabel>
              <Select
                value={settings.escalationTime}
                onChange={(e) => handleTimeChange("escalationTime", e.target.value)}
                disabled={!settings.escalationEnabled}
              >
                <MenuItem value="14:00">2:00 PM</MenuItem>
                <MenuItem value="12:00">12:00 PM</MenuItem>
                <MenuItem value="10:00">10:00 AM</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180, mb: 2 }}>
              <InputLabel>Timezone</InputLabel>
              <Select
                value={settings.escalationTimezone}
                onChange={(e) => handleTimeChange("escalationTimezone", e.target.value)}
                disabled={!settings.escalationEnabled}
              >
                {COUNTRIES.flatMap(country => {
                  try {
                    const timezones = findTimezonesForCountry(country.code);
                    return timezones ? timezones.map(tz => (
                      <MenuItem key={tz} value={tz}>{tz} ({country.name})</MenuItem>
                    )) : [];
                  } catch (error) {
                    return [];
                  }
                })}
              </Select>
            </FormControl>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Escalation Recipients (CC)
          </Typography>
         
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Select Roles</InputLabel>
            <Select
              multiple
              value={selectedRoles}
              onChange={handleRoleSelectionChange}
              disabled={!settings.escalationEnabled}
              renderValue={(selected) => selected.map(email => {
                const role = ROLES.find(r => r.email === email);
                return role ? role.name : email;
              }).join(', ')}
            >
              {ROLES.map((role) => (
                <MenuItem key={role.email} value={role.email}>
                  <Checkbox checked={selectedRoles.indexOf(role.email) > -1} />
                  <ListItemText primary={`${role.name} (${role.email})`} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
         
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
            {settings.escalationRecipients.map((email) => {
              const role = ROLES.find(r => r.email === email);
              return (
                <Chip
                  key={email}
                  label={role ? `${role.name} (${email})` : email}
                  onDelete={() => handleRemoveEscalationEmail(email)}
                  disabled={!settings.escalationEnabled}
                />
              );
            })}
          </Box>
         
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Or add custom email:
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              size="small"
              placeholder="Add custom email address"
              value={newEscalationEmail}
              onChange={(e) => setNewEscalationEmail(e.target.value)}
              disabled={!settings.escalationEnabled}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="outlined"
              onClick={handleAddEscalationEmail}
              disabled={!settings.escalationEnabled || !newEscalationEmail}
            >
              Add
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Escalation Email Section */}
      <Typography variant="h6" gutterBottom>
        Send Escalation Email
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<Send />}
          onClick={handleSendEscalationEmail}
          disabled={!settings.escalationEnabled}
        >
          Send Escalation Email
        </Button>
      </Box>

      {/* Save Settings Button */}
      <Divider sx={{ my: 3 }} />
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{ minWidth: 120 }}
        >
          Save Settings
        </Button>
      </Box>

      {/* Send Escalation Email Dialog */}
      <Dialog open={sendDialogOpen} onClose={handleCloseSendDialog} maxWidth="md" fullWidth>
        <DialogTitle>Send Escalation Email</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Select employees to escalate:
          </Typography>
         
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Employees</InputLabel>
            <Select
              multiple
              value={selectedEmployees}
              onChange={(e) => setSelectedEmployees(e.target.value)}
              renderValue={(selected) => selected.map(id => {
                const emp = employees.find(e => e.empId === id);
                return emp ? emp.name : id;
              }).join(', ')}
            >
              {Array.isArray(employees) &&
                employees.map((employee) => (
                  <MenuItem key={employee.empId} value={employee.empId}>
                    <Checkbox checked={selectedEmployees.indexOf(employee.empId) > -1} />
                    <ListItemText primary={`${employee.name} (${employee.email})`} />
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <Typography variant="subtitle1" sx={{ mb: 2, mt: 3 }}>
            Or enter custom email:
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Enter email address"
            value={customEmail}
            onChange={(e) => setCustomEmail(e.target.value)}
            sx={{ mb: 3 }}
          />
         
          <Paper elevation={2} sx={{ p: 3, backgroundColor: '#f9f9f9' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Email Preview
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>To:</strong> {selectedEmployees.length > 0
                ? employees.find(e => e.empId === selectedEmployees[0])?.email || customEmail
                : customEmail || "No recipient selected"}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>CC:</strong> {settings.escalationRecipients.join(', ')}
            </Typography>
            <Typography variant="body2" whiteSpace="pre-wrap">
              {selectedEmployees.length > 0 || customEmail
                ? escalationEmailTemplate(
                    selectedEmployees.length > 0
                      ? employees.find(e => e.empId === selectedEmployees[0])?.name
                      : customEmail.split('@')[0]
                  )
                : "Select an employee or enter email to preview"}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSendDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSendEmail}
            disabled={selectedEmployees.length === 0 && !customEmail}
            startIcon={<Send />}
          >
            Send Escalation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default NotificationSettings;