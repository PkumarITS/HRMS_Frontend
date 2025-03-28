import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import {
  Search,
  Logout,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon,
  MonetizationOn as MonetizationOnIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  BarChart as BarChartIcon,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { Settings2Icon } from "lucide-react";
import Cookies from "js-cookie"; // Import js-cookie

// Import the profile images from the assets folder
import maleIcon from "../assets/male.png";
import femaleIcon from "../assets/female.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [systemOpen, setSystemOpen] = useState(false);

  axios.defaults.withCredentials = true;

  // Mock user data - Replace with dynamic user info (e.g., from API)
  const userName = "Aishwarya Sahane";
  const userGender = "female"; // Set gender as "male" or "female"

  const handleLogout = async () => {
    try {
      // Call the backend logout endpoint
      await axios.post(
        "http://localhost:1010/api/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`, // Send the token in the header
          },
          withCredentials: true, // Ensure cookies are sent with the request
        }
      );

      // Clear cookies on the client side
      Cookies.remove("token");
      Cookies.remove("role");

      // Redirect to the login page
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      alert("Please enter a search term.");
      return;
    }
    const routes = [
      "/dashboard",
      "/dashboard/employee",
      "/dashboard/system",
      "/dashboard/organization",
      "/dashboard/timesheet",
      "/dashboard/attendence",
      "/dashboard/leave",
      "/dashboard/salary",
      "/dashboard/project",
      "/dashboard/profile",
      "/dashboard/report",
      "/dashboard/holiday",
      "/dashboard/Registration",
    ];
    const matchedRoute = routes.find((route) =>
      route.includes(searchQuery.toLowerCase())
    );
    if (matchedRoute) {
      navigate(matchedRoute);
    } else {
      alert("Search not found");
    }
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const toggleSystemMenu = () => {
    setSystemOpen(!systemOpen);
  };
  const toggleLeaveMenu = () => {
    setLeaveOpen(!leaveOpen);
  };

  const toggleProjectMenu = () => {
    setProjectOpen(!projectOpen);
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, link: "/dashboard" },
    { text: "Employees", icon: <PeopleIcon />, link: "/dashboard/employee" },
    {
      text: "System",
      icon: <Settings2Icon />,
      action: toggleSystemMenu,
      subItems: [
        { text: "Users", link: "/dashboard/system/users" },
        { text: "Registration", link: "/auth/RegistrationPage" },
      ],
    },
    {
      text: "Organization",
      icon: <BusinessIcon />,
      link: "/dashboard/organization",
    },
    {
      text: "Timesheet",
      icon: <AccessTimeIcon />,
      link: "/dashboard/timesheet",
    },
    {
      text: "Attendance",
      icon: <CalendarTodayIcon />,
      link: "/dashboard/attendence",
    },
    {
      text: "Leave Management",
      icon: <CalendarTodayIcon />,
      action: toggleLeaveMenu,
      subItems: [
        { text: "Leave Request", link: "/dashboard/leaves/leave" },
        { text: "Leave Balance", link: "/dashboard/leaves/leavebalance" },
        { text: "Holiday Calendar", link: "/dashboard/leaves/holiday" },
      ],
    },
    { text: "Salary", icon: <MonetizationOnIcon />, link: "/dashboard/salary" },
    {
      text: "Projects",
      icon: <WorkIcon />,
      action: toggleProjectMenu,
      subItems: [
        { text: "Project", link: "/dashboard/projects/project" },
        { text: "Task", link: "/dashboard/projects/task" },
        { text: "Timesheet", link: "/dashboard/projects/project_timesheet" },
        { text: "Team Leader", link: "/dashboard/projects/leader" },
      ],
    },
    { text: "Profile", icon: <PersonIcon />, link: "/dashboard/profile" },
    { text: "Report", icon: <BarChartIcon />, link: "/dashboard/report" },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* AppBar */}
      <AppBar position="static" color="primary">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              src={userGender === "male" ? maleIcon : femaleIcon}
              alt="User Profile"
              onClick={handleProfileClick}
              sx={{ cursor: "pointer", width: 48, height: 48 }}
            />
            <Typography variant="h6" component="div">
              {userName}
            </Typography>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileClose}
            >
              <MenuItem onClick={handleProfileClose}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ backgroundColor: "white", borderRadius: 1 }}
            />
            <IconButton color="inherit" onClick={handleSearch}>
              <Search />
            </IconButton>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Logout />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar and Main Content */}
      <Box sx={{ display: "flex", flexGrow: 1 }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: { xs: "100%", sm: "250px" },
            backgroundColor: "#1e293b",
            color: "white",
            display: "flex",
            flexDirection: "column",
            p: 2,
            gap: 1,
          }}
        >
          <List>
            {menuItems.map((item, index) => (
              <React.Fragment key={index}>
                <ListItem disablePadding>
                  <ListItemButton
                    component={item.link ? Link : "button"}
                    to={item.link || "#"}
                    onClick={
                      item.text === "System"
                        ? toggleSystemMenu
                        : item.text === "Leave Management"
                        ? toggleLeaveMenu
                        : item.text === "Projects"
                        ? toggleProjectMenu
                        : undefined
                    }
                    sx={{
                      "&:hover": {
                        backgroundColor: "#64748b",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: "white" }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                    {item.subItems ? (
                      item.text === "System" && systemOpen ? (
                        <ExpandLess />
                      ) : item.text === "Leave Management" && leaveOpen ? (
                        <ExpandLess />
                      ) : item.text === "Projects" && projectOpen ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      )
                    ) : null}
                  </ListItemButton>
                </ListItem>

                {item.subItems && (
                  <Collapse
                    in={
                      (item.text === "System" && systemOpen) ||
                      (item.text === "Leave Management" && leaveOpen) ||
                      (item.text === "Projects" && projectOpen)
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
                          sx={{ pl: 4, "&:hover": { backgroundColor: "#64748b" } }}
                        >
                          <ListItemText primary={subItem.text} />
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
        <Box sx={{ flexGrow: 1, p: 3, backgroundColor: "#f8fafc" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;