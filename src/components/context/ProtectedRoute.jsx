import React, { useContext } from "react";
import { userContext } from "./ContextProvider"; 
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { role, authenticated, loading } = useContext(userContext);
    const location = useLocation();
    
    if (loading) {
        return null; // Return null or loading spinner during initial load
    }

    if (!authenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/user/employee-dashboard'} replace />;
    }

    return children;
};

export default ProtectedRoute;