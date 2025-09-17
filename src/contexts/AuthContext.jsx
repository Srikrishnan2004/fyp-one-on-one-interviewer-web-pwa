import { createContext, useContext, useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
      } else {
        // Token is invalid
        logout();
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        setToken(data.data.token);
        setUser(data.data.user);
        localStorage.setItem("token", data.data.token);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Network error. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        setToken(data.data.token);
        setUser(data.data.user);
        localStorage.setItem("token", data.data.token);
        return { success: true };
      } else {
        // If registration fails due to existing user, try login instead
        if (
          data.message &&
          (data.message.includes("already exists") ||
            data.message.includes("already registered"))
        ) {
          console.log("User already exists, attempting login...");
          return await login(userData.username, userData.password);
        }
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: "Network error. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Profile update error:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const checkUsernameAvailability = async (username) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/check-username/${username}`
      );
      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error("Username check error:", error);
      return false;
    }
  };

  const checkEmailAvailability = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-email/${email}`);
      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error("Email check error:", error);
      return false;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    checkUsernameAvailability,
    checkEmailAvailability,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
