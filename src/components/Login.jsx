import React, { useState } from 'react';
import './style.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [values, setValues] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [checkboxError, setCheckboxError] = useState(null);
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  const handleSubmit = (event) => {
    event.preventDefault();

    // Check if terms and conditions checkbox is selected
    const isChecked = document.getElementById('tick').checked;
    if (!isChecked) {
      setCheckboxError('Please agree to the terms & conditions.');
      return;
    } else {
      setCheckboxError(null);
    }

    axios
      .post('http://localhost:3000/auth/adminlogin', values)
      .then((result) => {
        if (result.data.loginStatus) {
          localStorage.setItem('valid', true);
          navigate('/dashboard');
        } else {
          setError(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 loginPage">
      <div className="p-4 rounded w-25 border loginForm">
        <div className="text-danger mb-3">
          {error && <strong>{error}</strong>}
          {checkboxError && <strong>{checkboxError}</strong>}
        </div>
        <h2 className="text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email">
              <strong>Email:</strong>
            </label>
            <input
              type="email"
              name="email"
              autoComplete="off"
              placeholder="Enter Email"
              onChange={(e) => setValues({ ...values, email: e.target.value })}
              className="form-control rounded-0"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password">
              <strong>Password:</strong>
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              onChange={(e) =>
                setValues({ ...values, password: e.target.value })
              }
              className="form-control rounded-0"
              required
            />
          </div>
          <div className="mb-3">
            <input type="checkbox" name="tick" id="tick" className="me-2" />
            <label htmlFor="tick">I agree with terms & conditions</label>
          </div>
          <button className="btn btn-success w-100 rounded-0 mb-3">
            Log in
          </button>
          <div className="d-flex justify-content-between">
            <a href="/forgot-password" className="text-decoration-none">
              Forgot Password?
            </a>
           
          </div>
        </form>
      </div>
    </div> 
  );
};

export default Login;
