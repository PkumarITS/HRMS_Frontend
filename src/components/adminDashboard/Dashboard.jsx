import React, { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  CircularProgress,
  Snackbar,
  Alert
} from "@mui/material";
import {
  Logout,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarTodayIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  ExpandLess,
  ExpandMore,
  Male as MaleIcon,
  Female as FemaleIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import Cookies from "js-cookie";
import UserService from "../service/UserService";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [systemOpen, setSystemOpen] = useState(false);
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
        const errorMessage = error.message || "Failed to load profile data";
        setError(errorMessage);
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

  const handleLogout = () => {
    Cookies.remove("token", { path: "/" });
    Cookies.remove("role", { path: "/" });
    window.location.href = "/";
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, link: "/admin/dashboard" },
    { text: "Employees", icon: <PeopleIcon />, link: "/admin/employees" },
    {
      text: "System",
      icon: <SettingsIcon />,
      action: () => setSystemOpen(!systemOpen),
      subItems: [
        { text: "User Management", link: "/admin/user-management" },
      ],
    },
    {
      text: "Projects",
      icon: <WorkIcon />,
      action: () => setProjectOpen(!projectOpen),
      subItems: [
        { text: "Projects", link: "/admin/projects" },
        { text: "Tasks", link: "/admin/projects/tasks" },
      ],
    },
    { text: "Timesheets", icon: <AccessTimeIcon />, link: "/admin/dashboard/timesheets" },
    {
      text: "Leave Management",
      icon: <CalendarTodayIcon />,
      action: () => setLeaveOpen(!leaveOpen),
      subItems: [
        { text: "Leaves", link: "/admin/leaves" },
        { text: "Leave Type", link: "/admin/leaves-type" },
        { text: "Leave Balance", link: "/admin/leave-balance" },
        { text: "Holiday", link: "/admin/holiday" }
      ],
    },
    { text: "Attendance", icon: <CheckCircleIcon />, link: "/admin/attendance" },
    { text: "Profile", icon: <PersonIcon />, link: "/admin/profile" },
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

      {/* App Bar */}
      <AppBar position="static" color="primary">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                cursor: "pointer",
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
                {genderIcon}
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
              sx={{
                backgroundColor: "white",
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
                  '&:hover fieldset': {
                    borderColor: 'transparent',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'transparent',
                  },
                },
              }}
            />
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Logout />}
              onClick={handleLogout}
              sx={{
                fontWeight: 'bold',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                }
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar & Main Content */}
      <Box sx={{ display: "flex", flexGrow: 1 }}>
        {/* Sidebar */}
        <Box sx={{
          width: 250,
          bgcolor: "#1e293b",
          color: "white",
          p: 2,
          overflowY: 'auto'
        }}>
          <List>
            {menuItems.map((item, index) => (
              <React.Fragment key={index}>
                <ListItem disablePadding>
                  <ListItemButton
                    component={item.subItems ? "button" : Link}
                    to={item.subItems ? undefined : item.link}
                    onClick={item.subItems ? item.action : undefined}
                    sx={{
                      "&:hover": { bgcolor: "#64748b" },
                      borderRadius: 1,
                      mb: 0.5
                    }}
                  >
                    <ListItemIcon sx={{ color: "white", minWidth: '40px' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{ fontSize: '0.95rem' }}
                    />
                    {/* Show collapse icon only if there are sub-items */}
                    {item.subItems && (
                      (item.text === "Leave Management" ? leaveOpen
                        : item.text === "Projects" ? projectOpen
                          : item.text === "System" ? systemOpen
                            : false) ? <ExpandLess /> : <ExpandMore />
                    )}
                  </ListItemButton>
                </ListItem>

                {/* Submenu items */}
                {item.subItems && (
                  <Collapse
                    in={
                      item.text === "Leave Management" ? leaveOpen
                        : item.text === "Projects" ? projectOpen
                          : item.text === "System" ? systemOpen
                            : false
                    }
                    timeout="auto"
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {item.subItems.map((subItem, subIndex) => (
                        <ListItemButton
                          key={subIndex}
                          component={Link}
                          to={subItem.link}
                          sx={{
                            pl: 4,
                            "&:hover": { bgcolor: "#64748b" },
                            borderRadius: 1,
                            mb: 0.5
                          }}
                        >
                          <ListItemText
                            primary={subItem.text}
                            primaryTypographyProps={{ fontSize: '0.9rem' }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            ))}
          </List>

        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            bgcolor: "#f8fafc",
            overflowY: 'auto'
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;