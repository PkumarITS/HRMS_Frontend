import axios from "axios";
import Cookies from "js-cookie";

class UserService {
    static BASE_URL = "http://localhost:1010";

    static async login(email, password) {
        try {
            const response = await axios.post(`${UserService.BASE_URL}/auth/login`, {
                email,
                password
            }, {
                withCredentials: true,
            });

            if (response.data.token) {
                Cookies.set("token", response.data.token, { expires: 1, secure: true, sameSite: 'strict' });
                Cookies.set("role", response.data.role, { expires: 1, secure: true, sameSite: 'strict' });
            }

            return response.data;
        } catch (err) {
            console.error("Login error:", err);
            throw err.response?.data || { message: "Login failed" };
        }
    }

    static async register(userData, token) {
        try {
            // First verify employee exists
            const verifyResponse = await axios.get(
                `${UserService.BASE_URL}/admin/employees/by-emp-id/${userData.empId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                }
            );

            if (verifyResponse.data.status !== 'success') {
                throw new Error(verifyResponse.data.message || 'Employee verification failed');
            }

            // Then register user
            const response = await axios.post(
                `${UserService.BASE_URL}/admin/register`,
                userData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                }
            );

            return response.data;
        } catch (err) {
            console.error("Registration error:", err.response?.data || err.message);
            throw err.response?.data || { message: err.message || "Registration failed" };
        }
    }

    static async getCompleteProfile(token) {
        try {
            const response = await axios.get(`${UserService.BASE_URL}/adminuser/get-complete-profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true,
            });
            return response.data;
        } catch (err) {
            console.error("Complete profile error:", err.response?.data);
            throw err.response?.data || { message: "Failed to get complete profile" };
        }
    }
    
    static async getAllUsers(token) {
        try {
            const response = await axios.get(`${UserService.BASE_URL}/admin/get-all-users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true,
            });
            return response.data;
        } catch (err) {
            console.error("Error details:", err.response?.data);
            throw err;
        }
    }

    static async getYourProfile(token) {
        try {
            const response = await axios.get(`${UserService.BASE_URL}/adminuser/get-profile`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            });
            return response.data;
        } catch (err) {
            throw err;
        }
    }

    static async getUserById(userId, token) {
        try {
            const response = await axios.get(`${UserService.BASE_URL}/admin/get-user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            });
            return response.data;
        } catch (err) {
            throw err;
        }
    }

    static async deleteUser(userId, token) {
        try {
            const response = await axios.delete(`${UserService.BASE_URL}/admin/deleteUser/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            });
            return response.data;
        } catch (err) {
            throw err;
        }
    }

    static async updateUser(userId, userData, token) {
        try {
            const response = await axios.put(`${UserService.BASE_URL}/admin/update/${userId}`, userData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true,
            });
            return response.data;
        } catch (err) {
            console.error("Update error:", err.response?.data);
            throw err.response?.data || { message: "Update failed" };
        }
    }

    static async logout() {
        try {
            const token = Cookies.get("token");
            if (token) {
                await axios.post(`${UserService.BASE_URL}/auth/logout`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                });
            }

            // Clear all auth-related cookies
            Cookies.remove("token", { path: '/' });
            Cookies.remove("role", { path: '/' });

            // Clear localStorage/sessionStorage if used
            localStorage.clear();
            sessionStorage.clear();

            return true;
        } catch (err) {
            console.error("Logout failed:", err);
            // Even if logout API fails, clear client-side auth
            Cookies.remove("token", { path: '/' });
            Cookies.remove("role", { path: '/' });
            return false;
        }
    }

    static isAuthenticated() {
        const token = Cookies.get("token");
        return !!token;
    }

    static isAdmin() {
        const role = Cookies.get("role");
        return role === "admin";
    }

    static isUser() {
        const role = Cookies.get("role");
        return role === "user";
    }

    static adminOnly() {
        return this.isAuthenticated() && this.isAdmin();
    }


}

export default UserService;