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
        { text: "Home", icon: <DashboardIcon />, link: "/hr/hr-dashboard" },
        {
            text: "Projects & Tasks",
            icon: <WorkIcon />,
            action: () => setProjectOpen(!projectOpen),
            open: projectOpen,
            subItems: [
                { text: "My Projects", link: "/user/myproject" },
                { text: "My Tasks", link: "/user/mytask" },
            ],
        },
        {
            text: "Time & Management",
            icon: <AccessTimeIcon />,
            action: () => setTimeOpen(!timeOpen),
            open: timeOpen,
            subItems: [
                { text: "Timesheet", link: "/user/employee-dashboard/timesheet-detail" },
                { text: "Attendence", link: "/user/employee-dashboard/attendence" },
            ],
        },
        {
            text: "Leave Management",
            icon: <CalendarTodayIcon />,
            action: () => setLeaveOpen(!leaveOpen),
            open: leaveOpen,
            subItems: [
                { text: "Leave Request", link: "/user/leaves" },
                { text: "Leave Balance", link: "/user/leave-balance" },
                { text: "Holiday Calendar", link: "/user/holiday" },
            ],
        },
        { text: "My Profile", icon: <PersonIcon />, link: "/hr/profile" },
    ];

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