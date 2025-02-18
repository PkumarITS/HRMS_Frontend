import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Login from './components/login';
import Dashboard from './components/Dashboard'; // Import Dashboard component
import EmployeeDashboard from './components/EmployeeDashboard/EmployeeDashboard'; // 
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Employee from './components/Employee';
import Profile from './components/Profile';
import Organization from './components/Organization';
import AddDepartment from './components/AddDepartment';
import AddEmployee from './components/AddEmployee';
import EditEmployee from './components/EditEmployee';
import ForgetPassword from './components/ForgetPassword';
import Leave from './components/Leaves/Leave';
import Salary from './components/Salary';
import Attendance from './components/Attendence';
import Holiday from './components/Leaves/Holiday';
import Project from './components/Projects/Project';
import Task from './components/Projects/Task';
import Leavebalance from './components/Leaves/LeaveBalance';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} /> {/* Login Route */}
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} > 
        
        <Route path='' element={<Home/>}></Route>

        <Route path='/dashboard/employee' element={<Employee/>}></Route>

        <Route path='/dashboard/profile' element={<Profile/>}></Route>
        <Route path='/dashboard/leaves/leave' element={<Leave/>}></Route>
        <Route path='/dashboard/salary' element={<Salary/>}></Route>
        <Route path='/dashboard/attendence' element={<Attendance/>}></Route>
        <Route path='/dashboard/leaves/holiday' element={<Holiday/>}></Route>
        <Route path='/dashboard/leaves/leavebalance' element={<Leavebalance/>}></Route>

        <Route path='/dashboard/Projects/project' element={<Project/>}></Route>
        <Route path='/dashboard/Projects/task' element={<Task/>}></Route>





        <Route path='/dashboard/organization' element={<Organization/>}></Route>
        <Route path='/dashboard/add_department' element={<AddDepartment />}></Route>
        <Route path='/dashboard/add_employee' element={<AddEmployee />}></Route>
        <Route path='/dashboard/edit_employee' element={<EditEmployee />}></Route>





       </Route>
       <Route path="/employeedashboard/employeedashboard" element={<EmployeeDashboard />} > 
      </Route>
      </Routes>
    </Router>
  );
}

export default App;
