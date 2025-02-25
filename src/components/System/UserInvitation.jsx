import React, { useState } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

const UserInvitation = () => {
  const [openForm, setOpenForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    middleName: "",
    lastName: "",
    userLevel: "",
    country: "",
    linkStatus: "",
    expiryDate: "",
    notification: "",
  });

  const handleOpenForm = () => setOpenForm(true);
  const handleCloseForm = () => {
    setOpenForm(false);
    setFormData({
      email: "",
      firstName: "",
      middleName: "",
      lastName: "",
      userLevel: "",
      country: "",
      linkStatus: "",
      expiryDate: "",
      notification: "",
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUsers([...users, formData]);
    handleCloseForm();
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenForm}
        >
          Add New
        </Button>
        <TextField 
          label="Search" 
          variant="outlined" 
          value={searchTerm} 
          onChange={handleSearchChange} 
          fullWidth 
          style={{ maxWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </div>

      <TableContainer component={Paper} style={{ marginTop: 20 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>User Level</TableCell>
              <TableCell>Link Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{user.firstName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.firstName}</TableCell>
                <TableCell>{user.lastName}</TableCell>
                <TableCell>{user.userLevel}</TableCell>
                <TableCell>{user.linkStatus}</TableCell>
                <TableCell>
                  <Button variant="outlined" color="success">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>User Invitation</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
            <TextField label="Email" name="email" value={formData.email} onChange={handleChange} required fullWidth />
            <TextField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required fullWidth />
            <TextField label="Middle Name" name="middleName" value={formData.middleName} onChange={handleChange} fullWidth />
            <TextField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required fullWidth />
            <TextField select label="User Level" name="userLevel" value={formData.userLevel} onChange={handleChange} required fullWidth>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="User">User</MenuItem>
            </TextField>
            <TextField label="Country" name="country" value={formData.country} onChange={handleChange} fullWidth />
            <TextField select label="Link Status" name="linkStatus" value={formData.linkStatus} onChange={handleChange} fullWidth>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Expired">Expired</MenuItem>
            </TextField>
            <TextField type="date" label="Expiry Link Date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Notification" name="notification" value={formData.notification} onChange={handleChange} fullWidth />
            <DialogActions>
              <Button onClick={handleCloseForm} variant="outlined" color="error">Cancel</Button>
              <Button type="submit" variant="contained" color="primary">Save</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserInvitation;