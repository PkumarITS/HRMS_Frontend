import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  InputAdornment,
  Select,
  MenuItem,
} from "@mui/material";
import { Search, Edit, Delete } from "@mui/icons-material";

// Mock Data
const initialHolidays = [
  { id: 1, day: "Tuesday", date: "January 26, 2021", name: "Republic Day" },
  { id: 2, day: "Friday", date: "April 2, 2021", name: "Good Friday" },
  { id: 3, day: "Monday", date: "April 30, 2021", name: "Memorial Day" },
  { id: 4, day: "Wednesday", date: "August 15, 2021", name: "Independence Day" },
];

const Holiday = () => {
  const [holidays, setHolidays] = useState(initialHolidays);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesLimit, setEntriesLimit] = useState(10);
  const [openModal, setOpenModal] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ name: "", date: "" });

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleEntriesChange = (e) => {
    setEntriesLimit(e.target.value);
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleAddHoliday = () => {
    if (!newHoliday.name || !newHoliday.date) {
      alert("Please fill out all fields.");
      return;
    }
    const day = new Date(newHoliday.date).toLocaleDateString("en-US", {
      weekday: "long",
    });
    setHolidays([
      ...holidays,
      { id: holidays.length + 1, day, date: newHoliday.date, name: newHoliday.name },
    ]);
    setNewHoliday({ name: "", date: "" });
    handleCloseModal();
  };

  const handleDeleteHoliday = (id) => {
    setHolidays(holidays.filter((holiday) => holiday.id !== id));
  };

  const filteredHolidays = holidays.filter(
    (holiday) =>
      holiday.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      holiday.date.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: 3, backgroundColor: "#f8fafc" }}>
      <Typography variant="h4" gutterBottom>
        Holidays
      </Typography>

      {/* Add Holiday Button */}
      <Button variant="contained" color="primary" onClick={handleOpenModal}>
        + Add Holiday
      </Button>

      {/* Search and Show Entries */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
        <Select
          value={entriesLimit}
          onChange={handleEntriesChange}
          sx={{ width: 100 }}
        >
          <MenuItem value={10}>Show 10</MenuItem>
          <MenuItem value={20}>Show 20</MenuItem>
          <MenuItem value={50}>Show 50</MenuItem>
        </Select>

        <TextField
          variant="outlined"
          size="small"
          placeholder="Search"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
      </Box>

      {/* Holiday Table */}
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Holiday Day</TableCell>
              <TableCell>Holiday Date</TableCell>
              <TableCell>Holiday Name</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredHolidays.slice(0, entriesLimit).map((holiday, index) => (
              <TableRow key={holiday.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{holiday.day}</TableCell>
                <TableCell>{holiday.date}</TableCell>
                <TableCell>{holiday.name}</TableCell>
                <TableCell>
                  <IconButton color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteHoliday(holiday.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Holiday Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            width: 400,
            backgroundColor: "white",
            p: 3,
            borderRadius: 2,
            mx: "auto",
            mt: "10%",
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Add Holiday
          </Typography>
          <TextField
            fullWidth
            label="Holiday Name"
            variant="outlined"
            value={newHoliday.name}
            onChange={(e) =>
              setNewHoliday({ ...newHoliday, name: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Holiday Date"
            variant="outlined"
            type="date"
            value={newHoliday.date}
            onChange={(e) =>
              setNewHoliday({ ...newHoliday, date: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button variant="contained" color="primary" onClick={handleAddHoliday}>
              Add
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

export default Holiday;
