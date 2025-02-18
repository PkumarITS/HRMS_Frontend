import { Navigate } from 'react-router-dom';
import Dashboard from './Dashboard'; // Ensure this points to the correct Dashboard component

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('valid'); // Example check for authentication

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/" />;
  }

  // If authenticated, render the Dashboard component with the child routes
  return <Dashboard>{children}</Dashboard>;
};

export default PrivateRoute;
