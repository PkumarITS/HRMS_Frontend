import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";
const Attendance = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [dateFilter, setDateFilter] = useState("Last 30 Days");
  const [customDateRange, setCustomDateRange] = useState({
    from: "",
    to: "",
  });

  const [attendanceData, setAttendanceData] = useState([
    {
      empId: "E001",
      name: "John Doe",
      team: "Development",
      date: "2025-01-27",
      checkIn: "9:00 AM",
      checkOut: "6:00 PM",
      activeHours: "8 hrs",
    },
    {
      empId: "E002",
      name: "Jane Smith",
      team: "Marketing",
      date: "2025-01-15",
      checkIn: "9:30 AM",
      checkOut: "6:30 PM",
      activeHours: "8 hrs",
    },
  ]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Add logic to filter data by Employee ID
    console.log("Search for Employee ID:", employeeId);
  };

  const handleDateFilterChange = (e) => {
    const value = e.target.value;
    setDateFilter(value);

    if (value !== "Date Range") {
      // Logic to filter attendance data based on predefined ranges
      console.log(`Filtering data for: ${value}`);
    }
  };

  const handleCustomDateChange = (field, value) => {
    setCustomDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyCustomDateFilter = () => {
    // Logic to filter attendance data based on custom date range
    console.log("Filtering data for Custom Range:", customDateRange);
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Attendance Management</h2>

      {/* Filters Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        {/* Search by Employee ID */}
        <form className="d-flex" onSubmit={handleSearch}>
          <input
            type="text"
            className="form-control me-2"
            placeholder="Search by Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        {/* Date Filter */}
        <div className="d-flex align-items-center">
          <select
            className="form-select me-2"
            value={dateFilter}
            onChange={handleDateFilterChange}
          >
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Last 60 Days">Last 60 Days</option>
            <option value="Last 90 Days">Last 90 Days</option>
            <option value="Date Range">Date Range</option>
          </select>

          {/* Show Custom Date Range Inputs */}
          {dateFilter === "Date Range" && (
            <div className="d-flex">
              <input
                type="date"
                className="form-control me-2"
                placeholder="From Date"
                value={customDateRange.from}
                onChange={(e) => handleCustomDateChange("from", e.target.value)}
              />
              <input
                type="date"
                className="form-control me-2"
                placeholder="To Date"
                value={customDateRange.to}
                onChange={(e) => handleCustomDateChange("to", e.target.value)}
              />
              <button
                className="btn btn-primary"
                onClick={applyCustomDateFilter}
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Table */}
      <table className="table table-bordered">
        <thead className="table-primary">
          <tr>
            <th>Emp ID</th>
            <th>Emp Name</th>
            <th>Team</th>
            <th>Date</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Active Hours</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.map((record, index) => (
            <tr key={index}>
              <td>{record.empId}</td>
              <td>{record.name}</td>
              <td>{record.team}</td>
              <td>{record.date}</td>
              <td>{record.checkIn}</td>
              <td>{record.checkOut}</td>
              <td>{record.activeHours}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Attendance;
