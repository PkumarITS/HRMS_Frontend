import React, { useContext } from "react";
import { userContext } from "./ContextProvider"; 
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { role, authenticated, loading } = useContext(userContext);
    const location = useLocation();
    
    if (loading) {
        return null;
    }

    if (!authenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        // Redirect to appropriate dashboard based on role
        let redirectPath = '/';
        switch(role) {
            case 'admin':
                redirectPath = '/admin/dashboard';
                break;
            case 'hr':
                redirectPath = '/hr/hr-dashboard';
                break;
            case 'manager':
                redirectPath = '/manager/manager-dashboard';
                break;
            case 'supervisor':
                redirectPath = '/supervisor/supervisor-dashboard';
                break;
            case 'user':
                redirectPath = '/user/employee-dashboard';
                break;
            default:
                redirectPath = '/';
        }
        // return <Navigate to={redirectPath} replace />;
         return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;