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
  Card,
  CardContent,
  Grid,
  Paper,
} from "@mui/material";
import {
  Search,
  Logout,
  Dashboard as DashboardIcon,
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
import maleIcon from "../../assets/male.png";
import femaleIcon from "../../assets/female.png";


const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);

  axios.defaults.withCredentials = true;

  const userName = "Aishwarya Sahane";
  const userGender = "female";

  const handleLogout = () => {
    axios.get("http://localhost:3000/auth/logout").then((result) => {
      if (result.data.Status) {
        localStorage.removeItem("valid");
        navigate("/");
      }
    });
  };

  const menuItems = [
    { text: "Home", icon: <DashboardIcon />, link: "#" },
    { text: "Attendance", icon: <CalendarTodayIcon />, link: "#" },
    {
      text: "Leave Management",
      icon: <CalendarTodayIcon />,
      action: () => setLeaveOpen(!leaveOpen),
      subItems: [
        { text: "Leave Request", link: "#" },
        { text: "Leave Balance", link: "#" },
        { text: "Holiday Calendar", link: "#" },
      ],
    },
    { text: "Expenses Sheet", icon: <MonetizationOnIcon />, link: "#" },
    {
      text: "Projects & Tasks",
      icon: <WorkIcon />,
      action: () => setProjectOpen(!projectOpen),
      subItems: [
        { text: "My Projects", link: "#" },
        { text: "My Tasks", link: "#" },
        { text: "Timesheet", link: "#" },
      ],
    },
    { text: " My Profile", icon: <PersonIcon />, link: "#" },
    { text: "Performance Report", icon: <BarChartIcon />, link: "#" },
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
              sx={{ width: 48, height: 48, cursor: "pointer" }}
            />
            <Typography variant="h6">{userName}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search"
              sx={{ backgroundColor: "white", borderRadius: 1 }}
            />
            <IconButton color="inherit">
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
        <Box sx={{ width: "250px", backgroundColor: "#1e293b", color: "white", p: 2 }}>
          <List>
            {menuItems.map((item, index) => (
              <>
                <ListItem key={index} disablePadding>
                  <ListItemButton
                    component={item.link ? Link : "button"}
                    to={item.link || "#"}
                    onClick={item.action || undefined}
                    sx={{ "&:hover": { backgroundColor: "#64748b" } }}
                  >
                    <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                    {item.subItems && (item === menuItems[2] ? leaveOpen : projectOpen) ? (
                      <ExpandLess />
                    ) : (
                      item.subItems && <ExpandMore />
                    )}
                  </ListItemButton>
                </ListItem>
                {item.subItems && (
                  <Collapse in={item === menuItems[2] ? leaveOpen : projectOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.subItems.map((subItem, subIndex) => (
                        <ListItemButton key={subIndex} component={Link} to={subItem.link} sx={{ pl: 4 }}>
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
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Upcoming Meetings</Typography>
                  <Typography variant="body2">No meetings scheduled</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default EmployeeDashboard;
