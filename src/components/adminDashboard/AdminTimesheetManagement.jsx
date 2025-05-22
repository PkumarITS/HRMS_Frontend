import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Grid,
  Chip,
  Box,
  TextField,
  InputAdornment,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Tabs,
  Tab
} from "@mui/material";
import {
  Search,
  MoreVert,
  CheckCircle,
  Cancel,
  Visibility,
  FileDownload,
  Email,
  Notifications as NotificationsIcon,
  Person,
  PictureAsPdf,
  GridOn,
  FilterAlt
} from "@mui/icons-material";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useNavigate } from "react-router-dom";
import { parseISO, format } from 'date-fns';
import TablePagination from '@mui/material/TablePagination';
import axios from 'axios';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import autoTable from 'jspdf-autotable';

const API_BASE_URL = "http://localhost:1010";

const AdminTimesheetManagement = () => {
  const navigate = useNavigate();
  const [timesheets, setTimesheets] = useState([]);
  const [filteredTimesheets, setFilteredTimesheets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [loading, setLoading] = useState(true);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    status: "All Statuses",
    startDate: null,
    endDate: new Date(),
    project: "All Projects",
    manager: "All Managers"
  });
  const [appliedFilters, setAppliedFilters] = useState({
    status: "All Statuses",
    project: "All Projects",
    startDate: null,
    endDate: new Date(),
    manager: "All Managers"
  });
  const [exportType, setExportType] = useState('excel');
  const [projects, setProjects] = useState([]);
  const [projectManagers, setProjectManagers] = useState({});
  const [managers, setManagers] = useState([]);
  const [managerProjects, setManagerProjects] = useState([]);
  const [filterManagerProjects, setFilterManagerProjects] = useState([]);

  const fetchManagers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/managers`);
      setManagers(response.data || []);
    } catch (error) {
      console.error("Error fetching managers:", error);
      showSnackbar("Failed to load managers", "error");
    }
  };

  const fetchProjectsForManager = async (managerId, isExport = false) => {
    try {
      if (managerId === "All Managers") {
        if (isExport) {
          setManagerProjects(projects);
        } else {
          setFilterManagerProjects(projects);
        }
        return;
      }
      
      const response = await axios.get(`${API_BASE_URL}/admin/projects?managerId=${managerId}`);
      if (isExport) {
        setManagerProjects(response.data || []);
      } else {
        setFilterManagerProjects(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching projects for manager:", error);
      showSnackbar("Failed to load manager's projects", "error");
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/projects`);
      if (response.data && Array.isArray(response.data)) {
        setProjects(response.data);
        setManagerProjects(response.data);
        setFilterManagerProjects(response.data);
        
        const managersMap = {};
        response.data.forEach(project => {
          managersMap[project.id] = {
            managerId: project.managerId || "N/A",
            managerName: project.managerName || "No Manager"
          };
        });
        setProjectManagers(managersMap);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      showSnackbar("Failed to load projects", "error");
    }
  };

  const fetchTimesheets = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/timesheets/non-draft`);
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid data format received from server");
      }
  
      if (projects.length === 0) {
        await fetchProjects();
      }

      const data = await Promise.all(response.data.map(async (ts) => {
        let managerInfo = projectManagers[ts.projectId];
        
        if (!managerInfo) {
          try {
            const projectResponse = await axios.get(`${API_BASE_URL}/admin/projects/${ts.projectId}`);
            managerInfo = {
              managerId: projectResponse.data.managerId || "N/A",
              managerName: projectResponse.data.managerName || "No Manager"
            };
            setProjectManagers(prev => ({
              ...prev,
              [ts.projectId]: managerInfo
            }));
          } catch (error) {
            console.error(`Error fetching project ${ts.projectId}:`, error);
            managerInfo = {
              managerId: "N/A",
              managerName: "No Manager"
            };
          }
        }
        
        return {
          id: ts.timesheetId || "N/A",
          employeeId: ts.empId || "N/A",
          employeeName: ts.empName || "Unknown Employee",
          employeeEmail: `${ts.empName?.toLowerCase()?.replace(/\s+/g, '')}@company.com` || "unknown@company.com",
          project: ts.projectName || "N/A",
          projectId: ts.projectId || null,
          task: ts.taskName || "N/A",
          startDate: ts.weekStart || new Date().toISOString(),
          endDate: ts.weekEnd || new Date().toISOString(),
          status: ts.status === "SUBMITTED" ? "Pending" : ts.status || "Unknown",
          hours: [
            ts.mondayHours || 0,
            ts.tuesdayHours || 0,
            ts.wednesdayHours || 0,
            ts.thursadyHours || 0,
            ts.fridayHours || 0,
            ts.saturdayHours || 0,
            ts.sundayHours || 0
          ],
          totalHours: (ts.mondayHours || 0) + 
                     (ts.tuesdayHours || 0) + 
                     (ts.wednesdayHours || 0) + 
                     (ts.thursadyHours || 0) + 
                     (ts.fridayHours || 0) + 
                     (ts.saturdayHours || 0) + 
                     (ts.sundayHours || 0),
          submittedAt: ts.submitted_at || null,
          comments: ts.comments || "",
          rejectionReason: ts.status === "REJECTED" ? (ts.rejectionReason || "Rejected by admin") : "",
          managerId: managerInfo.managerId,
          managerName: managerInfo.managerName
        };
      }));
  
      setTimesheets(data);
      setFilteredTimesheets(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching timesheets:", error);
      showSnackbar("Failed to load timesheets", "error");
      setLoading(false);
      setTimesheets([]);
      setFilteredTimesheets([]);
    }
  };

  const applySearch = (term, data) => {
    if (!term) return data;
    
    const lowercasedTerm = term.toLowerCase();
    
    return data.filter(timesheet => {
      const searchFields = [
        timesheet.id,
        timesheet.employeeId,
        timesheet.employeeName,
        timesheet.managerId,
        timesheet.managerName,
        timesheet.project,
        timesheet.task,
        timesheet.status,
        timesheet.comments,
        timesheet.rejectionReason,
        format(parseISO(timesheet.startDate), "MMM dd, yyyy"),
        format(parseISO(timesheet.endDate), "MMM dd, yyyy"),
        timesheet.submittedAt ? format(parseISO(timesheet.submittedAt), "MMM dd, yyyy h:mm a") : "",
        timesheet.totalHours.toString()
      ];
      
      return searchFields.some(
        field => field && field.toString().toLowerCase().includes(lowercasedTerm)
      );
    });
  };

  const applyFilters = () => {
    let filtered = timesheets;
    
    filtered = applySearch(searchTerm, filtered);
    
    if (appliedFilters.status && appliedFilters.status !== "All Statuses") {
      filtered = filtered.filter(ts => 
        appliedFilters.status === "SUBMITTED" 
          ? ts.status === "Pending" 
          : ts.status.toUpperCase().includes(appliedFilters.status.toUpperCase())
      );
    }
    
    if (appliedFilters.project && appliedFilters.project !== "All Projects") {
      filtered = filtered.filter(ts => 
        ts.project === appliedFilters.project
      );
    }
    
    if (appliedFilters.manager && appliedFilters.manager !== "All Managers") {
      filtered = filtered.filter(ts => 
        ts.managerId === appliedFilters.manager
      );
    }
    
    if (appliedFilters.startDate && appliedFilters.endDate) {
      const startDate = new Date(appliedFilters.startDate);
      const endDate = new Date(appliedFilters.endDate);
      
      filtered = filtered.filter(ts => {
        const tsDate = new Date(ts.startDate);
        return tsDate >= startDate && tsDate <= endDate;
      });
    }
    
    setFilteredTimesheets(filtered);
    setPage(0);
    setFilterModalOpen(false);
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term === "") {
      applyFilters();
    } else {
      const searched = applySearch(term, timesheets);
      setFilteredTimesheets(searched);
      setPage(0);
    }
  };

  const resetSearch = () => {
    setSearchTerm("");
    applyFilters();
  };

  const fetchNotifications = async () => {
    try {
      setNotificationLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/notifications/admin/unread`);
      setNotifications(response.data);
      const countResponse = await axios.get(`${API_BASE_URL}/api/notifications/admin/unread-count`);
      setUnreadCount(countResponse.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      showSnackbar("Failed to load notifications", "error");
    } finally {
      setNotificationLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/notifications/mark-as-read/${notificationId}`);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/notifications/mark-all-read`);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleMenuOpen = (event, timesheet) => {
    setAnchorEl(event.currentTarget);
    setSelectedTimesheet(timesheet);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDialogOpen = (type) => {
    if (!selectedTimesheet) {
      showSnackbar("No timesheet selected", "error");
      return;
    }
    setDialogType(type);
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setRejectionReason("");
  };

  const approveTimesheet = async (timesheetId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/timesheets/${timesheetId}/status`, null, {
        params: { status: "APPROVED" }
      });
      return response.data;
    } catch (error) {
      console.error("Error approving timesheet:", error);
      throw error;
    }
  };

  const rejectTimesheet = async (timesheetId, reason) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/timesheets/${timesheetId}/status`, null, {
        params: { 
          status: "REJECTED",
          rejectionReason: reason 
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error rejecting timesheet:", error);
      throw error;
    }
  };

  const sendNotification = async (email, subject, message) => {
    console.log(`Sending email to ${email} with subject: ${subject}`);
    console.log(`Message: ${message}`);
    return { success: true };
  };

  const handleApproval = async () => {
    if (!selectedTimesheet?.id) {
      showSnackbar("No valid timesheet selected for approval", "error");
      handleDialogClose();
      return;
    }

    try {
      const result = await approveTimesheet(selectedTimesheet.id);
      
      setTimesheets(prev =>
        prev.map(ts =>
          ts.id === selectedTimesheet.id
            ? {
                ...ts,
                status: "APPROVED",
                updatedAt: new Date().toISOString()
              }
            : ts
        )
      );
      
      await sendNotification(
        selectedTimesheet.employeeEmail,
        "Timesheet Approved",
        `Your timesheet for ${format(parseISO(selectedTimesheet.startDate), "MMM dd")} to ${format(parseISO(selectedTimesheet.endDate), "MMM dd, yyyy")} has been approved.`
      );
      
      showSnackbar(result || "Timesheet approved successfully", "success");
    } catch (error) {
      console.error("Error approving timesheet:", error);
      showSnackbar(error.response?.data || "Failed to approve timesheet", "error");
    }
    
    handleDialogClose();
  };

  const handleRejection = async () => {
    if (!selectedTimesheet?.id) {
      showSnackbar("No valid timesheet selected for rejection", "error");
      handleDialogClose();
      return;
    }

    if (!rejectionReason) {
      showSnackbar("Please provide a rejection reason", "warning");
      return;
    }

    try {
      const result = await rejectTimesheet(selectedTimesheet.id, rejectionReason);
      
      setTimesheets(prev =>
        prev.map(ts =>
          ts.id === selectedTimesheet.id
            ? {
                ...ts,
                status: "REJECTED",
                updatedAt: new Date().toISOString(),
                rejectionReason: rejectionReason
              }
            : ts
        )
      );
      
      await sendNotification(
        selectedTimesheet.employeeEmail,
        "Timesheet Rejected",
        `Your timesheet for ${format(parseISO(selectedTimesheet.startDate), "MMM dd")} to ${format(parseISO(selectedTimesheet.endDate), "MMM dd, yyyy")} has been rejected. Reason: ${rejectionReason}`
      );
      
      showSnackbar(result || "Timesheet rejected", "warning");
    } catch (error) {
      console.error("Error rejecting timesheet:", error);
      showSnackbar(error.response?.data || "Failed to reject timesheet", "error");
    }
    
    handleDialogClose();
  };

  const handleViewDetails = () => {
    navigate(`/admin/timesheets/${selectedTimesheet.id}`, {
        state: { 
            timesheet: {
                ...selectedTimesheet,
                timesheetId: selectedTimesheet.id,
                empId: selectedTimesheet.employeeId,
                empName: selectedTimesheet.employeeName,
                projectName: selectedTimesheet.project,
                taskName: selectedTimesheet.task,
                weekStart: selectedTimesheet.startDate,
                weekEnd: selectedTimesheet.endDate,
                status: selectedTimesheet.status,
                mondayHours: selectedTimesheet.hours[0],
                tuesdayHours: selectedTimesheet.hours[1],
                wednesdayHours: selectedTimesheet.hours[2],
                thursadyHours: selectedTimesheet.hours[3],
                fridayHours: selectedTimesheet.hours[4],
                saturdayHours: selectedTimesheet.hours[5],
                sundayHours: selectedTimesheet.hours[6],
                submitted_at: selectedTimesheet.submittedAt,
                comments: selectedTimesheet.comments
            }
        }
    });
    handleMenuClose();
  };

  const handleSendReminder = async () => {
    if (!selectedTimesheet?.id) {
      showSnackbar("No timesheet selected to send reminder", "error");
      handleMenuClose();
      return;
    }

    try {
      await sendNotification(
        selectedTimesheet.employeeEmail,
        "Timesheet Reminder",
        `This is a reminder to submit your timesheet for ${format(parseISO(selectedTimesheet.startDate), "MMM dd")} to ${format(parseISO(selectedTimesheet.endDate), "MMM dd, yyyy")}. Please submit it as soon as possible.`
      );
      
      showSnackbar(`Reminder sent to ${selectedTimesheet.employeeName}`, "info");
    } catch (error) {
      console.error("Error sending reminder:", error);
      showSnackbar("Failed to send reminder", "error");
    }
    
    handleMenuClose();
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleExportModalOpen = () => {
    setExportFilters(prev => ({
      ...prev,
      endDate: new Date()
    }));
    setExportModalOpen(true);
  };

  const handleExportModalClose = () => {
    setExportModalOpen(false);
    setExportFilters({
      status: "All Statuses",
      startDate: null,
      endDate: new Date(),
      project: "All Projects",
      manager: "All Managers"
    });
    setManagerProjects(projects);
  };

  const handleFilterModalOpen = () => {
    setFilterModalOpen(true);
  };

  const handleFilterModalClose = () => {
    setFilterModalOpen(false);
  };

  const handleExportFilterChange = async (field, value) => {
    if (field === 'manager') {
      setExportFilters(prev => ({
        ...prev,
        [field]: value,
        project: "All Projects"
      }));
      
      await fetchProjectsForManager(value, true);
    } else {
      setExportFilters(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleExportTypeChange = (event, newValue) => {
    setExportType(newValue);
  };

  const getFilteredData = () => {
    return timesheets.filter(ts => {
      if (exportFilters.status && exportFilters.status !== "All Statuses") {
        if (exportFilters.status === "SUBMITTED" && ts.status !== "Pending") {
          return false;
        }
        if (!ts.status.toUpperCase().includes(exportFilters.status.toUpperCase())) {
          return false;
        }
      }
      
      if (exportFilters.startDate && exportFilters.endDate) {
        const startDate = new Date(exportFilters.startDate);
        const endDate = new Date(exportFilters.endDate);
        const tsDate = new Date(ts.startDate);
        
        if (tsDate < startDate || tsDate > endDate) {
          return false;
        }
      }
      
      if (exportFilters.project && exportFilters.project !== "All Projects" && ts.project !== exportFilters.project) {
        return false;
      }
      
      if (exportFilters.manager && exportFilters.manager !== "All Managers" && ts.managerId !== exportFilters.manager) {
        return false;
      }
      
      return true;
    });
  };

  const exportToExcel = (filteredData) => {
    const wb = XLSX.utils.book_new();
    
    const ws = XLSX.utils.aoa_to_sheet([
      ["Timesheet Report"],
      ["Generated on: " + format(new Date(), "yyyy-MM-dd HH:mm")],
      [""],
    ]);

    const exportData = filteredData.map(ts => ({
      "Timesheet ID": ts.id,
      "Employee ID": ts.employeeId,
      "Employee Name": ts.employeeName,
      "Manager ID": ts.managerId,
      "Manager Name": ts.managerName,
      "Project": ts.project,
      "Task": ts.task,
      "Week Start": format(parseISO(ts.startDate), "yyyy-MM-dd"),
      "Week End": format(parseISO(ts.endDate), "yyyy-MM-dd"),
      "Status": ts.status,
      "Total Hours": ts.totalHours,
      "Monday Hours": ts.hours[0],
      "Tuesday Hours": ts.hours[1],
      "Wednesday Hours": ts.hours[2],
      "Thursday Hours": ts.hours[3],
      "Friday Hours": ts.hours[4],
      "Saturday Hours": ts.hours[5],
      "Sunday Hours": ts.hours[6],
      "Submitted At": ts.submittedAt ? format(parseISO(ts.submittedAt), "yyyy-MM-dd HH:mm") : "N/A",
      "Comments": ts.comments || "N/A",
      "Rejection Reason": ts.rejectionReason || "N/A"
    }));

    XLSX.utils.sheet_add_json(ws, exportData, { origin: "A5", skipHeader: true });
    const headers = Object.keys(exportData[0]);
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A4" });

    XLSX.utils.book_append_sheet(wb, ws, "Timesheets");

    let fileNameParts = [`Timesheets_${format(new Date(), "yyyy-MM-dd")}`];
    if (exportFilters.status && exportFilters.status !== "All Statuses") fileNameParts.push(exportFilters.status);
    if (exportFilters.project && exportFilters.project !== "All Projects") fileNameParts.push(exportFilters.project.replace(/\s+/g, '_'));
    if (exportFilters.manager && exportFilters.manager !== "All Managers") {
      const manager = managers.find(m => m.empId === exportFilters.manager);
      fileNameParts.push(`Manager_${manager ? manager.name : exportFilters.manager}`);
    }
    if (exportFilters.startDate && exportFilters.endDate) {
      fileNameParts.push(
        `${format(new Date(exportFilters.startDate), "yyyy-MM-dd")}-${format(new Date(exportFilters.endDate), "yyyy-MM-dd")}`
      );
    }
    
    const fileName = fileNameParts.join('_');
    
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const exportToPDF = (filteredData) => {
    const doc = new jsPDF();
    
    doc.addImage(logo, 'PNG', 15, 10, 40, 15);
    
    doc.setFontSize(16);
    doc.text('Timesheet Report', 70, 20);
    doc.setFontSize(12);
    
    let filtersText = `Generated on: ${format(new Date(), "yyyy-MM-dd HH:mm")}`;
    if (exportFilters.status && exportFilters.status !== "All Statuses") filtersText += ` | Status: ${exportFilters.status}`;
    if (exportFilters.project && exportFilters.project !== "All Projects") filtersText += ` | Project: ${exportFilters.project}`;
    if (exportFilters.manager && exportFilters.manager !== "All Managers") {
      const manager = managers.find(m => m.empId === exportFilters.manager);
      filtersText += ` | Manager: ${manager ? manager.name : exportFilters.manager}`;
    }
    if (exportFilters.startDate && exportFilters.endDate) {
      filtersText += ` | Date Range: ${format(new Date(exportFilters.startDate), "yyyy-MM-dd")} to ${format(new Date(exportFilters.endDate), "yyyy-MM-dd")}`;
    }
    
    const splitText = doc.splitTextToSize(filtersText, 180);
    doc.text(splitText, 15, 35);
    
    autoTable(doc, {
      head: [
        ['ID', 'Employee', 'Manager', 'Project', 'Task', 'Week', 'Status', 'Hours', 'Submitted At']
      ],
      body: filteredData.map(ts => [
        ts.id,
        ts.employeeName,
        ts.managerName,
        ts.project,
        ts.task,
        `${format(parseISO(ts.startDate), "MMM dd")} - ${format(parseISO(ts.endDate), "MMM dd")}`,
        ts.status,
        ts.totalHours,
        ts.submittedAt ? format(parseISO(ts.submittedAt), "MMM dd, HH:mm") : "N/A"
      ]),
      startY: 45,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
        6: { cellWidth: 15 },
        7: { cellWidth: 10 },
        8: { cellWidth: 25 }
      }
    });
  
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount}`, 105, doc.internal.pageSize.height - 10);
      doc.addImage(logo, 'PNG', 15, doc.internal.pageSize.height - 15, 30, 10);
    }
  
    let fileNameParts = [`Timesheets_${format(new Date(), "yyyy-MM-dd")}`];
    if (exportFilters.status && exportFilters.status !== "All Statuses") fileNameParts.push(exportFilters.status);
    if (exportFilters.project && exportFilters.project !== "All Projects") fileNameParts.push(exportFilters.project.replace(/\s+/g, '_'));
    if (exportFilters.manager && exportFilters.manager !== "All Managers") {
      const manager = managers.find(m => m.empId === exportFilters.manager);
      fileNameParts.push(`Manager_${manager ? manager.name : exportFilters.manager}`);
    }
    if (exportFilters.startDate && exportFilters.endDate) {
      fileNameParts.push(
        `${format(new Date(exportFilters.startDate), "yyyy-MM-dd")}-${format(new Date(exportFilters.endDate), "yyyy-MM-dd")}`
      );
    }
    const fileName = fileNameParts.join('_');
    
    doc.save(`${fileName}.pdf`);
  };

  const handleExport = () => {
    try {
      const filteredData = getFilteredData();
      
      if (filteredData.length === 0) {
        showSnackbar("No data to export with current filters", "warning");
        return;
      }
      
      if (exportType === 'excel') {
        exportToExcel(filteredData);
      } else {
        exportToPDF(filteredData);
      }
      
      showSnackbar(`Exported ${filteredData.length} timesheets as ${exportType.toUpperCase()}`, "success");
      handleExportModalClose();
    } catch (error) {
      console.error(`Error exporting to ${exportType}:`, error);
      showSnackbar(`Failed to export as ${exportType.toUpperCase()}`, "error");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "Approved":
      case "APPROVED":
        return <Chip label="Approved" color="success" size="small" />;
      case "Rejected":
      case "REJECTED":
        return <Chip label="Rejected" color="error" size="small" />;
      case "Pending":
      case "SUBMITTED":
        return <Chip label="Pending" color="warning" size="small" />;
      case "Draft":
      case "DRAFT":
        return <Chip label="Draft" color="info" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const handleFilterChange = async (field, value) => {
    if (field === 'manager') {
      setAppliedFilters(prev => ({
        ...prev,
        [field]: value,
        project: "All Projects"
      }));
      
      await fetchProjectsForManager(value, false);
    } else {
      setAppliedFilters(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const resetFilters = () => {
    setAppliedFilters({
      status: "All Statuses",
      project: "All Projects",
      startDate: null,
      endDate: new Date(),
      manager: "All Managers"
    });
    setFilteredTimesheets(timesheets);
    setPage(0);
    setFilterModalOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchProjects();
      await fetchManagers();
      await fetchTimesheets();
      await fetchNotifications();
    };
    
    fetchData();
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={0} sx={{ p: 3, width: "100%", maxWidth: 1600, mx: "auto" }}>
        {/* Header Section */}
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Grid item>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Timesheet Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Review and approve employee timesheets
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<FileDownload />}
              onClick={handleExportModalOpen}
              sx={{ mr: 2 }}
            >
              Export
            </Button>
            <IconButton 
              color="inherit" 
              onClick={handleNotificationClick}
              sx={{ mr: 2 }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Button
              variant="outlined"
              startIcon={<Email />}
              onClick={() => navigate("/admin/timesheets/notifications")}
            >
              Notification Settings
            </Button>
          </Grid>
        </Grid>

        {/* Search and Filters */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search timesheets..."
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={resetSearch}
                    edge="end"
                  >
                    <Cancel fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterAlt />}
            onClick={handleFilterModalOpen}
          >
            Filters
          </Button>
        </Box>

        {/* Filter Modal */}
        <Dialog open={filterModalOpen} onClose={handleFilterModalClose} maxWidth="sm" fullWidth>
          <DialogTitle>Filter Timesheets</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Manager</InputLabel>
                <Select
                  value={appliedFilters.manager}
                  label="Manager"
                  onChange={(e) => handleFilterChange('manager', e.target.value)}
                >
                  <MenuItem value="All Managers">All Managers</MenuItem>
                  {managers.map((manager) => (
                    <MenuItem key={manager.empId} value={manager.empId}>
                      {manager.empId} - {manager.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Project</InputLabel>
                <Select
                  value={appliedFilters.project}
                  label="Project"
                  onChange={(e) => handleFilterChange('project', e.target.value)}
                >
                  <MenuItem value="All Projects">All Projects</MenuItem>
                  {filterManagerProjects.map((project) => (
                    <MenuItem key={project.id} value={project.name}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={appliedFilters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="All Statuses">All Statuses</MenuItem>
                  <MenuItem value="DRAFT">Draft</MenuItem>
                  <MenuItem value="SUBMITTED">Pending</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                </Select>
              </FormControl>

              <DatePicker
                label="Start Date"
                value={appliedFilters.startDate}
                onChange={(newValue) => handleFilterChange('startDate', newValue)}
                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                maxDate={appliedFilters.endDate}
              />

              <DatePicker
                label="End Date"
                value={appliedFilters.endDate}
                onChange={(newValue) => handleFilterChange('endDate', newValue)}
                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                minDate={appliedFilters.startDate}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={resetFilters} color="error">
              Reset
            </Button>
            <Button 
              onClick={applyFilters} 
              variant="contained" 
              color="primary"
              disabled={appliedFilters.startDate && appliedFilters.endDate && appliedFilters.startDate > appliedFilters.endDate}
            >
              Apply Filters
            </Button>
          </DialogActions>
        </Dialog>

        {/* Export Filter Modal */}
        <Dialog open={exportModalOpen} onClose={handleExportModalClose} maxWidth="sm" fullWidth>
          <DialogTitle>Export Timesheets</DialogTitle>
          <DialogContent>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs 
                value={exportType} 
                onChange={handleExportTypeChange}
                aria-label="export type tabs"
              >
                <Tab 
                  icon={<GridOn />} 
                  iconPosition="start" 
                  label="Excel" 
                  value="excel" 
                  sx={{ minWidth: 'auto' }} 
                />
                <Tab 
                  icon={<PictureAsPdf />} 
                  iconPosition="start" 
                  label="PDF" 
                  value="pdf" 
                  sx={{ minWidth: 'auto' }} 
                />
              </Tabs>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Manager</InputLabel>
                <Select
                  value={exportFilters.manager}
                  label="Manager"
                  onChange={(e) => handleExportFilterChange('manager', e.target.value)}
                >
                  <MenuItem value="All Managers">All Managers</MenuItem>
                  {managers.map((manager) => (
                    <MenuItem 
                      key={manager.empId} 
                      value={manager.empId}
                    >
                      {manager.empId} - {manager.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Project</InputLabel>
                <Select
                  value={exportFilters.project}
                  label="Project"
                  onChange={(e) => handleExportFilterChange('project', e.target.value)}
                >
                  <MenuItem value="All Projects">All Projects</MenuItem>
                  {managerProjects.map((project) => (
                    <MenuItem key={project.id} value={project.name}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={exportFilters.status}
                  label="Status"
                  onChange={(e) => handleExportFilterChange('status', e.target.value)}
                >
                  <MenuItem value="All Statuses">All Statuses</MenuItem>
                  <MenuItem value="DRAFT">Draft</MenuItem>
                  <MenuItem value="SUBMITTED">Pending</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                </Select>
              </FormControl>

              <DatePicker
                label="Start Date"
                value={exportFilters.startDate}
                onChange={(newValue) => handleExportFilterChange('startDate', newValue)}
                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                maxDate={exportFilters.endDate}
              />

              <DatePicker
                label="End Date"
                value={exportFilters.endDate}
                onChange={(newValue) => handleExportFilterChange('endDate', newValue)}
                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                minDate={exportFilters.startDate}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleExportModalClose}>Cancel</Button>
            <Button 
              onClick={handleExport} 
              variant="contained" 
              color="primary"
              disabled={exportFilters.startDate && exportFilters.endDate && exportFilters.startDate > exportFilters.endDate}
              startIcon={exportType === 'excel' ? <GridOn /> : <PictureAsPdf />}
            >
              Export as {exportType.toUpperCase()}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification Menu */}
        <Menu
          anchorEl={notificationAnchorEl}
          open={Boolean(notificationAnchorEl)}
          onClose={handleNotificationClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            style: {
              maxHeight: '400px',
              width: '400px',
            },
          }}
        >
          <MenuItem 
            onClick={() => {
              markAllAsRead();
              handleNotificationClose();
            }}
            disabled={notifications.length === 0}
          >
            Mark all as read
          </MenuItem>
          <Divider />
          {notificationLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length > 0 ? (
            <List sx={{ width: '100%', maxWidth: 360 }}>
              {notifications.map((notification) => (
                <ListItem 
                  key={notification.id}
                  alignItems="flex-start"
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.timesheetId) {
                      navigate(`/admin/timesheets/${notification.timesheetId}`);
                    }
                    handleNotificationClose();
                  }}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <Person />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.message}
                    secondary={format(new Date(notification.createdAt), "MMM dd, h:mm a")}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <MenuItem disabled>
              No new notifications
            </MenuItem>
          )}
        </Menu>

        {/* Timesheets Table */}
        <TableContainer component={Paper} elevation={2}>
          <Table sx={{ minWidth: 1200 }}>
            <TableHead>
              <TableRow>
                <TableCell>Timesheet ID</TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>Manager</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Task</TableCell>
                <TableCell>Week</TableCell>
                <TableCell align="right">Total Hours</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTimesheets.length > 0 ? (
                filteredTimesheets
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((timesheet) => (
                    <TableRow key={timesheet.id} hover>
                      <TableCell>{timesheet.id}</TableCell>
                      <TableCell>
                        <Typography fontWeight="bold">{timesheet.employeeName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {timesheet.employeeId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="bold">{timesheet.managerName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {timesheet.managerId}
                        </Typography>
                      </TableCell>
                      <TableCell>{timesheet.project}</TableCell>
                      <TableCell>{timesheet.task}</TableCell>
                      <TableCell>
                        {format(parseISO(timesheet.startDate), "MMM dd")} -{" "}
                        {format(parseISO(timesheet.endDate), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell align="right">{timesheet.totalHours}</TableCell>
                      <TableCell>{getStatusChip(timesheet.status)}</TableCell>
                      <TableCell>
                        {timesheet.submittedAt 
                          ? format(parseISO(timesheet.submittedAt), "MMM dd, h:mm a") 
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, timesheet)}
                          size="small"
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    No timesheets found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTimesheets.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleViewDetails}>
            <Visibility fontSize="small" sx={{ mr: 1 }} /> View Details
          </MenuItem>
          {selectedTimesheet?.status === "Pending" && (
            <>
              <MenuItem onClick={() => handleDialogOpen("approve")}>
                <CheckCircle fontSize="small" sx={{ mr: 1 }} /> Approve
              </MenuItem>
              <MenuItem onClick={() => handleDialogOpen("reject")}>
                <Cancel fontSize="small" sx={{ mr: 1 }} /> Reject
              </MenuItem>
              <MenuItem onClick={handleSendReminder}>
                <NotificationsIcon fontSize="small" sx={{ mr: 1 }} /> Send Reminder
              </MenuItem>
            </>
          )}
        </Menu>

        {/* Approval Dialog */}
        <Dialog open={openDialog && dialogType === "approve"} onClose={handleDialogClose}>
          <DialogTitle>Approve Timesheet</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {selectedTimesheet ? (
                <>
                  Are you sure you want to approve this timesheet submitted by{" "}
                  <strong>{selectedTimesheet.employeeName}</strong> for the week of{" "}
                  {format(parseISO(selectedTimesheet.startDate), "MMM dd")}?
                </>
              ) : (
                "No timesheet selected"
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button 
              onClick={handleApproval} 
              color="success" 
              variant="contained"
              disabled={!selectedTimesheet}
            >
              Approve
            </Button>
          </DialogActions>
        </Dialog>

        {/* Rejection Dialog */}
        <Dialog open={openDialog && dialogType === "reject"} onClose={handleDialogClose}>
          <DialogTitle>Reject Timesheet</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {selectedTimesheet ? (
                <>
                  Are you sure you want to reject this timesheet submitted by{" "}
                  <strong>{selectedTimesheet.employeeName}</strong>?
                </>
              ) : (
                "No timesheet selected"
              )}
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Reason for rejection"
              type="text"
              fullWidth
              variant="standard"
              multiline
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button 
              onClick={handleRejection} 
              color="error" 
              variant="contained"
              disabled={!selectedTimesheet || !rejectionReason}
            >
              Reject
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </LocalizationProvider>
  );
};

export default AdminTimesheetManagement;