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
import API_BASE_URL from "../config/apiConfig";
 
// API endpoints from backend
const API = {
  GET_EMPLOYEES: "/api/employees/basic-info",
  SEND_EMAILS: "/api/emails/employee-reminders",
  GET_SETTINGS: "/api/notification-settings",
  SAVE_SETTINGS: "/api/notification-settings"
};

 
// Predefined roles with emails
const ROLES = [
  { name: "HR Manager", email: "hr@infinevocloud.com" },
  { name: "Department Manager", email: "manager@infinevocloud.com" },
  { name: "Team Supervisor", email: "supervisor@infinevocloud.com" },
  { name: "CEO", email: "ceo@infinevocloud.com" }
];
 
// All days of the week
const DAYS_OF_WEEK = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
 
// Reminder levels that match backend enum
const REMINDER_LEVELS = {
  1: "LEVEL_1",
  2: "LEVEL_2",
  3: "LEVEL_3"
};
 
const NotificationSettings = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [settings, setSettings] = useState({
    employeeReminders: [
      {
        enabled: true,
        level: "LEVEL_1",
        day: "SATURDAY",
        time: "23:59"      
      },
      {
        enabled: true,
        level: "LEVEL_2",
        day: "SUNDAY",
        time: "23:59"
      }
    ],
   
    supervisorReminders: [
      {
        enabled: true,
        level: "LEVEL_1",
        day: "TUESDAY",
        time: "14:00",
        recipients: ["supervisor@infinevocloud.com"]
      },
      {
        enabled: true,
        level: "LEVEL_2",
        day: "WEDNESDAY",
        time: "14:00",
        recipients: ["supervisor@infinevocloud.com"]
      }
    ],
   
    hrReminders: [
      {
        enabled: true,
        level: "LEVEL_1",
        day: "TUESDAY",
        time: "14:00",
        recipients: ["hr@infinevocloud.com"]
      },
      {
        enabled: true,
        level: "LEVEL_2",
        day: "WEDNESDAY",
        time: "14:00",
        recipients: ["hr@infinevocloud.com"]
      }
    ],
   
    escalationSettings: {
    enabled: true,
    day: "THURSDAY",
    time: "14:00",
    recipients: ["ceo@infinevocloud.com", "hr@infinevocloud.com"],
    },
    approvalReminders: [
      {
        enabled: true,
        level: "LEVEL_1",
        day: "TUESDAY",
        time: "12:00",
        recipients: ["supervisor@infinevocloud.com"]
      },
      {
        enabled: true,
        level: "LEVEL_2",
        day: "WEDNESDAY",
        time: "12:00",
        recipients: ["hr@infinevocloud.com"]
      },
      {
        enabled: true,
        level: "LEVEL_3",
        day: "FRIDAY",
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

  // Fetch employees from backend on component mount
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}${API.GET_SETTINGS}`);
        setSettings(response.data);
        showSnackbar(" Fetching notification settings successfully", "success");
      } catch (error) {
        console.error("Error fetching notification settings::", error);
        showSnackbar("Error fetching notification settings:", "error");
      }
    };
   
    fetchNotificationSettings();
  }, []);
 
  // Handle settings changes
//  const handleSettingChange = (setting) => (event) => {
//    setSettings({
//      ...settings,
 /////     [setting]: event.target.checked
 //   });
 // };

  const handleSettingChange = (section, field) => (event) => {
  setSettings((prev) => ({
    ...prev,
    [section]: {
      ...prev[section],
      [field]: event.target.checked,
    },
  }));
};

 
////  const handleTimeChange = (setting, value) => {
 //   setSettings({
 //     ...settings,
 //     [setting]: value
 ////   });
//  };

  const handleTimeChange = (field, value) => {
  setSettings(prev => ({
    ...prev,
    escalationSettings: {
      ...prev.escalationSettings,
      [field]: value
    }
  }));
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
  /*
  const handleAddEscalationEmail = () => {
    if (newEscalationEmail && !settings.escalationSettings.recipients.includes(newEscalationEmail)) {
      setSettings({
        ...settings,
        escalationRecipients: [...settings.escalationSettings.recipients, newEscalationEmail]
      });
      setNewEscalationEmail("");
    }
  }; */

  const handleAddEscalationEmail = () => {
  if (
    newEscalationEmail &&
    !settings.escalationSettings.recipients.includes(newEscalationEmail)
  ) {
    setSettings(prev => ({
      ...prev,
      escalationSettings: {
        ...prev.escalationSettings,
        recipients: [...prev.escalationSettings.recipients, newEscalationEmail],
      },
    }));
    setNewEscalationEmail("");
  }
};

 
  /*
  const handleRemoveEscalationEmail = (email) => {
    setSettings({
      ...settings,
      escalationRecipients: settings.escalationSettings.recipients.filter(e => e !== email)
    });
    setSelectedRoles(selectedRoles.filter(e => e !== email));
  }; */

  const handleRemoveEscalationEmail = (email) => {
  setSettings(prev => ({
    ...prev,
    escalationSettings: {
      ...prev.escalationSettings,
      recipients: prev.escalationSettings.recipients.filter(e => e !== email),
    },
  }));
  setSelectedRoles(prev => prev.filter(e => e !== email));
};

 /*
  const handleRoleSelectionChange = (event) => {
    const value = event.target.value;
    setSelectedRoles(typeof value === 'string' ? value.split(',') : value);
    setSettings({
      ...settings,
      recipients: typeof value === 'string' ? value.split(',') : value
    });
  }; */

  const handleRoleSelectionChange = (event) => {
  const value = event.target.value;

  const updatedRoles = typeof value === 'string' ? value.split(',') : value;

  setSelectedRoles(updatedRoles);

  setSettings(prev => ({
    ...prev,
    escalationSettings: {
      ...prev.escalationSettings,
      recipients: updatedRoles,
    }
  }));
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
      const selectedEmails = employees
        .filter(emp => selectedEmployees.includes(emp.empId))
        .map(emp => ({
          email: emp.email,
          empId: emp.empId,
          name: emp.name
        }));
 
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
 
      const response = await axios.post(`${API_BASE_URL}${API.SEND_EMAILS}`, {
        to: selectedEmails,
        cc: settings.escalationSettings.recipients,
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
      const payload = {
        employeeReminders: settings.employeeReminders,
        supervisorReminders: settings.supervisorReminders,
        hrReminders: settings.hrReminders,
        approvalReminders: settings.approvalReminders,
     //   escalationSettings: {
      //    enabled: settings.escalationEnabled,
      //    day: settings.escalationDay,
      //    time: settings.escalationTime,
      //    recipients: settings.escalationRecipients
     //   }
        escalationSettings: settings.escalationSettings
      };
 
      const response = await axios.post(`${API_BASE_URL}${API.SAVE_SETTINGS}`, payload);
 
      if (response.status === 200) {
        showSnackbar("Settings saved successfully", "success");
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
 
 const escalationEmailTemplate = () => `
Dear Team,

This is an urgent notification regarding your overdue timesheet submission.

This matter has been escalated to the following management team members:
${settings.escalationSettings.recipients.map(email => `- ${email}`).join('\n')}

Required Actions:
1. Submit your timesheet immediately through the employee portal
2. Reply to this email to confirm submission
3. Contact your supervisor if you encounter any issues

Consequences of non-compliance:
- Immediate payroll processing delays
- Formal disciplinary action
- Further escalation to senior leadership

The deadline for resolution is ${settings.escalationSettings.day} at ${settings.escalationSettings.time}.

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
              label={`Reminder ${reminder.level.replace('_', ' ')}`}
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
              label={`Supervisor Reminder ${reminder.level.replace('_', ' ')}`}
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
              label={`HR Reminder ${reminder.level.replace('_', ' ')}`}
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
              label={`Approval ${reminder.level.replace('_', ' ')}`}
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
                checked={settings.escalationSettings.enabled}
                 onChange={handleSettingChange("escalationSettings", "enabled")}
              />
            }
            label="Enable Escalation"
          />
          <Box sx={{ display: "flex", gap: 2, mt: 2, ml: 4, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 120, mb: 2 }}>
              <InputLabel>Day</InputLabel>
              <Select
                value={settings.escalationSettings.day}
                onChange={(e) => handleTimeChange("day", e.target.value)}
                disabled={!settings.escalationSettings.enabled}
              >
                {DAYS_OF_WEEK.map(day => (
                  <MenuItem key={day} value={day}>{day}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Time"
              value={settings.escalationSettings.time}
              onChange={(e) => handleTimeChange("time", e.target.value)}
              disabled={!settings.escalationSettings.enabled}
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
              disabled={!settings.escalationSettings.enabled}
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
            {settings.escalationSettings.recipients.map((email) => {
              const role = ROLES.find(r => r.email === email);
              return (
                <Chip
                  key={email}
                  label={role ? `${role.name} (${email})` : email}
                  onDelete={() => handleRemoveEscalationEmail(email)}
                  disabled={!settings.escalationSettings.enabled}
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
              disabled={!settings.escalationSettings.enabled

              }
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="outlined"
              onClick={handleAddEscalationEmail}
              disabled={!settings.escalationSettings.enabled || !newEscalationEmail}
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
          disabled={!settings.escalationSettings.enabled}
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
              <strong>CC:</strong> {settings.escalationSettings.recipients.join(', ')}
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
 