import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    Avatar,
    TextField,
    CircularProgress,
    Snackbar,
    Alert
} from "@mui/material";
import {
    Dashboard as DashboardIcon,
    AccessTime as AccessTimeIcon,
    CalendarToday as CalendarTodayIcon,
      People as PeopleIcon,
    CheckCircle as CheckCircleIcon,
    Settings as SettingsIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
    SettingsInputComponent as SettingsInputComponentIcon,
    
    Person as PersonIcon,
    Logout as LogoutIcon,
    MonetizationOn as MonetizationOnIcon,
    Work as WorkIcon,
    BarChart as BarChartIcon,
    ExpandLess,
    ExpandMore,
    Male as MaleIcon,
    Female as FemaleIcon,
} from "@mui/icons-material";
import Cookies from "js-cookie";
import UserService from "../service/UserService";
import { userContext } from "../context/ContextProvider";
import { useContext } from "react";


 
const HrDashboard = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [timeOpen, setTimeOpen] = useState(false);
    const [leaveOpen, setLeaveOpen] = useState(false);
    const [projectOpen, setProjectOpen] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const { actions } = useContext(userContext);
    
 
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = Cookies.get("token");
                if (!token) {
                    throw new Error("No authentication token found");
                }
 
                const response = await UserService.getCompleteProfile(token);
 
                if (response.employeeData) {
                    setProfileData(response.employeeData);
                } else {
                    throw new Error("No employee data found in response");
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
                setError(error.message || "Failed to load profile data");
                setSnackbarOpen(true);
            } finally {
                setLoading(false);
            }
        };
 
        fetchProfile();
    }, []);
 
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };
 
    const handleLogout = async () => {
        try {
            await UserService.logout();
            navigate("/", { replace: true });
        } catch (error) {
            console.error("Logout error:", error);
            Cookies.remove("token", { path: '/' });
            Cookies.remove("role", { path: '/' });
            navigate("/", { replace: true });
        }
    };
 
    const menuItems = [
  // Admin Dashboard
  actions.includes("VIEW_ADMIN_DASHBOARD") && {
    text: "Dashboard",
    icon: <DashboardIcon />,
    link: "/admin/dashboard",
  },
 
  // Employees
  actions.includes("MANAGE_EMPLOYEE") && {
    text: "Employees",
    icon: <PeopleIcon />,
    link: "/admin/employees",
  },
 
  // System
  (actions.includes("VIEW_USER_MANAGEMENT") ||
    actions.includes("CREATE_ACTIONS") ||
    actions.includes("CREATE_ROLE") ||
    actions.includes("VIEW_LIST_ACTIONS") ||
    actions.includes("VIEW_LIST_ROLES")) && {
    text: "System",
    icon: <SettingsIcon />,
    action: () => setSystemOpen(!systemOpen),
    subItems: [
      actions.includes("VIEW_USER_MANAGEMENT") && {
        text: "User Management",
        link: "/admin/user-management",
      },
      actions.includes("CREATE_ACTIONS") && {
        text: "Actions",
        link: "/admin/create-action",
      },
      actions.includes("CREATE_ROLE") && {
        text: "Roles",
        link: "/admin/create-role",
      },
      actions.includes("VIEW_LIST_ACTIONS") && {
        text: "List Actions",
        link: "/admin/list-actions",
      },
      actions.includes("VIEW_LIST_ROLES") && {
        text: "List Roles",
        link: "/admin/list-roles",
      },
    ].filter(Boolean),
  },
 
  // Projects (Admin)
  (actions.includes("MANAGE_PROJECT") || actions.includes("MANAGE_TASK")) && {
    text: "Projects",
    icon: <WorkIcon />,
    action: () => setProjectOpen(!projectOpen),
    subItems: [
      actions.includes("MANAGE_PROJECT") && {
        text: "Projects",
        link: "/admin/projects",
      },
      actions.includes("MANAGE_TASK") && {
        text: "Tasks",
        link: "/admin/projects/tasks",
      },
    ].filter(Boolean),
  },
 
  // Timesheets (Admin)
  actions.includes("MANAGE_TIMESHEET") && {
    text: "Timesheets",
    icon: <AccessTimeIcon />,
    link: "/admin/dashboard/timesheets",
  },
 
  // Leave Management (Admin)
  (actions.includes("MANAGE_LEAVE") ||
    actions.includes("MANAGE_LEAVE_TYPE") ||
    actions.includes("MANAGE_LEAVE_BALANCE") ||
    actions.includes("MANAGE_HOLIDAY")) && {
    text: "Leave Management",
    icon: <CalendarTodayIcon />,
    action: () => setLeaveOpen(!leaveOpen),
    subItems: [
      actions.includes("MANAGE_LEAVE") && {
        text: "Leaves",
        link: "/admin/leaves",
      },
      actions.includes("MANAGE_LEAVE_TYPE") && {
        text: "Leave Type",
        link: "/admin/leaves-type",
      },
      actions.includes("MANAGE_LEAVE_BALANCE") && {
        text: "Leave Balance",
        link: "/admin/leave-balance",
      },
      actions.includes("MANAGE_HOLIDAY") && {
        text: "Holiday",
        link: "/admin/holiday",
      },
    ].filter(Boolean),
  },
 
  // Attendance (Admin)
  actions.includes("MANAGE_ATTENDANCE") && {
    text: "Attendance",
    icon: <CheckCircleIcon />,
    link: "/admin/attendance",
  },
 
  // Profile (Both)
  actions.includes("VIEW_PROFILE") && {
    text: "Profile",
    icon: <PersonIcon />,
    link: "/admin/profile",
  },
 
  // User Home
  /*
  actions.includes("VIEW_USER_DASHBOARD") && {
    text: "Home",
    icon: <DashboardIcon />,
    link: "/user/employee-dashboard",
  }, */
 
  // Projects & Tasks (User)
 
  /*
  (actions.includes("VIEW_PROJECT") || actions.includes("VIEW_TASK")) && {
    text: "Projects & Tasks",
    icon: <WorkIcon />,
    action: () => setProjectOpen(!projectOpen),
    open: projectOpen,
    subItems: [
      actions.includes("VIEW_PROJECT") && {
        text: "My Projects",
        link: "/user/myproject",
      },
      actions.includes("VIEW_TASK") && {
        text: "My Tasks",
        link: "/user/mytask",
      },
    ].filter(Boolean),
  },   */
 
  // Time & Management (User)
  (actions.includes("VIEW_TIMESHEET") || actions.includes("VIEW_ATTENDANCE")) && {
    text: "Time & Management",
    icon: <AccessTimeIcon />,
    action: () => setTimeOpen(!timeOpen),
    open: timeOpen,
    subItems: [
      actions.includes("VIEW_TIMESHEET") && {
        text: "Timesheet",
        link: "/user/employee-dashboard/timesheet-detail",
      },
      actions.includes("VIEW_ATTENDANCE") && {
        text: "Attendance",
        link: "/user/employee-dashboard/attendence",
      },
    ].filter(Boolean),
  },
 
  // Leave Management (User)
  (actions.includes("VIEW_LEAVE") ||
    actions.includes("VIEW_LEAVE_BALANCE") ||
    actions.includes("VIEW_HOLIDAY")) && {
    text: "Leave Management",
    icon: <CalendarTodayIcon />,
    action: () => setLeaveOpen(!leaveOpen),
    open: leaveOpen,
    subItems: [
      actions.includes("VIEW_LEAVE") && {
        text: "Leave Request",
        link: "/user/leaves",
      },
      actions.includes("VIEW_LEAVE_BALANCE") && {
        text: "Leave Balance",
        link: "/user/leave-balance",
      },
      actions.includes("VIEW_HOLIDAY") && {
        text: "Holiday Calendar",
        link: "/user/holiday",
      },
    ].filter(Boolean),
  },
 
  // My Profile (User)
  actions.includes("VIEW_PROFILE") && {
    text: "My Profile",
    icon: <PersonIcon />,
    link: "/user/profile",
  },
].filter(Boolean);


    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <CircularProgress size={60} />
            </Box>
        );
    }
 
    const genderIcon = profileData?.personal?.gender?.toLowerCase() === 'male'
        ? <MaleIcon fontSize="small" color="primary" />
        : <FemaleIcon fontSize="small" color="secondary" />;
 
    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            {/* Error Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity="error"
                    sx={{ width: '100%' }}
                >
                    {error}
                </Alert>
            </Snackbar>
 
            <AppBar position="static" color="primary">
                <Toolbar sx={{ justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar
                            sx={{
                                width: 48,
                                height: 48,
                                backgroundColor: 'background.paper'
                            }}
                        >
                            {genderIcon}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                {profileData?.personal?.firstName || 'Unknown'} {profileData?.personal?.lastName || 'User'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="caption" sx={{ lineHeight: 1.2 }}>
                                    ID: {profileData?.personal?.empId || 'N/A'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
 
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <TextField
                            variant="outlined"
                            size="small"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ backgroundColor: "white", borderRadius: 1 }}
                        />
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<LogoutIcon />}
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
 
            <Box sx={{ display: "flex", flexGrow: 1 }}>
                <Box sx={{ width: 250, bgcolor: "#1e293b", color: "white", p: 2 }}>
                    <List>
                        {menuItems.map((item, index) => (
                            <React.Fragment key={index}>
                                <ListItem disablePadding>
                                    <ListItemButton
                                        component={item.link ? Link : "button"}
                                        to={item.link}
                                        onClick={item.action}
                                        sx={{ "&:hover": { bgcolor: "#64748b" } }}
                                    >
                                        <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
                                        <ListItemText primary={item.text} />
                                        {item.subItems && (item.open ? <ExpandLess /> : <ExpandMore />)}
                                    </ListItemButton>
                                </ListItem>
                                {item.subItems && (
                                    <Collapse in={item.open} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            {item.subItems.map((sub, subIndex) => (
                                                <ListItemButton
                                                    key={subIndex}
                                                    component={Link}
                                                    to={sub.link}
                                                    sx={{ pl: 4, "&:hover": { bgcolor: "#475569" } }}
                                                >
                                                    <ListItemText primary={sub.text} />
                                                </ListItemButton>
                                            ))}
                                        </List>
                                    </Collapse>
                                )}
                            </React.Fragment>
                        ))}
                    </List>
                </Box>
 
                <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "#f8fafc" }}>
                    <Box sx={{ backgroundColor: "white", borderRadius: 1, p: 2 }}>
                        {/* Render the child components here */}
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Welcome to the HR Dashboard
                        </Typography>
                        {/* This is where the child routes will be rendered */}
                    </Box>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};
 
export default HrDashboard;
 