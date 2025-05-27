import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  Avatar,
  ListItemAvatar,
  Badge
} from "@mui/material";
import {
  DateRange,
  Category,
  CheckCircle,
  HourglassEmpty,
  People,
  Work
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/apiConfig";

// Configure axios
axios.interceptors.request.use(config => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const StyledCard = styled(Card)({
  borderRadius: "12px",
  boxShadow: "0 4px 20px 0 rgba(0,0,0,0.08)",
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 8px 30px 0 rgba(0,0,0,0.12)"
  }
});

const StatusChip = styled(Chip)(({ status, theme }) => ({
  backgroundColor:
    status === "COMPLETED" ? "#e8f5e9" : "#e3f2fd",
  color:
    status === "COMPLETED" ? "#2e7d32" : "#1565c0",
  fontWeight: 600,
  borderRadius: "8px"
}));

const MyProject = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tab, setTab] = useState("ALL");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const navigate = useNavigate();

  // Filter projects based on tab and search query
  useEffect(() => {
    let result = projects;

    // Apply tab filter
    if (tab !== "ALL") {
      result = result.filter(project => project.status === tab);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(project =>
        project.name.toLowerCase().includes(query) ||
        (project.id && project.id.toString().includes(query))
      );
    }

    setFilteredProjects(result);
  }, [projects, tab, searchQuery]);

  // Fetch all required data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get projects assigned to this employee
        const projectsResponse = await axios.get(`${API_BASE_URL}/projects/by-emp`);

        // Transform the data to match our frontend structure
        const transformedProjects = projectsResponse.data.map(project => ({
          id: project.id,
          name: project.name,
          category: project.category,
          startDate: project.startDate,
          description: project.description,
          endDate: project.endDate,
          status: project.status,
          // Get team members from assignedEmployeeNames
          teamMembers: project.assignedEmployeeNames?.map((name, index) => ({
            empName: name
          })) || []
        }));

        setProjects(transformedProjects);
      } catch (error) {
        console.error("Error fetching data:", error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || "Failed to fetch projects",
          severity: "error"
        });
        // If unauthorized, redirect to login
        if (error.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleTabChange = (e, newValue) => setTab(newValue);

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED": return <CheckCircle fontSize="small" />;
      default: return <HourglassEmpty fontSize="small" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Invalid date" : date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        My Projects
      </Typography>
      {/* <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        {currentEmployee?.name ? `Welcome, ${currentEmployee.name}!` : "Loading..."}
      </Typography> */}

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, gap: 2, flexWrap: "wrap" }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search projects by name or ID..."
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{
            width: 400,
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              backgroundColor: "white"
            }
          }}
          InputProps={{
            startAdornment: <Work sx={{ mr: 1 }} />
          }}
        />
      </Box>

      <Tabs
        value={tab}
        onChange={handleTabChange}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 3, "& .MuiTabs-flexContainer": { gap: 1 } }}
      >
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Badge badgeContent={projects.length} color="primary" />
              All
            </Box>
          }
          value="ALL"
          sx={{ borderRadius: "8px", textTransform: "none" }}
        />
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <HourglassEmpty fontSize="small" />
              Started
              <Badge
                badgeContent={projects.filter(p => p.status === "STARTED").length}
                color="primary"
              />
            </Box>
          }
          value="STARTED"
          sx={{ borderRadius: "8px", textTransform: "none" }}
        />
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircle fontSize="small" />
              Completed
              <Badge
                badgeContent={projects.filter(p => p.status === "COMPLETED").length}
                color="primary"
              />
            </Box>
          }
          value="COMPLETED"
          sx={{ borderRadius: "8px", textTransform: "none" }}
        />
      </Tabs>

      {filteredProjects.length === 0 ? (
        <Box sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "300px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)"
        }}>
          <Typography variant="h6" color="textSecondary">
            {tab === "ALL"
              ? "No projects assigned to you"
              : `No ${tab.toLowerCase()} projects found`}
          </Typography>
        </Box>
      ) : (
        <Box sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)"
          },
          gap: 3
        }}>
          {filteredProjects.map((project) => (
            <StyledCard key={project.id}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {project.name}
                  </Typography>
                  <StatusChip
                    label={project.status.toLowerCase()}
                    status={project.status}
                    icon={getStatusIcon(project.status)}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Category fontSize="small" /> {project.category || "No category"}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <DateRange fontSize="small" />
                  {formatDate(project.startDate)} - {formatDate(project.endDate)}
                </Typography>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  {project.description || "No description provided"}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  <People fontSize="small" sx={{ verticalAlign: "middle", mr: 1 }} />
                  Team Members ({project.teamMembers?.length || 0})
                </Typography>

                {project.teamMembers?.length > 0 ? (
                  <List dense sx={{ py: 0, maxHeight: 150, overflow: "auto" }}>
                    {project.teamMembers.map((member, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                            {member.empName?.split(" ").map(n => n[0]).join("") || "?"}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={member.empName || "Unknown member"}
                        />
                        {member.empId === currentEmployee?.employeeId && (
                          <Chip label="You" size="small" sx={{ ml: 1, backgroundColor: "#e3f2fd" }} />
                        )}
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    No team members assigned
                  </Typography>
                )}
              </CardContent>
            </StyledCard>
          ))}
        </Box>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyProject;