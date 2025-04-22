import React, { useState } from "react";
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
  DialogActions
} from "@mui/material";
import { ArrowBack, Send } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Predefined roles with emails
const ROLES = [
  { name: "HR Manager", email: "hr@company.com" },
  { name: "Department Manager", email: "manager@company.com" },
  { name: "Team Supervisor", email: "supervisor@company.com" },
  { name: "CEO", email: "ceo@company.com" }
];

// Mock employee data
const EMPLOYEES = [
  { id: 1, name: "John Doe", email: "john@company.com", department: "Development" },
  { id: 2, name: "Jane Smith", email: "jane@company.com", department: "Marketing" },
  { id: 3, name: "Mike Johnson", email: "mike@company.com", department: "Sales" }
];

const NotificationSettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    reminder1Enabled: true,
    reminder1Day: "Saturday",
    reminder1Time: "23:59",
    reminder2Enabled: true,
    reminder2Day: "Sunday",
    reminder2Time: "23:59",
    supervisorReminderEnabled: true,
    supervisorReminderDay: "Monday",
    supervisorReminderTime: "14:00",
    hrReminderEnabled: true,
    hrReminderDay: "Tuesday",
    hrReminderTime: "14:00",
    escalationEnabled: true,
    escalationDay: "Thursday",
    escalationTime: "14:00",
    escalationRecipients: ["ceo@company.com", "hr@company.com"]
  });
  const [newEscalationEmail, setNewEscalationEmail] = useState("");
  const [selectedRoles, setSelectedRoles] = useState(["ceo@company.com", "hr@company.com"]);
  const [selectedTemplate, setSelectedTemplate] = useState("hr");
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [emailPreview, setEmailPreview] = useState("");

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
    const {
      target: { value },
    } = event;
    setSelectedRoles(
      typeof value === 'string' ? value.split(',') : value,
    );
    setSettings({
      ...settings,
      escalationRecipients: typeof value === 'string' ? value.split(',') : value
    });
  };

  const handleSave = () => {
    // In a real app, save to backend
    console.log("Saved settings:", settings);
    navigate("/dashboard/timesheets");
  };

  const handleTemplateChange = (event) => {
    setSelectedTemplate(event.target.value);
  };

  const handleSendTestEmail = () => {
    setSendDialogOpen(true);
    // Generate preview based on selected template
    updateEmailPreview(selectedTemplate);
  };

  const handleCloseSendDialog = () => {
    setSendDialogOpen(false);
    setSelectedEmployees([]);
  };

  const handleSendEmail = () => {
    // In a real app, this would send the email to selected employees
    console.log("Sending email to:", selectedEmployees);
    console.log("Email content:", emailPreview);
    setSendDialogOpen(false);
    setSelectedEmployees([]);
    alert(`Email sent successfully to ${selectedEmployees.length} employee(s)`);
  };

  const updateEmailPreview = (templateKey) => {
    const template = emailTemplates[templateKey];
    let preview = template.body;
    
    // Replace placeholders with sample data
    preview = preview.replace("{{employeeName}}", "Employee Name");
    preview = preview.replace("{{deadline}}", "Friday, 5:00 PM");
    preview = preview.replace("{{period}}", "this week");
    preview = preview.replace("{{supervisorName}}", "Supervisor Name");
    preview = preview.replace("{{managerName}}", "Manager Name");
    preview = preview.replace("{{ceoName}}", "CEO Name");
    preview = preview.replace("{{employeeList}}", "John Doe, Jane Smith");
    preview = preview.replace("{{count}}", "3");
    preview = preview.replace("{{employeeCount}}", "2");
    preview = preview.replace("{{unsubmittedCount}}", "5");
    preview = preview.replace("{{unapprovedCount}}", "2");
    preview = preview.replace("{{totalUnsubmitted}}", "7");
    preview = preview.replace("{{affectedDepartments}}", "Development, Marketing");
    preview = preview.replace("{{impact}}", "Potential payroll delays");
    
    setEmailPreview(preview);
  };

  // Email templates for different roles targeting employees
  const emailTemplates = {
    hr: {
      subject: "Action Required: Timesheet Submission Reminder",
      body: `Dear {{employeeName}},

Our records indicate that your timesheet for {{period}} has not been submitted yet. 

Submission Deadline: {{deadline}}

Please submit your timesheet immediately via the employee portal to avoid:
- Delays in payroll processing
- Compliance issues
- Additional follow-ups

If you've already submitted your timesheet, please disregard this message.

Thank you,
HR Department`
    },
    supervisor: {
      subject: "Urgent: Missing Timesheet Submission",
      body: `Hi {{employeeName}},

This is a reminder that your timesheet is still pending submission. As your supervisor, I'd like to remind you that timely submission is crucial for our payroll process.

Current Status: Not Submitted
Due Date: {{deadline}}

Please complete this immediately. If you're facing any issues, please let me know so I can assist.

Best regards,
{{supervisorName}}
Team Supervisor`
    },
    manager: {
      subject: "Final Notice: Timesheet Submission",
      body: `Dear {{employeeName}},

This is a final reminder regarding your overdue timesheet submission. As your department manager, I must emphasize the importance of meeting this compliance requirement.

Impact of Non-Submission:
- Payroll processing delays for you and your team
- Departmental compliance metrics affected
- Potential disciplinary action

Please submit by: {{deadline}}

If you need assistance, contact HR immediately.

Regards,
{{managerName}}
Department Manager`
    },
    ceo: {
      subject: "Critical: Timesheet Compliance Issue",
      body: `Dear {{employeeName}},

This communication is regarding your outstanding timesheet submission, which has now reached the highest level of escalation.

This delay affects:
- Company-wide payroll processing
- Financial reporting
- Regulatory compliance

Required Action:
Submit your timesheet immediately and reply to this email confirming submission.

Your attention to this matter is expected within the next 24 hours.

Sincerely,
{{ceoName}}
Chief Executive Officer`
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 3, width: "100%", maxWidth: 1000, mx: "auto" }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/dashboard/timesheets")}
        sx={{ mb: 3 }}
      >
        Back to Timesheets
      </Button>

      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
        Timesheet Notification Settings
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Configure automatic reminders and escalation emails for timesheet submission
      </Typography>

      {/* Employee Reminders */}
      <Typography variant="h6" gutterBottom>
        Employee Reminders
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.reminder1Enabled}
                onChange={handleSettingChange("reminder1Enabled")}
              />
            }
            label="First Reminder"
          />
          <Box sx={{ display: "flex", gap: 2, mt: 1, ml: 4 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Day</InputLabel>
              <Select
                value={settings.reminder1Day}
                onChange={(e) => handleTimeChange("reminder1Day", e.target.value)}
                disabled={!settings.reminder1Enabled}
              >
                <MenuItem value="Saturday">Saturday</MenuItem>
                <MenuItem value="Sunday">Sunday</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time</InputLabel>
              <Select
                value={settings.reminder1Time}
                onChange={(e) => handleTimeChange("reminder1Time", e.target.value)}
                disabled={!settings.reminder1Enabled}
              >
                <MenuItem value="23:59">11:59 PM</MenuItem>
                <MenuItem value="20:00">8:00 PM</MenuItem>
                <MenuItem value="18:00">6:00 PM</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.reminder2Enabled}
                onChange={handleSettingChange("reminder2Enabled")}
              />
            }
            label="Second Reminder"
          />
          <Box sx={{ display: "flex", gap: 2, mt: 1, ml: 4 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Day</InputLabel>
              <Select
                value={settings.reminder2Day}
                onChange={(e) => handleTimeChange("reminder2Day", e.target.value)}
                disabled={!settings.reminder2Enabled}
              >
                <MenuItem value="Saturday">Saturday</MenuItem>
                <MenuItem value="Sunday">Sunday</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time</InputLabel>
              <Select
                value={settings.reminder2Time}
                onChange={(e) => handleTimeChange("reminder2Time", e.target.value)}
                disabled={!settings.reminder2Enabled}
              >
                <MenuItem value="23:59">11:59 PM</MenuItem>
                <MenuItem value="20:00">8:00 PM</MenuItem>
                <MenuItem value="18:00">6:00 PM</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>
      </Grid>

      {/* Supervisor Reminders */}
      <Typography variant="h6" gutterBottom>
        Supervisor Reminders
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.supervisorReminderEnabled}
                onChange={handleSettingChange("supervisorReminderEnabled")}
              />
            }
            label="Supervisor Reminder"
          />
          <Box sx={{ display: "flex", gap: 2, mt: 1, ml: 4 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Day</InputLabel>
              <Select
                value={settings.supervisorReminderDay}
                onChange={(e) => handleTimeChange("supervisorReminderDay", e.target.value)}
                disabled={!settings.supervisorReminderEnabled}
              >
                <MenuItem value="Monday">Monday</MenuItem>
                <MenuItem value="Tuesday">Tuesday</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time</InputLabel>
              <Select
                value={settings.supervisorReminderTime}
                onChange={(e) => handleTimeChange("supervisorReminderTime", e.target.value)}
                disabled={!settings.supervisorReminderEnabled}
              >
                <MenuItem value="14:00">2:00 PM</MenuItem>
                <MenuItem value="12:00">12:00 PM</MenuItem>
                <MenuItem value="10:00">10:00 AM</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.hrReminderEnabled}
                onChange={handleSettingChange("hrReminderEnabled")}
              />
            }
            label="HR Reminder"
          />
          <Box sx={{ display: "flex", gap: 2, mt: 1, ml: 4 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Day</InputLabel>
              <Select
                value={settings.hrReminderDay}
                onChange={(e) => handleTimeChange("hrReminderDay", e.target.value)}
                disabled={!settings.hrReminderEnabled}
              >
                <MenuItem value="Tuesday">Tuesday</MenuItem>
                <MenuItem value="Wednesday">Wednesday</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time</InputLabel>
              <Select
                value={settings.hrReminderTime}
                onChange={(e) => handleTimeChange("hrReminderTime", e.target.value)}
                disabled={!settings.hrReminderEnabled}
              >
                <MenuItem value="14:00">2:00 PM</MenuItem>
                <MenuItem value="12:00">12:00 PM</MenuItem>
                <MenuItem value="10:00">10:00 AM</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>
      </Grid>

      {/* Escalation Settings */}
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
          <Box sx={{ display: "flex", gap: 2, mt: 1, ml: 4 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
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
            <FormControl size="small" sx={{ minWidth: 120 }}>
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
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Escalation Recipients
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

      {/* Email Templates Section */}
      <Typography variant="h6" gutterBottom>
        Email Templates
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Select Template</InputLabel>
            <Select
              value={selectedTemplate}
              onChange={handleTemplateChange}
              label="Select Template"
            >
              <MenuItem value="hr">HR Template</MenuItem>
              <MenuItem value="supervisor">Supervisor Template</MenuItem>
              <MenuItem value="manager">Manager Template</MenuItem>
              <MenuItem value="ceo">CEO Template</MenuItem>
            </Select>
          </FormControl>
          
          <Paper elevation={2} sx={{ p: 3, backgroundColor: '#f9f9f9', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Subject: {emailTemplates[selectedTemplate].subject}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" whiteSpace="pre-wrap">
              {emailTemplates[selectedTemplate].body}
            </Typography>
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<Send />}
              onClick={handleSendTestEmail}
            >
              Send Test Email
            </Button>
          </Box>
        </Grid>
      </Grid>

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

      {/* Send Email Dialog */}
      <Dialog open={sendDialogOpen} onClose={handleCloseSendDialog} maxWidth="md" fullWidth>
        <DialogTitle>Send Test Email</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Select employees to receive this email:
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Employees</InputLabel>
            <Select
              multiple
              value={selectedEmployees}
              onChange={(e) => setSelectedEmployees(e.target.value)}
              renderValue={(selected) => selected.map(id => {
                const emp = EMPLOYEES.find(e => e.id === id);
                return emp ? emp.name : id;
              }).join(', ')}
            >
              {EMPLOYEES.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  <Checkbox checked={selectedEmployees.indexOf(employee.id) > -1} />
                  <ListItemText primary={`${employee.name} (${employee.department})`} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Paper elevation={2} sx={{ p: 3, backgroundColor: '#f9f9f9' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Email Preview
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" whiteSpace="pre-wrap">
              {emailPreview || emailTemplates[selectedTemplate].body}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSendDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSendEmail}
            disabled={selectedEmployees.length === 0}
          >
            Send Email
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default NotificationSettings;