
import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AddDepartment= () => {
    const [organization, setOrganization] = useState()
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        axios.post('http://localhost:3000/auth/add_organization', {organization})
        .then(result => {
            if(result.data.Status) {
                navigate('/dashboard/organization')
            } else {
                alert(result.data.Error)
            }
        })
        .catch(err => console.log(err))
    }
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
  <div className="p-4 shadow-lg rounded bg-white w-50">
    <h3 className="text-center text-primary mb-4">Add New Department</h3>
    <form onSubmit={handleSubmit}>
      {/* Department Input */}
      <div className="form-group mb-4">
        <label htmlFor="department" className="form-label">
          <strong>Department Name:</strong>
        </label>
        <input
          type="text"
          id="department"
          name="department"
          placeholder="Enter Department Name"
          onChange={(e) => setOrganization(e.target.value)}
          className="form-control form-control-lg"
        />
      </div>

      {/* Submit Button */}
      <button className="btn btn-primary w-100 btn-lg">
        <i className="bi bi-plus-circle me-2"></i>Add Department
      </button>
    </form>
  </div>
</div>

  )
}

export default AddDepartment
