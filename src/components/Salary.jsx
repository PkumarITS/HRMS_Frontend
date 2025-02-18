import React, { useState } from "react";

const Salary = () => {
  const [formData, setFormData] = useState({
    department: "",
    employee: "",
    basicSalary: "",
    allowances: "",
    deductions: "",
    payDate: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Salary Data Submitted: ", formData);
    // Add logic to submit the form data to the backend
    alert("Salary added successfully!");
  };

  return (
    <div className="container mt-5">
      {/* Heading */}
      <h2 className="text-center mb-4">Add New Salary</h2>

      {/* Form */}
      <form
        className="row g-4 p-4 rounded shadow"
        style={{ backgroundColor: "#f9f9f9" }}
        onSubmit={handleSubmit}
      >
        {/* Left Section */}
        <div className="col-md-6">
          <div className="mb-3">
            <label htmlFor="department" className="form-label">
              Department
            </label>
            <select
              name="department"
              id="department"
              className="form-select"
              value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              <option value="HR">HR</option>
              <option value="IT">IT</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="employee" className="form-label">
              Employee
            </label>
            <select
              name="employee"
              id="employee"
              className="form-select"
              value={formData.employee}
              onChange={handleChange}
              required
            >
              <option value="">Select Employee</option>
              <option value="John Doe">John Doe</option>
              <option value="Jane Smith">Jane Smith</option>
              <option value="Alice Johnson">Alice Johnson</option>
            </select>
          </div>
        </div>

        {/* Right Section */}
        <div className="col-md-6">
          <div className="mb-3">
            <label htmlFor="basicSalary" className="form-label">
              Basic Salary
            </label>
            <input
              type="number"
              name="basicSalary"
              id="basicSalary"
              className="form-control"
              placeholder="Enter Basic Salary"
              value={formData.basicSalary}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="allowances" className="form-label">
              Allowances
            </label>
            <input
              type="number"
              name="allowances"
              id="allowances"
              className="form-control"
              placeholder="Enter Allowances"
              value={formData.allowances}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Full Width for Deductions and Pay Date */}
        <div className="col-md-6">
          <label htmlFor="deductions" className="form-label">
            Deductions
          </label>
          <input
            type="number"
            name="deductions"
            id="deductions"
            className="form-control"
            placeholder="Enter Deductions"
            value={formData.deductions}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="payDate" className="form-label">
            Pay Date
          </label>
          <input
            type="date"
            name="payDate"
            id="payDate"
            className="form-control"
            value={formData.payDate}
            onChange={handleChange}
            required
          />
        </div>

        {/* Submit Button */}
        <div className="col-12">
          <button type="submit" className="btn btn-primary w-100">
            Add Salary
          </button>
        </div>
      </form>
    </div>
  );
};

export default Salary;
