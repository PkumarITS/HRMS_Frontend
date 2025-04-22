import { createContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import UserService from "../service/UserService";
import axios from "axios";

export const userContext = createContext();

const ContextProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        role: null,
        authenticated: false,
        loading: true
    });

    useEffect(() => {
        const verifyToken = async () => {
            const token = Cookies.get('token');
            const role = Cookies.get('role');
            
            if (!token) {
                setAuthState({
                    role: null,
                    authenticated: false,
                    loading: false
                });
                return;
            }

            try {
                // Verify token with backend
                const response = await axios.get(`${UserService.BASE_URL}/adminuser/get-profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                });
                
                if (response.data) {
                    setAuthState({
                        role: role || response.data.role, // Use role from cookie or response
                        authenticated: true,
                        loading: false
                    });
                    return;
                }
            } catch (error) {
                console.error("Token verification failed:", error);
                // Clear invalid tokens
                Cookies.remove('token');
                Cookies.remove('role');
            }
            
            setAuthState({
                role: null,
                authenticated: false,
                loading: false
            });
        };

        verifyToken();
    }, []);

    const updateAuthState = (newState) => {
        setAuthState(prev => ({
            ...prev,
            ...newState,
            loading: false
        }));
    };

    const value = {
        ...authState,
        updateAuthState
    };

    return (
        <userContext.Provider value={value}>
            {!authState.loading && children}
        </userContext.Provider>
    );
};

export default ContextProvider;