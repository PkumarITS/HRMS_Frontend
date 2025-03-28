import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie

class UserService {
    static BASE_URL = "http://localhost:1010";

    // Login method
    static async login(email, password) {
        try {
            const response = await axios.post(`${UserService.BASE_URL}/auth/login`, { email, password }, {
                withCredentials: true, // Send cookies with the request
            });
            return response.data;
        } catch (err) {
            throw err;
        }
    }

    // Register method
    static async register(userData, token) {
        try {
            const response = await axios.post(`${UserService.BASE_URL}/auth/register`, userData, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true, // Send cookies with the request
            });
            return response.data;
        } catch (err) {
            console.error("Error response:", err.response); // Log the error response
            throw err;
        }
    }

    // Get all users (admin only)
    static async getAllUsers(token) {
        try {
            const response = await axios.get(`${UserService.BASE_URL}/admin/get-all-users`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true, // Send cookies with the request
            });
            return response.data;
        } catch (err) {
            throw err;
        }
    }

    // Get user profile
    static async getYourProfile(token) {
        try {
            const response = await axios.get(`${UserService.BASE_URL}/adminuser/get-profile`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true, // Send cookies with the request
            });
            return response.data;
        } catch (err) {
            throw err;
        }
    }

    // Get user by ID
    static async getUserById(userId, token) {
        try {
            const response = await axios.get(`${UserService.BASE_URL}/admin/get-users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true, // Send cookies with the request
            });
            return response.data;
        } catch (err) {
            throw err;
        }
    }

    // Delete user
    static async deleteUser(userId, token) {
        try {
            const response = await axios.delete(`${UserService.BASE_URL}/admin/delete/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true, // Send cookies with the request
            });
            return response.data;
        } catch (err) {
            throw err;
        }
    }

    // Update user
    static async updateUser(userId, userData, token) {
        try {
            const response = await axios.put(`${UserService.BASE_URL}/admin/update/${userId}`, userData, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true, // Send cookies with the request
            });
            return response.data;
        } catch (err) {
            throw err;
        }
    }

    // Logout method
    static async logout() {
        try {
            // Call the backend logout endpoint to invalidate the token
            await axios.post(`${UserService.BASE_URL}/api/auth/logout`, {}, {
                withCredentials: true, // Send cookies with the request
            });

            // Clear cookies on the client side
            Cookies.remove("token");
            Cookies.remove("role");

            console.log("Logged out successfully");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    }

    // Check if the user is authenticated
    static isAuthenticated() {
        const token = Cookies.get("token"); // Get token from cookies
        return !!token;
    }

    // Check if the user is an admin
    static isAdmin() {
        const role = Cookies.get("role"); // Get role from cookies
        return role === "ADMIN";
    }

    // Check if the user is a regular user
    static isUser() {
        const role = Cookies.get("role"); // Get role from cookies
        return role === "USER";
    }

    // Check if the user is an admin and authenticated
    static adminOnly() {
        return this.isAuthenticated() && this.isAdmin();
    }
}

export default UserService;