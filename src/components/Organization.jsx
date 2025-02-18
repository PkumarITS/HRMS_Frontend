import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Organization = () => {
  const [organization, setOrganization] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredOrganization, setFilteredOrganization] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:3000/auth/organization') // Adjust to your backend API
      .then((result) => {
        if (result.data.Status) {
          setOrganization(result.data.Result);
          setFilteredOrganization(result.data.Result); // Initialize filtered list
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  // Handle search input
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    setFilteredOrganization(
      organization.filter((org) =>
        org.name.toLowerCase().includes(value)
      )
    );
  };

  return (
    <div className="container mt-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <input
            type="text"
            className="form-control"
            placeholder="Search by Department"
            value={search}
            onChange={handleSearch}
            style={{ maxWidth: '300px' }}
          />
        </div>
        <Link to="/dashboard/add_department" className="btn btn-primary">
          Add New Department
        </Link>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-light">
            <tr>
              <th>Sr. No</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrganization.length > 0 ? (
              filteredOrganization.map((org, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{org.name}</td>
                  <td>
                    <button className="btn btn-sm btn-warning me-2">
                      Edit
                    </button>
                    <button className="btn btn-sm btn-danger">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">
                  No departments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Organization;
