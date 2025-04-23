import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import RegistrationPage from './components/auth/RegistrationPage';
import UserManagement from './components/userManagement/UserMangement';
import UpdateUser from './components/userManagement/UserUpdate';
import Dashboard from './components/adminDashboard/Dashboard';
import EmployeeDashboard from './components/EmployeeDashboard/EmployeeDashboard';
import Employee from './components/employee/Employee';
import Profile from './components/Profile';
import AddEmployee from './components/employee/AddEmployee';
import Leave from './components/Leaves/Leave';
import Project from './components/Projects/Project';
import Task from './components/Projects/Task';
import EditEmployee from './components/employee/EditEmployee';
import EmployeeDetails from './components/employee/EmployeeDetails';
import ProtectedRoute from './components/context/ProtectedRoute';
import ContextProvider from './components/context/ContextProvider';
import TimesheetDetailPage from './components/EmployeeDashboard/TimesheetDetailPage';
import TimesheetForm from './components/EmployeeDashboard/TimesheetForm';
import LeaveBalance from './components/Leaves/LeaveBalance';
import MyProject from './components/EmployeeDashboard/MyProject';
import MyTask from './components/EmployeeDashboard/MyTask';
import AdminTimesheetManagement from './components/adminDashboard/AdminTimesheetManagement';
import TimesheetDetailView from './components/adminDashboard/TimesheetDetailView';
import NotificationSettings from './components/adminDashboard/NotificationSettings';
import TimesheetViewPage from './components/EmployeeDashboard/TimesheetViewPage';
import LeaveRequest from './components/adminDashboard/LeaveRequest';
import AdminLeaveBalance from './components/adminDashboard/AdminLeaveBalance';
import HolidayAdmin from './components/adminDashboard/HolidayAdmin';
import HolidayUser from './components/Leaves/HolidayUser';
import UserAttendance from './components/EmployeeDashboard/UserAttendence';
import AdminAttendance from './components/adminDashboard/AdminAttendance';
import ForgetPassword from './components/ForgetPassword';

function App() {
  return (
    <ContextProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgetPassword />} />
          

          {/* Admin Routes */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            
            <Route path="employees" element={<Employee />} />
            <Route path="add-employee" element={<AddEmployee />} />
            <Route path="edit-employee/:id" element={<EditEmployee />} />
            <Route path="employee-details/:id" element={<EmployeeDetails />} />
            <Route path="register" element={<RegistrationPage />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="update-user/:userId" element={<UpdateUser />} />
            <Route path="projects" element={<Project />} />
            <Route path="projects/tasks" element={<Task />} />
            <Route path="dashboard/timesheets" element={<AdminTimesheetManagement />} />
            <Route path="timesheets/:id" element={<TimesheetDetailView />} />
            <Route path="timesheets/notifications" element={<NotificationSettings />} />
            <Route path="holiday" element={<HolidayAdmin />} />
            <Route path="leaves" element={<LeaveRequest />} />
            <Route path="leave-balance" element={<AdminLeaveBalance />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="profile" element={<Profile isAdmin={true} />} />
          </Route>

          {/* User Routes */}
          <Route 
            path="/user/*" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          >
            
            <Route path="leaves" element={<Leave />} />
            <Route path="employee-dashboard/timesheet" element={<TimesheetForm />} />
            <Route path="employee-dashboard/timesheet-detail" element={<TimesheetDetailPage />} />
            <Route path="employee-dashboard/timesheet-view" element={<TimesheetViewPage />}/>
            <Route path="employee-dashboard/attendence" element={<UserAttendance />} />
            <Route path="leaves" element={<Leave />} />
            <Route path="leave-balance" element={<LeaveBalance />} />
            <Route path="holiday" element={<HolidayUser />} />
            <Route path="projects" element={<Project />} />
            <Route path="projects/tasks" element={<Task />} />
            <Route path="profile" element={<Profile isAdmin={false} />} />
            <Route path="myproject" element={<MyProject />} />
            <Route path="mytask" element={<MyTask />} />

          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ContextProvider>
  );
}

export default App;