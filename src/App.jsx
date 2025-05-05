import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import RegistrationPage from './components/auth/RegistrationPage';
import UserManagement from './components/userManagement/UserMangement';
import UpdateUser from './components/userManagement/UserUpdate';
import CreateActionPage from './components/userManagement/CreateActionPage';
import CreateRolePage from './components/userManagement/CreateRolePage';
import ListActions from './components/userManagement/ListActions';
import ListRoles from './components/userManagement/ListRoles';
import RoleActionMapping from './components/userManagement/RoleActionMapping';
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
import ResetPassword from './components/ResetPassword';
import LeaveType from './components/adminDashboard/LeaveType';
import HrDashboard from './components/hrDashboard/HrDashboard';
import ManagerDashboard from './components/managerDashboard/ManagerDashboard';
import SupervisorDashboard from './components/supervisorDashboard/SupervisorDashboard';
import UserMapping from './components/userManagement/UserMapping';
import EditRolePage from './components/userManagement/EditRolePage';
import EditActionPage from './components/userManagement/EditActionPage';

function App() {
  return (
    <ContextProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          

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
            <Route path="create-action" element={<CreateActionPage />} />
            <Route path="create-role" element={<CreateRolePage />} />
            <Route path="roles/mapping/:roleId" element={<RoleActionMapping />} />
            <Route path="list-actions" element={<ListActions />} />
            <Route path="list-roles" element={<ListRoles />} />
            {/* <Route path="role-action-mapping" element={<RoleActionMapping />} /> */}
            <Route path="user-mapping/:userId" element={<UserMapping />} />
            <Route path="edit-role/:roleId" element={<EditRolePage />} />
            <Route path="edit-action/:actionId" element={<EditActionPage />} />


            <Route path="projects" element={<Project />} />
            <Route path="projects/tasks" element={<Task />} />
            <Route path="dashboard/timesheets" element={<AdminTimesheetManagement />} />
            <Route path="timesheets/:id" element={<TimesheetDetailView />} />
            <Route path="timesheets/notifications" element={<NotificationSettings />} />
            <Route path="holiday" element={<HolidayAdmin />} />
            <Route path="leaves" element={<LeaveRequest />} />
            <Route path="leaves-type" element={<LeaveType />} />
            <Route path="leave-balance" element={<AdminLeaveBalance />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="profile" element={<Profile isRole={"admin"} />} />
          </Route>

          {/* HR Routes */}
          <Route 
            path="/hr/*" 
            element={
              <ProtectedRoute allowedRoles={['hr']}>
                <HrDashboard />
              </ProtectedRoute>
            }
          >
            <Route path="profile" element={<Profile isAdmin={true} />} />
          </Route>

          {/* Manager Routes */}
          <Route 
            path="/manager/*" 
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          >
            <Route path="profile" element={<Profile />} />
          </Route>


          {/* Supervisor Routes */}
          <Route 
            path="/supervisor/*" 
            element={
              <ProtectedRoute allowedRoles={['supervisor']}>
                <SupervisorDashboard />
              </ProtectedRoute>
            }
          >
            <Route path="profile" element={<Profile />} />
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