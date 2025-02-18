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

// Import the profile images from the assets folder
import maleIcon from "../assets/male.png";
import femaleIcon from "../assets/female.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);

  axios.defaults.withCredentials = true;

  // Mock user data - Replace with dynamic user info (e.g., from API)
  const userName = "Aishwarya Sahane";
  const userGender = "female"; // Set gender as "male" or "female"

  const handleLogout = () => {
    axios.get("http://localhost:3000/auth/logout").then((result) => {
      if (result.data.Status) {
        localStorage.removeItem("valid");
        navigate("/");
      }
    });
  };

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      alert("Please enter a search term.");
      return;
    }
    const routes = [
      "/dashboard",
      "/dashboard/employee",
      "/dashboard/organization",
      "/dashboard/timesheet",
      "/dashboard/attendence",
      "/dashboard/leave",
      "/dashboard/salary",
      "/dashboard/project",
      "/dashboard/profile",
      "/dashboard/report",
      "/dashboard/holiday",

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

  const toggleLeaveMenu = () => {
    setLeaveOpen(!leaveOpen);
  };

  const toggleProjectMenu = () => {
    setProjectOpen(!projectOpen);
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, link: "/dashboard" },
    { text: "Employees", icon: <PeopleIcon />, link: "/dashboard/employee" },
    { text: "Organization", icon: <BusinessIcon />, link: "/dashboard/organization" },
    { text: "Timesheet", icon: <AccessTimeIcon />, link: "/dashboard/timesheet" },
    { text: "Attendance", icon: <CalendarTodayIcon />, link: "/dashboard/attendence" },
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
              <>
                <ListItem key={index} disablePadding>
                  <ListItemButton
                    component={item.link ? Link : "button"}
                    to={item.link || "#"}
                    onClick={item.action || undefined}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#64748b",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                    {item.subItems && (item === menuItems[5] ? leaveOpen : projectOpen) ? (
                      <ExpandLess />
                    ) : (
                      item.subItems && <ExpandMore />
                    )}
                  </ListItemButton>
                </ListItem>
                {item.subItems && (
                  <Collapse
                    in={item === menuItems[5] ? leaveOpen : projectOpen}
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
              </>
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
