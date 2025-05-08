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

// API endpoints from backend
const API = {
  GET_EMPLOYEES: "/api/employees/basic-info",
  SEND_EMAILS: "/api/emails/employee-reminders",
  SAVE_SETTINGS: "/api/settings/timesheet-notifications" // New endpoint for saving settings
};

const API_BASE_URL = "http://localhost:1010";

// Predefined roles with emails
const ROLES = [
  { name: "HR Manager", email: "hr@infinevocloud.com" },
  { name: "Department Manager", email: "manager@infinevocloud.com" },
  { name: "Team Supervisor", email: "supervisor@infinevocloud.com" },
  { name: "CEO", email: "ceo@infinevocloud.com" }
];

// All days of the week
const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const NotificationSettings = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [settings, setSettings] = useState({
    // Employee reminders
    employeeReminders: [
      {
        enabled: true,
        level: 1,
        day: "Saturday",
        time: "23:59",
        selectedEmployees: []
      },
      {
        enabled: true,
        level: 2,
        day: "Sunday",
        time: "23:59",
        selectedEmployees: []
      }
    ],
   
    // Supervisor reminders with recipients
    supervisorReminders: [
      {
        enabled: true,
        level: 1,
        day: "Tuesday",
        time: "14:00",
        recipients: ["supervisor@infinevocloud.com"]
      },
      {
        enabled: true,
        level: 2,
        day: "Wednesday",
        time: "14:00",
        recipients: ["supervisor@infinevocloud.com"]
      }
    ],
   
    // HR reminders with recipients
    hrReminders: [
      {
        enabled: true,
        level: 1,
        day: "Tuesday",
        time: "14:00",
        recipients: ["hr@infinevocloud.com"]
      },
      {
        enabled: true,
        level: 2,
        day: "Wednesday",
        time: "14:00",
        recipients: ["hr@infinevocloud.com"]
      }
    ],
   
    // Escalation settings
    escalationEnabled: true,
    escalationDay: "Thursday",
    escalationTime: "14:00",
    escalationRecipients: ["ceo@infinevocloud.com", "hr@infinevocloud.com"],
   
    // Approval reminders
    approvalReminders: [
      {
        enabled: true,
        level: 1,
        day: "Tuesday",
        time: "12:00",
        recipients: ["supervisor@infinevocloud.com"]
      },
      {
        enabled: true,
        level: 2,
        day: "Wednesday",
        time: "12:00",
        recipients: ["hr@infinevocloud.com"]
      },
      {
        enabled: true,
        level: 3,
        day: "Friday",
        time: "12:00",
        recipients: ["ceo@infinevocloud.com"]
      }
    ]
  });

  const [newEscalationEmail, setNewEscalationEmail] = useState("");
  const [selectedRoles, setSelectedRoles] = useState(["ceo@infinevocloud.com", "hr@infinevocloud.com"]);
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
      // Prepare the payload with all settings data
      const payload = {
        employeeReminders: settings.employeeReminders,
        supervisorReminders: settings.supervisorReminders,
        hrReminders: settings.hrReminders,
        approvalReminders: settings.approvalReminders,
        escalationSettings: {
          enabled: settings.escalationEnabled,
          day: settings.escalationDay,
          time: settings.escalationTime,
          recipients: settings.escalationRecipients
        },
        lastUpdated: new Date().toISOString()
      };

      // Call backend API to save settings
      const response = await axios.post(`${API_BASE_URL}${API.SAVE_SETTINGS}`, payload);

      if (response.status === 200) {
        showSnackbar("Settings saved successfully", "success");
        console.log("Settings payload:", payload); // For debugging
      } else {
        throw new Error("Failed to save settings");
      }
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

The deadline for resolution is ${settings.escalationDay} at ${settings.escalationTime}.

Sincerely,
Timesheet Compliance Team
`;

  // Approval reminder email template
  const approvalReminderTemplate = (level) => `
Dear ${level === 1 ? 'Supervisor' : level === 2 ? 'HR Team' : 'Management Team'},

This is a reminder regarding pending timesheet approvals.

Pending Approvals:
- ${level === 1 ? 'Initial reminder' : level === 2 ? 'Second reminder' : 'Final escalation'}
- Action required by: ${settings.approvalReminders[level-1].day} at ${settings.approvalReminders[level-1].time}

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

  // Render recipients selector with custom email option
  const renderRecipientsSelector = (type, index) => {
    const [newEmail, setNewEmail] = useState("");

    const handleAddEmail = () => {
      if (newEmail && !settings[type][index].recipients.includes(newEmail)) {
        updateReminder(type, index, 'recipients', [...settings[type][index].recipients, newEmail]);
        setNewEmail("");
      }
    };

    const handleRemoveEmail = (email) => {
      updateReminder(
        type, 
        index, 
        'recipients', 
        settings[type][index].recipients.filter(e => e !== email)
      );
    };

    return (
      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Recipients:
        </Typography>
        
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          {settings[type][index].recipients.map((email) => (
            <Chip
              key={email}
              label={email}
              onDelete={() => handleRemoveEmail(email)}
              disabled={!settings[type][index].enabled}
            />
          ))}
        </Box>
        
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            size="small"
            placeholder="Add custom email address"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            disabled={!settings[type][index].enabled}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="outlined"
            onClick={handleAddEmail}
            disabled={!settings[type][index].enabled || !newEmail}
          >
            Add
          </Button>
        </Box>
      </Box>
    );
  };

  // Render day/time selectors with manual time input
  const renderDateTimeSelectors = (type, index, defaultDay, defaultTime) => (
    <Box sx={{ display: "flex", gap: 2, mt: 2, mb: 2, flexWrap: 'wrap' }}>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Day</InputLabel>
        <Select
          value={settings[type][index].day}
          onChange={(e) => updateReminder(type, index, 'day', e.target.value)}
          disabled={!settings[type][index].enabled}
        >
          {DAYS_OF_WEEK.map(day => (
            <MenuItem key={day} value={day}>{day}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        size="small"
        label="Time"
        value={settings[type][index].time}
        onChange={(e) => updateReminder(type, index, 'time', e.target.value)}
        disabled={!settings[type][index].enabled}
        sx={{ minWidth: 120 }}
        placeholder="HH:mm"
      />
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
              {renderDateTimeSelectors(
                'employeeReminders', 
                index, 
                index === 0 ? "Saturday" : "Sunday",
                "23:59"
              )}
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
              {renderDateTimeSelectors(
                'supervisorReminders', 
                index, 
                index === 0 ? "Tuesday" : "Wednesday",
                "14:00"
              )}
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
              {renderDateTimeSelectors(
                'hrReminders', 
                index, 
                index === 0 ? "Tuesday" : "Wednesday",
                "14:00"
              )}
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
              {renderDateTimeSelectors(
                'approvalReminders', 
                index, 
                index === 0 ? "Tuesday" : index === 1 ? "Wednesday" : "Friday",
                "12:00"
              )}
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
                {DAYS_OF_WEEK.map(day => (
                  <MenuItem key={day} value={day}>{day}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Time"
              value={settings.escalationTime}
              onChange={(e) => handleTimeChange("escalationTime", e.target.value)}
              disabled={!settings.escalationEnabled}
              sx={{ minWidth: 120, mb: 2 }}
              placeholder="HH:mm"
            />
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