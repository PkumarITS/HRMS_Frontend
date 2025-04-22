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
  useTheme
} from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import DownloadIcon from '@mui/icons-material/Download';
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

const LeaveBalance = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    fetchLeaveBalance();
  }, []);

  const fetchLeaveBalance = async () => {
    try {
      setLoading(true);
      const response = await api.get("/adminuser/leave-balance/my-balance");
      setBalance(response.data);
    } catch (err) {
      console.error("Error fetching leave balance:", err);
      setError(err.response?.data?.message || "Failed to load leave balance");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!balance) return;
    
    const data = [
      ["Leave Type", "Allotted", "Used", "Remaining"],
      ["Annual", balance.annualAllotted, balance.annualUsed, balance.getAnnualRemaining],
      ["Sick", balance.sickAllotted, balance.sickUsed, balance.getSickRemaining],
      ["Casual", balance.casualAllotted, balance.casualUsed, balance.getCasualRemaining],
      ["Maternity", balance.maternityAllotted, balance.maternityUsed, balance.getMaternityRemaining],
      ["Paternity", balance.paternityAllotted, balance.paternityUsed, balance.getPaternityRemaining],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LeaveBalance");
    XLSX.writeFile(wb, `LeaveBalance_${balance.year}.xlsx`);
  };

  const chartData = balance ? [
    { name: "Annual Used", value: balance.annualUsed },
    { name: "Annual Remaining", value: balance.getAnnualRemaining },
    { name: "Sick Used", value: balance.sickUsed },
    { name: "Sick Remaining", value: balance.getSickRemaining },
    { name: "Casual Used", value: balance.casualUsed },
    { name: "Casual Remaining", value: balance.getCasualRemaining },
  ] : [];

  if (loading) {
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

  if (!balance) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No leave balance data found.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          My Leave Balance - {balance.year}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          sx={{ borderRadius: 2 }}
        >
          Export to Excel
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Leave Summary
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
                      <TableCell align="right">{balance.annualAllotted}</TableCell>
                      <TableCell align="right">{balance.annualUsed}</TableCell>
                      <TableCell align="right" sx={{ color: theme.palette.success.main }}>
                        {balance.getAnnualRemaining}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Sick</TableCell>
                      <TableCell align="right">{balance.sickAllotted}</TableCell>
                      <TableCell align="right">{balance.sickUsed}</TableCell>
                      <TableCell align="right" sx={{ color: theme.palette.success.main }}>
                        {balance.getSickRemaining}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Casual</TableCell>
                      <TableCell align="right">{balance.casualAllotted}</TableCell>
                      <TableCell align="right">{balance.casualUsed}</TableCell>
                      <TableCell align="right" sx={{ color: theme.palette.success.main }}>
                        {balance.getCasualRemaining}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Maternity</TableCell>
                      <TableCell align="right">{balance.maternityAllotted}</TableCell>
                      <TableCell align="right">{balance.maternityUsed}</TableCell>
                      <TableCell align="right" sx={{ color: theme.palette.success.main }}>
                        {balance.getMaternityRemaining}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Paternity</TableCell>
                      <TableCell align="right">{balance.paternityAllotted}</TableCell>
                      <TableCell align="right">{balance.paternityUsed}</TableCell>
                      <TableCell align="right" sx={{ color: theme.palette.success.main }}>
                        {balance.getPaternityRemaining}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%' }}>
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
    </Box>
  );
};

export default LeaveBalance;