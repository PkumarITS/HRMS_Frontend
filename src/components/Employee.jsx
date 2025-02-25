import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Employee = () => {
  const [employee, setEmployee] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [searchDept, setSearchDept] = useState("");
  const navigate = useNavigate();


  
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = () => {
    axios
      .get("http://localhost:3000/auth/employee")
      .then((result) => {
        if (result.data.Status) {
          setEmployee(result.data.Result);
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  };

  const handleSearchById = () => {
    if (searchId) {
      axios
        .get(`http://localhost:3000/auth/employee/${searchId}`)
        .then((result) => {
          if (result.data.Status) {
            setEmployee([result.data.Result]);
          } else {
            alert(result.data.Error);
          }
        })
        .catch((err) => console.log(err));
    } else {
      alert("Please enter a valid Employee ID.");
    }
  };

  const handleSearchByDept = () => {
    if (searchDept) {
      axios
        .get(`http://localhost:3000/auth/employee/department/${searchDept}`)
        .then((result) => {
          if (result.data.Status) {
            setEmployee(result.data.Result);
          } else {
            alert(result.data.Error);
          }
        })
        .catch((err) => console.log(err));
    } else {
      alert("Please select a valid Department.");
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      axios
        .delete(`http://localhost:3000/auth/delete_employee/${id}`)
        .then((result) => {
          if (result.data.Status) {
            fetchEmployees();
          } else {
            alert(result.data.Error);
          }
        });
    }
  };

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["ID,Name,Department,Role"]
        .concat(
          employee.map(
            (emp) =>
              `${emp.id},${emp.name},${emp.department},${emp.role}`
          )
        )
        .join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "employee_data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">Employee Management</h2>
        <div>
          <Link to="/dashboard/add_employee" className="btn btn-outline-primary me-2">
            Add Employee
          </Link>
          <button
            onClick={fetchEmployees}
            className="btn btn-outline-primary me-2"
          >
            <Link to="/dashboard/employee_details" > 
            View All Employee Details
            </Link>
          </button>
          <button
            onClick={handleExportCSV}
            className="btn btn-outline-info"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Search Fields */}
      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <input
            type="text"
            placeholder="Search by Employee ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="form-control"
          />
          <button
            onClick={handleSearchById}
            className="btn btn-primary mt-2 w-100"
          >
            Search by ID
          </button>
        </div>
        <div className="col-md-6">
          <select
            className="form-select"
            value={searchDept}
            onChange={(e) => setSearchDept(e.target.value)}
          >
            <option value="">Select Department</option>
            <option value="Management">Management</option>
            <option value="Project Manager">Project Manager</option>
            <option value="Team Lead">Team Lead</option>
            <option value="Development Department">Development Department</option>
            <option value="HR Team">HR Team</option>
            <option value="QA Department">QA Department</option>
          </select>
          <button
            onClick={handleSearchByDept}
            className="btn btn-primary mt-2 w-100"
          >
            Search by Department
          </button>
        </div>
      </div>

     
    </div>
  );
};

export default Employee;
