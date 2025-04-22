import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  CircularProgress,
  Alert,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useTheme,
  TablePagination
} from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import * as XLSX from 'xlsx';

// Configure axios instance
const api = axios.create({
  baseURL: "http://localhost:1010",
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminLeaveBalance = () => {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [selectedBalance, setSelectedBalance] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const theme = useTheme();

  useEffect(() => {
    fetchLeaveBalances();
  }, [yearFilter]);

  const fetchLeaveBalances = async () => {
    try {
      setLoading(true);
      const response = await api.get("/adminuser/leave-balance/search", {
        params: {
          year: yearFilter,
          employeeId: searchTerm || undefined
        }
      });
      setBalances(response.data);
      if (response.data.length > 0) {
        setSelectedBalance(response.data[0]);
      }
    } catch (err) {
      console.error("Error fetching leave balances:", err);
      setError(err.response?.data?.message || "Failed to load leave balances");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLeaveBalances();
  };

  const handleExport = () => {
    if (!balances.length) return;
    
    const data = [
      ["Employee ID", "Year", "Annual Allotted", "Annual Used", "Annual Remaining", 
       "Sick Allotted", "Sick Used", "Sick Remaining", "Casual Allotted", 
       "Casual Used", "Casual Remaining", "Maternity Allotted", "Maternity Used", 
       "Maternity Remaining", "Paternity Allotted", "Paternity Used", "Paternity Remaining"]
    ];

    balances.forEach(balance => {
      data.push([
        balance.employeeId,
        balance.year,
        balance.annualAllotted,
        balance.annualUsed,
        balance.getAnnualRemaining,
        balance.sickAllotted,
        balance.sickUsed,
        balance.getSickRemaining,
        balance.casualAllotted,
        balance.casualUsed,
        balance.getCasualRemaining,
        balance.maternityAllotted,
        balance.maternityUsed,
        balance.getMaternityRemaining,
        balance.paternityAllotted,
        balance.paternityUsed,
        balance.getPaternityRemaining
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LeaveBalances");
    XLSX.writeFile(wb, `LeaveBalances_${yearFilter}.xlsx`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const chartData = selectedBalance ? [
    { name: "Annual Used", value: selectedBalance.annualUsed },
    { name: "Annual Remaining", value: selectedBalance.getAnnualRemaining },
    { name: "Sick Used", value: selectedBalance.sickUsed },
    { name: "Sick Remaining", value: selectedBalance.getSickRemaining },
    { name: "Casual Used", value: selectedBalance.casualUsed },
    { name: "Casual Remaining", value: selectedBalance.getCasualRemaining },
  ] : [];

  if (loading && !balances.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Employee Leave Balances
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={!balances.length}
          sx={{ borderRadius: 2 }}
        >
          Export All
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Filters
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <form onSubmit={handleSearch}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Search by Employee ID"
                      variant="outlined"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Year</InputLabel>
                      <Select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        label="Year"
                      >
                        {[2022, 2023, 2024, 2025].map((year) => (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      type="submit"
                      startIcon={<SearchIcon />}
                    >
                      Search
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={fetchLeaveBalances}
                      startIcon={<RefreshIcon />}
                    >
                      Refresh
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Employee List
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Employee ID</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Year</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Annual Remaining</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Sick Remaining</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Casual Remaining</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {balances
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((balance) => (
                        <TableRow 
                          key={`${balance.employeeId}-${balance.year}`}
                          hover
                          selected={selectedBalance?.employeeId === balance.employeeId && 
                                   selectedBalance?.year === balance.year}
                          onClick={() => setSelectedBalance(balance)}
                        >
                          <TableCell>{balance.employeeId}</TableCell>
                          <TableCell>{balance.year}</TableCell>
                          <TableCell sx={{ color: theme.palette.success.main }}>
                            {balance.getAnnualRemaining}/{balance.annualAllotted}
                          </TableCell>
                          <TableCell sx={{ color: theme.palette.success.main }}>
                            {balance.getSickRemaining}/{balance.sickAllotted}
                          </TableCell>
                          <TableCell sx={{ color: theme.palette.success.main }}>
                            {balance.getCasualRemaining}/{balance.casualAllotted}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={balances.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {selectedBalance && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Leave Details for {selectedBalance.employeeId} - {selectedBalance.year}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Leave Type</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Allotted</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Used</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Remaining</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Annual</TableCell>
                        <TableCell align="right">{selectedBalance.annualAllotted}</TableCell>
                        <TableCell align="right">{selectedBalance.annualUsed}</TableCell>
                        <TableCell align="right" sx={{ color: theme.palette.success.main }}>
                          {selectedBalance.getAnnualRemaining}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Sick</TableCell>
                        <TableCell align="right">{selectedBalance.sickAllotted}</TableCell>
                        <TableCell align="right">{selectedBalance.sickUsed}</TableCell>
                        <TableCell align="right" sx={{ color: theme.palette.success.main }}>
                          {selectedBalance.getSickRemaining}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Casual</TableCell>
                        <TableCell align="right">{selectedBalance.casualAllotted}</TableCell>
                        <TableCell align="right">{selectedBalance.casualUsed}</TableCell>
                        <TableCell align="right" sx={{ color: theme.palette.success.main }}>
                          {selectedBalance.getCasualRemaining}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Maternity</TableCell>
                        <TableCell align="right">{selectedBalance.maternityAllotted}</TableCell>
                        <TableCell align="right">{selectedBalance.maternityUsed}</TableCell>
                        <TableCell align="right" sx={{ color: theme.palette.success.main }}>
                          {selectedBalance.getMaternityRemaining}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Paternity</TableCell>
                        <TableCell align="right">{selectedBalance.paternityAllotted}</TableCell>
                        <TableCell align="right">{selectedBalance.paternityUsed}</TableCell>
                        <TableCell align="right" sx={{ color: theme.palette.success.main }}>
                          {selectedBalance.getPaternityRemaining}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Leave Utilization
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => 
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AdminLeaveBalance;