import React, { useState } from "react";

const EditEmployee = () => {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["basicInfo", "prevCompany", "currCompany", "documents"];

  const handleNext = () => {
    if (activeTab < tabs.length - 1) {
      setActiveTab(activeTab + 1);
    }
  };

  const handlePrevious = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  const handleSave = () => {
    alert("Employee details updated successfully!");
    // Add logic to save employee details
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Edit Employee Details</h2>
      <div className="card shadow-lg">
        <div className="card-body">
          <ul className="nav nav-tabs">
            {tabs.map((tab, index) => (
              <li className="nav-item" key={tab}>
                <button
                  className={`nav-link ${activeTab === index ? "active" : ""}`}
                  onClick={() => setActiveTab(index)}
                >
                  {tab === "basicInfo"
                    ? "Basic Info"
                    : tab === "prevCompany"
                    ? "Previous Company"
                    : tab === "currCompany"
                    ? "Current Company"
                    : "Documents"}
                </button>
              </li>
            ))}
          </ul>

          <div className="tab-content mt-4">
            {/* Basic Info Tab */}
            {activeTab === 0 && (
              <div>
                <h4 className="text-primary mb-3">Basic Info</h4>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label>First Name</label>
                    <input type="text" className="form-control" placeholder="Enter first name" />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Last Name</label>
                    <input type="text" className="form-control" placeholder="Enter last name" />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Date of Birth</label>
                    <input type="date" className="form-control" />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Gender</label>
                    <select className="form-control">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Mobile No</label>
                    <input type="tel" className="form-control" placeholder="Enter mobile number" />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Email</label>
                    <input type="email" className="form-control" placeholder="Enter email" />
                  </div>
                </div>
              </div>
            )}

            {/* Previous Company Details Tab */}
            {activeTab === 1 && (
              <div>
                <h4 className="text-primary mb-3">Previous Company Details</h4>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label>Position</label>
                    <input type="text" className="form-control" placeholder="Enter position" />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Salary</label>
                    <input type="number" className="form-control" placeholder="Enter salary" />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Experience</label>
                    <input type="text" className="form-control" placeholder="Enter experience" />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Skills</label>
                    <textarea className="form-control" rows="3" placeholder="Enter skills"></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* Current Company Details Tab */}
            {activeTab === 2 && (
              <div>
                <h4 className="text-primary mb-3">Current Company Details</h4>
                <div className="row">
                <div className="col-md-6 mb-3">
                    <label>Employee ID</label>
                    <input type="text" className="form-control" placeholder="Enter employee ID" />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Position</label>
                    <input type="text" className="form-control" placeholder="Enter position" />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Salary</label>
                    <input type="number" className="form-control" placeholder="Enter salary" />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Department</label>
                    <input type="text" className="form-control" placeholder="Enter department" />
                  </div>
                  
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 3 && (
              <div>
                <h4 className="text-primary mb-3">Documents</h4>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label>Passport Photo</label>
                    <input type="file" className="form-control" />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Aadhar Card</label>
                    <input type="file" className="form-control" />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>PAN Card</label>
                    <input type="file" className="form-control" />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-4 d-flex justify-content-between">
              {activeTab > 0 && (
                <button className="btn btn-warning" onClick={handlePrevious}>
                  Previous
                </button>
              )}
              {activeTab < tabs.length - 1 ? (
                <button className="btn btn-primary" onClick={handleNext}>
                  Next
                </button>
              ) : (
                <button className="btn btn-success" onClick={handleSave}>
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEmployee;
