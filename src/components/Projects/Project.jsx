import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Modal,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tabs,
  Tab,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

// Mock Data
const initialProjects = [
  {
    id: 1,
    name: "Website Redesign",
    category: "UI/UX Design",
    status: "Started",
    progress: "40%",
  },
  {
    id: 2,
    name: "E-commerce Development",
    category: "Web Development",
    status: "Approval",
    progress: "20%",
  },
  {
    id: 3,
    name: "Mobile App Testing",
    category: "Testing",
    status: "Completed",
    progress: "100%",
  },
];

const Project = () => {
  const [projects, setProjects] = useState(initialProjects);
  const [tab, setTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    category: "",
    startDate: "",
    endDate: "",
    notification: "",
    priority: "",
    budget: "",
    description: "",
  });

  const handleTabChange = (event, newTab) => {
    setTab(newTab);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleCreateProject = () => {
    if (!newProject.name || !newProject.category) {
      alert("Please fill out all required fields.");
      return;
    }

    setProjects([
      ...projects,
      {
        id: projects.length + 1,
        ...newProject,
        progress: "0%",
        status: "Started",
      },
    ]);
    setNewProject({
      name: "",
      category: "",
      startDate: "",
      endDate: "",
      notification: "",
      priority: "",
      budget: "",
      description: "",
    });
    handleCloseModal();
  };

  const handleDeleteProject = (id) => {
    setProjects(projects.filter((project) => project.id !== id));
  };

  const filteredProjects = projects.filter(
    (project) =>
      (tab === "All" || project.status === tab) &&
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: 3, backgroundColor: "#f8fafc" }}>
      <Typography variant="h4" gutterBottom>
        Projects
      </Typography>

      {/* Add Project Button and Search */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Button variant="contained" color="primary" onClick={handleOpenModal}>
          + Create Project
        </Button>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search Projects"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ width: 300 }}
        />
      </Box>

      {/* Tabs for Project Status */}
      <Tabs value={tab} onChange={handleTabChange} textColor="primary">
        <Tab label="All" value="All" />
        <Tab label="Started" value="Started" />
        <Tab label="Approval" value="Approval" />
        <Tab label="Completed" value="Completed" />
      </Tabs>

      {/* Project Cards */}
      <Box sx={{ mt: 3, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 2 }}>
        {filteredProjects.map((project) => (
          <Card key={project.id} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6">{project.name}</Typography>
              <Typography color="text.secondary">{project.category}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Progress: {project.progress}
              </Typography>
            </CardContent>
            <CardActions>
              <IconButton color="primary">
                <Edit />
              </IconButton>
              <IconButton color="error" onClick={() => handleDeleteProject(project.id)}>
                <Delete />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>

      {/* Create Project Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
  <Box
    sx={{
      width: "70%", // Increased width
      maxWidth: "800px", // Maximum width for responsiveness
      height: "80%", // Increased height
      maxHeight: "600px", // Maximum height for responsiveness
      overflowY: "auto", // Scroll within the modal only if needed
      backgroundColor: "white",
      p: 3,
      borderRadius: 2,
      mx: "auto",
      mt: "5%", // Adjust the top margin for proper centering
      boxShadow: 24,
    }}
  >
    <Typography variant="h6" gutterBottom>
      Create Project
    </Typography>

    <TextField
      fullWidth
      label="Project Name"
      variant="outlined"
      value={newProject.name}
      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
      sx={{ mb: 2 }}
    />
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel>Project Category</InputLabel>
      <Select
        value={newProject.category}
        onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
      >
        <MenuItem value="UI/UX Design">UI/UX Design</MenuItem>
        <MenuItem value="Web Development">Web Development</MenuItem>
        <MenuItem value="Testing">Testing</MenuItem>
        <MenuItem value="Other">Other</MenuItem>
      </Select>
    </FormControl>

    <TextField
      fullWidth
      label="Start Date"
      type="date"
      value={newProject.startDate}
      onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
      InputLabelProps={{ shrink: true }}
      sx={{ mb: 2 }}
    />
    <TextField
      fullWidth
      label="End Date"
      type="date"
      value={newProject.endDate}
      onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
      InputLabelProps={{ shrink: true }}
      sx={{ mb: 2 }}
    />
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel>Notification Send</InputLabel>
      <Select
        value={newProject.notification}
        onChange={(e) => setNewProject({ ...newProject, notification: e.target.value })}
      >
        <MenuItem value="Team Only">Team Only</MenuItem>
        <MenuItem value="Leader Only">Leader Only</MenuItem>
        <MenuItem value="All">All</MenuItem>
      </Select>
    </FormControl>

    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel>Priority</InputLabel>
      <Select
        value={newProject.priority}
        onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
      >
        <MenuItem value="High">High</MenuItem>
        <MenuItem value="Medium">Medium</MenuItem>
        <MenuItem value="Low">Low</MenuItem>
      </Select>
    </FormControl>

    <TextField
      fullWidth
      label="Budget"
      type="number"
      value={newProject.budget}
      onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
      sx={{ mb: 2 }}
    />
    <TextField
      fullWidth
      label="Description"
      multiline
      rows={3}
      value={newProject.description}
      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
      sx={{ mb: 2 }}
    />

    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
      <Button variant="contained" color="primary" onClick={handleCreateProject}>
        Create
      </Button>
      <Button variant="outlined" color="secondary" onClick={handleCloseModal}>
        Cancel
      </Button>
    </Box>
  </Box>
</Modal>

    </Box>
  );
};

export default Project;
