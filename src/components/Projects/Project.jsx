import React, { useState, useEffect } from "react";
import {
  Box, Button, Typography, TextField, Modal, Card, CardContent, CardActions,
  IconButton, Tabs, Tab, MenuItem, Select, InputLabel, FormControl,
  LinearProgress, Chip, Divider, Tooltip, Badge, CircularProgress,
  Snackbar, Alert, List, ListItem, ListItemText, ListItemSecondaryAction,
  Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete
} from "@mui/material";
import {
  Edit, Delete, Add, Search, DateRange, AttachMoney, PriorityHigh,
  Notifications, Description, Category, CheckCircle, HourglassEmpty,
  ThumbUp, People, Assignment
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import Cookies from "js-cookie";

// Add axios interceptor for auth tokens
axios.interceptors.request.use(config => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const API_BASE_URL = "http://localhost:1010";

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  boxShadow: "0 4px 20px 0 rgba(0,0,0,0.08)",
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 8px 30px 0 rgba(0,0,0,0.12)"
  }
}));

const StatusChip = styled(Chip)(({ status }) => ({
  backgroundColor:
    status === "COMPLETED" ? "#e8f5e9" :
    status === "APPROVAL" ? "#fff3e0" : "#e3f2fd",
  color:
    status === "COMPLETED" ? "#2e7d32" :
    status === "APPROVAL" ? "#e65100" : "#1565c0",
  fontWeight: 600,
  borderRadius: "8px"
}));

const Project = () => {
  // State declarations
  const [employees, setEmployees] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tab, setTab] = useState("ALL");
  const [openModal, setOpenModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    category: "",
    startDate: "",
    endDate: "",
    notification: "TEAM_ONLY",
    priority: "MEDIUM",
    budget: "",
    description: "",
    status: "STARTED",
    progress: 0
  });
  const [openAssignmentModal, setOpenAssignmentModal] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [newAssignment, setNewAssignment] = useState({
    empId: "",
    empName: "",
    projectId: null
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });

  // Event handlers
  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleTabChange = (e, newValue) => setTab(newValue);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  // const handleOpenAssignmentModal = (projectId) => {
  //   setCurrentProjectId(projectId);
  //   setOpenAssignmentModal(true);
  //   // Fetch assignments for this project
  //   fetchAssignments(projectId);
  // }
  // 
  // ;
  const handleOpenAssignmentModal = async (projectId) => {
    setCurrentProjectId(projectId);
    setOpenAssignmentModal(true);
    await fetchEmployees(); // Fetch all employees initially
    fetchAssignments(projectId);
    setNewAssignment({
      empId: "",
      empName: "",
      projectId: projectId
    });
    setEmployeeSearch("");
  };

  const handleCloseAssignmentModal = () => setOpenAssignmentModal(false);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/admin/projects`);
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || "Failed to fetch projects",
          severity: "error"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);


//   const fetchEmployees = async () => {
//     try {
//         const response = await axios.get(`${API_BASE_URL}/admin/employees/all-employees`);
//         setEmployees(response.data.data);
//     } catch (error) {
//         console.error("Error fetching employees:", error);
//         setSnackbar({
//             open: true,
//             message: error.response?.data?.message || "Failed to fetch employees",
//             severity: "error"
//         });
//     }
// };
// Fetch employees with search
const fetchEmployees = async (searchQuery = "") => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/employees/search?query=${searchQuery}`);
    setEmployees(response.data.data);
    setFilteredEmployees(response.data.data);
  } catch (error) {
    console.error("Error fetching employees:", error);
    setSnackbar({
      open: true,
      message: error.response?.data?.message || "Failed to fetch employees",
      severity: "error"
    });
  }
};

 // Handle employee search
 const handleEmployeeSearch = async (searchValue) => {
  setEmployeeSearch(searchValue);
  if (searchValue.length > 0) {
    await fetchEmployees(searchValue);
  } else {
    setFilteredEmployees(employees);
  }
};

  // Fetch assignments for a project
  const fetchAssignments = async (projectId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/assignments/project/${projectId}`);
      setAssignments(response.data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to fetch assignments",
        severity: "error"
      });
    }
  };
  

  // Create project
  const handleCreateProject = async () => {
    if (!newProject.name || !newProject.category) {
      setSnackbar({
        open: true,
        message: "Please fill out all required fields",
        severity: "warning"
      });
      return;
    }

    try {
      const projectToCreate = {
        ...newProject,
        startDate: newProject.startDate ? new Date(newProject.startDate).toISOString() : null,
        endDate: newProject.endDate ? new Date(newProject.endDate).toISOString() : null
      };

      const response = await axios.post(`${API_BASE_URL}/admin/projects/add`, projectToCreate);
      setProjects([...projects, response.data]);
      
      setSnackbar({
        open: true,
        message: "Project created successfully",
        severity: "success"
      });
      handleCloseModal();
    } catch (error) {
      console.error("Error creating project:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to create project",
        severity: "error"
      });
    }
  };

  // Delete project
  const handleDeleteProject = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await axios.delete(`${API_BASE_URL}/admin/projects/${id}`);
        setProjects(projects.filter((project) => project.id !== id));
        setSnackbar({
          open: true,
          message: "Project deleted successfully",
          severity: "success"
        });
      } catch (error) {
        console.error("Error deleting project:", error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || "Failed to delete project",
          severity: "error"
        });
      }
    }
  };

  // Update project status
  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/admin/projects/${id}/status`, { status: newStatus });
      setProjects(projects.map((project) =>
        project.id === id ? response.data : project
      ));
      setSnackbar({
        open: true,
        message: "Status updated successfully",
        severity: "success"
      });
    } catch (error) {
      console.error("Error updating status:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to update status",
        severity: "error"
      });
    }
  };

  // Assignment handlers
  const handleAssignmentChange = (e) => {
    const { name, value } = e.target;
    setNewAssignment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // const handleCreateAssignment = async () => {
  //   if (!newAssignment.empId || !newAssignment.empName) {
  //     setSnackbar({
  //       open: true,
  //       message: "Please fill out all required fields",
  //       severity: "warning"
  //     });
  //     return;
  //   }

  //   try {
  //     const assignmentToCreate = {
  //       ...newAssignment,
  //       projectId: currentProjectId
  //     };
  //     const response = await axios.post(`${API_BASE_URL}/assignments`, assignmentToCreate);
  //     setAssignments([...assignments, response.data]);
  //     setNewAssignment({
  //       empId: "",
  //       empName: "",
  //       projectId: currentProjectId
  //     });
  //     setSnackbar({
  //       open: true,
  //       message: "Assignment created successfully",
  //       severity: "success"
  //     });
  //   } catch (error) {
  //     console.error("Error creating assignment:", error);
  //     setSnackbar({
  //       open: true,
  //       message: error.response?.data?.message || "Failed to create assignment",
  //       severity: "error"
  //     });
  //   }
  // };

  const handleCreateAssignment = async () => {
    if (!newAssignment.empId) {
        setSnackbar({
            open: true,
            message: "Please select an employee",
            severity: "warning"
        });
        return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/admin/assignments`, newAssignment);
        setAssignments([...assignments, response.data]);
        setSnackbar({
            open: true,
            message: "Assignment created successfully",
            severity: "success"
        });
        setNewAssignment({
            empId: "",
            empName: "",
            projectId: currentProjectId
        });
        setEmployeeSearch("");
    } catch (error) {
        console.error("Error creating assignment:", error);
        setSnackbar({
            open: true,
            message: error.response?.data?.message || "Failed to create assignment",
            severity: "error"
        });
    }
};

  const handleOpenDeleteDialog = (assignment) => {
    setAssignmentToDelete(assignment);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setAssignmentToDelete(null);
  };

  const handleDeleteAssignment = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/admin/assignments/${assignmentToDelete.id}`);
      setAssignments(assignments.filter(a => a.id !== assignmentToDelete.id));
      setSnackbar({
        open: true,
        message: "Assignment deleted successfully",
        severity: "success"
      });
      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Error deleting assignment:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to delete assignment",
        severity: "error"
      });
    }
  };

  const handleOpenEditModal = (assignment) => {
    setCurrentAssignment(assignment);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setCurrentAssignment(null);
  };

  const handleUpdateAssignment = async () => {
    if (!currentAssignment.empId || !currentAssignment.empName) {
      setSnackbar({
        open: true,
        message: "Please fill out all required fields",
        severity: "warning"
      });
      return;
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/admin/assignments/${currentAssignment.id}`,
        currentAssignment
      );
      setAssignments(assignments.map(a =>
        a.id === currentAssignment.id ? response.data : a
      ));
      setSnackbar({
        open: true,
        message: "Assignment updated successfully",
        severity: "success"
      });
      handleCloseEditModal();
    } catch (error) {
      console.error("Error updating assignment:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to update assignment",
        severity: "error"
      });
    }
  };

  // Filter projects based on tab and search query
  const filteredProjects = projects.filter(
    (project) =>
      (tab === "ALL" || project.status === tab) &&
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper functions
  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle fontSize="small" />;
      case "APPROVAL":
        return <ThumbUp fontSize="small" />;
      default:
        return <HourglassEmpty fontSize="small" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh"
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    
      <Box sx={{ p: 3, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Project Dashboard
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          gap: 2,
          flexWrap: "wrap"
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenModal}
          startIcon={<Add />}
          sx={{
            borderRadius: "10px",
            px: 3,
            py: 1,
            textTransform: "none"
          }}
        >
          New Project
        </Button>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{
            width: 300,
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              backgroundColor: "white"
            }
          }}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1 }} />
          }}
        />
      </Box>

      <Tabs
        value={tab}
        onChange={handleTabChange}
        textColor="primary"
        indicatorColor="primary"
        sx={{
          mb: 3,
          "& .MuiTabs-flexContainer": {
            gap: 1
          }
        }}
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
                badgeContent={projects.filter((p) => p.status === "STARTED").length}
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
              <ThumbUp fontSize="small" />
              Approval
              <Badge
                badgeContent={projects.filter((p) => p.status === "APPROVAL").length}
                color="primary"
              />
            </Box>
          }
          value="APPROVAL"
          sx={{ borderRadius: "8px", textTransform: "none" }}
        />
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircle fontSize="small" />
              Completed
              <Badge
                badgeContent={projects.filter((p) => p.status === "COMPLETED").length}
                color="primary"
              />
            </Box>
          }
          value="COMPLETED"
          sx={{ borderRadius: "8px", textTransform: "none" }}
        />
      </Tabs>

      {filteredProjects.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)"
          }}
        >
          <Typography variant="h6" color="textSecondary">
            No projects found. Create a new project to get started!
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
              xl: "repeat(4, 1fr)"
            },
            gap: 3
          }}
        >
          {filteredProjects.map((project) => (
            <StyledCard key={project.id}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2
                  }}
                >
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

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <Category fontSize="small" /> {project.category}
                </Typography>

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <DateRange fontSize="small" />
                    {formatDate(project.startDate)} - {formatDate(project.endDate)}
                  </Typography>
                  <Chip
                    label={project.priority.toLowerCase()}
                    size="small"
                    sx={{
                      backgroundColor:
                        project.priority === "HIGH"
                          ? "#ffebee"
                          : project.priority === "MEDIUM"
                          ? "#fff3e0"
                          : "#e8f5e9",
                      color:
                        project.priority === "HIGH"
                          ? "#c62828"
                          : project.priority === "MEDIUM"
                          ? "#e65100"
                          : "#2e7d32"
                    }}
                  />
                </Box>

                <Box sx={{ my: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={project.progress}
                    sx={{
                      height: 8,
                      borderRadius: 4
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 0.5
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {project.progress}%
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <AttachMoney fontSize="small" />
                    {project.budget ? project.budget.toLocaleString() : "N/A"}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  px: 2,
                  pb: 2
                }}
              >
                <Box>
                  <Select
                    value={project.status}
                    onChange={(e) => handleStatusChange(project.id, e.target.value)}
                    size="small"
                    sx={{
                      borderRadius: "8px",
                      "& .MuiSelect-select": { py: 0.75 }
                    }}
                  >
                    <MenuItem value="STARTED">Started</MenuItem>
                    <MenuItem value="APPROVAL">Approval</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                  </Select>
                </Box>
                <Box>
                  <Tooltip title="Assign to Employee">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenAssignmentModal(project.id)}
                    >
                      <People fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small" color="primary">
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardActions>
            </StyledCard>
          ))}
        </Box>
      )}

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            width: { xs: "90%", sm: "70%", md: "50%" },
            maxWidth: "800px",
            maxHeight: "90vh",
            overflowY: "auto",
            backgroundColor: "white",
            p: 4,
            borderRadius: "16px",
            mx: "auto",
            my: "5vh",
            boxShadow: 24
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Create New Project
          </Typography>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Project Name"
              variant="outlined"
              value={newProject.name}
              onChange={(e) =>
                setNewProject({ ...newProject, name: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Project Category</InputLabel>
              <Select
                label="Project Category"
                value={newProject.category}
                onChange={(e) =>
                  setNewProject({ ...newProject, category: e.target.value })
                }
              >
                <MenuItem value="UI/UX Design">UI/UX Design</MenuItem>
                <MenuItem value="Web Development">Web Development</MenuItem>
                <MenuItem value="Mobile Development">Mobile Development</MenuItem>
                <MenuItem value="Testing">Testing</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={newProject.startDate}
              onChange={(e) =>
                setNewProject({ ...newProject, startDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={newProject.endDate}
              onChange={(e) =>
                setNewProject({ ...newProject, endDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Notification Send</InputLabel>
              <Select
                label="Notification Send"
                value={newProject.notification}
                onChange={(e) =>
                  setNewProject({ ...newProject, notification: e.target.value })
                }
              >
                <MenuItem value="TEAM_ONLY">Team Only</MenuItem>
                <MenuItem value="LEADER_ONLY">Leader Only</MenuItem>
                <MenuItem value="ALL">All</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                label="Priority"
                value={newProject.priority}
                onChange={(e) =>
                  setNewProject({ ...newProject, priority: e.target.value })
                }
              >
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="LOW">Low</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Budget"
              type="number"
              value={newProject.budget}
              onChange={(e) =>
                setNewProject({ ...newProject, budget: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={newProject.description}
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
              sx={{ mb: 2 }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between"
            }}
          >
            <Button variant="contained" color="primary" onClick={handleCreateProject}>
              Create
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

     

      {/* <Modal open={openAssignmentModal} onClose={handleCloseAssignmentModal}>
    <Box
        sx={{
            width: { xs: "90%", sm: "70%", md: "50%" },
            maxWidth: "600px",
            maxHeight: "90vh",
            overflowY: "auto",
            backgroundColor: "white",
            p: 4,
            borderRadius: "16px",
            mx: "auto",
            my: "5vh",
            boxShadow: 24
        }}
    >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Assign Project to Employee
        </Typography>

        <Box sx={{ mb: 3 }}>
            <TextField
                fullWidth
                label="Search Employee"
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                    startAdornment: <Search fontSize="small" />
                }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Employee</InputLabel>
                <Select
                    label="Select Employee"
                    value={newAssignment.empId}
                    onChange={(e) => {
                        const selectedEmp = employees.find(emp => emp.empId === e.target.value);
                        setNewAssignment({
                            empId: e.target.value,
                            empName: selectedEmp ? selectedEmp.name : "",
                            projectId: currentProjectId
                        });
                    }}
                >
                    {employees
                        .filter(emp => 
                            emp.empId.toLowerCase().includes(employeeSearch.toLowerCase()) ||
                            emp.name.toLowerCase().includes(employeeSearch.toLowerCase())
                        )
                        .map((employee) => (
                            <MenuItem key={employee.empId} value={employee.empId}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                    <Typography>{employee.empId}</Typography>
                                    <Typography sx={{ ml: 2, color: "text.secondary" }}>
                                        {employee.name}
                                    </Typography>
                                </Box>
                            </MenuItem>
                        ))}
                </Select>
            </FormControl>

            <Button
                variant="contained"
                color="primary"
                onClick={handleCreateAssignment}
                startIcon={<Assignment />}
                sx={{ mb: 3 }}
                disabled={!newAssignment.empId}
            >
                Assign
            </Button>

            <Typography variant="h6" sx={{ mb: 2 }}>
                Current Assignments
            </Typography>
            {assignments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                    No employees assigned to this project yet.
                </Typography>
            ) : (
                <List>
                    {assignments.map((assignment) => (
                        <ListItem key={assignment.id}>
                            <ListItemText
                                primary={assignment.empName}
                                secondary={`Employee ID: ${assignment.empId}`}
                            />
                            <ListItemSecondaryAction>
                                <IconButton
                                    edge="end"
                                    onClick={() => handleOpenEditModal(assignment)}
                                >
                                    <Edit fontSize="small" />
                                </IconButton>
                                <IconButton
                                    edge="end"
                                    onClick={() => handleOpenDeleteDialog(assignment)}
                                >
                                    <Delete fontSize="small" color="error" />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>

        <Box
            sx={{
                display: "flex",
                justifyContent: "flex-end"
            }}
        >
            <Button variant="outlined" color="secondary" onClick={handleCloseAssignmentModal}>
                Close
            </Button>
        </Box>
    </Box>
</Modal> */}



const assignmentModal = (
<Modal open={openAssignmentModal} onClose={handleCloseAssignmentModal}>
      <Box
        sx={{
          width: { xs: "90%", sm: "70%", md: "50%" },
          maxWidth: "600px",
          maxHeight: "90vh",
          overflowY: "auto",
          backgroundColor: "white",
          p: 4,
          borderRadius: "16px",
          mx: "auto",
          my: "5vh",
          boxShadow: 24
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Assign Project to Employee
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Autocomplete
            freeSolo
            options={filteredEmployees}
            getOptionLabel={(option) => 
              `${option.empId} - ${option.name}` || ""
            }
            inputValue={employeeSearch}
            onInputChange={(event, newInputValue) => {
              handleEmployeeSearch(newInputValue);
            }}
            onChange={(event, newValue) => {
              if (newValue) {
                setNewAssignment({
                  empId: newValue.empId,
                  empName: newValue.name,
                  projectId: currentProjectId
                });
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Employee"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <Search sx={{ mr: 1 }} />
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography>{option.empId}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {option.name}
                  </Typography>
                </Box>
              </li>
            )}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateAssignment}
            startIcon={<Assignment />}
            sx={{ mb: 3 }}
            disabled={!newAssignment.empId}
          >
            Assign
          </Button>

          <Typography variant="h6" sx={{ mb: 2 }}>
            Current Assignments
          </Typography>
          {assignments.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No employees assigned to this project yet.
            </Typography>
          ) : (
            <List>
              {assignments.map((assignment) => (
                <ListItem key={assignment.id}>
                  <ListItemText
                    primary={assignment.empName}
                    secondary={`Employee ID: ${assignment.empId}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleOpenEditModal(assignment)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleOpenDeleteDialog(assignment)}
                    >
                      <Delete fontSize="small" color="error" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end"
          }}
        >
          <Button variant="outlined" color="secondary" onClick={handleCloseAssignmentModal}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );

      <Dialog open={openEditModal} onClose={handleCloseEditModal}>
        <DialogTitle>Edit Assignment</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Employee ID"
              name="empId"
              value={currentAssignment?.empId || ""}
              onChange={(e) =>
                setCurrentAssignment({
                  ...currentAssignment,
                  empId: e.target.value
                })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Employee Name"
              name="empName"
              value={currentAssignment?.empName || ""}
              onChange={(e) =>
                setCurrentAssignment({
                  ...currentAssignment,
                  empName: e.target.value
                })
              }
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal}>Cancel</Button>
          <Button onClick={handleUpdateAssignment} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this assignment for employee{" "}
            {assignmentToDelete?.empName}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteAssignment} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Project;