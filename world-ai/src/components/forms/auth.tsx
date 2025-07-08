import React, { ReactNode, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Helpers from "@/config/helpers";
import  { jwtDecode }from "jwt-decode"; // Make sure to install this package: npm install jwt-decode
import { useNavigate } from "react-router-dom";
interface AuthProps {
  children: ReactNode;
  isAuth?: boolean;
  isAdmin?: boolean;
}

const Auth: React.FC<AuthProps> = ({
  children,
  isAuth = true,
  isAdmin = false,
}) => {
  
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Check if token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000; // Convert to seconds
      return decoded.exp < currentTime;
    } catch (error) {
      return true; // If token can't be decoded, consider it expired
    }
  };

  useEffect(() => {
    
    if (token) {
      // Initial check 
      if (isTokenExpired(token)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        Helpers.showToast("Session expired. Please login again.", "error");
        navigate("/login");
        return;
      }
    
      // Set up periodic check every minute
      const checkInterval = setInterval(() => {
    
        if (isTokenExpired(token)) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          Helpers.showToast("Session expired. Please login again.", "error");
          navigate("/login");
          clearInterval(checkInterval);
        }
      }, 60000); // Check every minute
          // Cleanup interval on component unmount
      return () => clearInterval(checkInterval);
    }
  }, [token]);

  // Simplified access validation
  const getRedirectPath = (): string | null => {
    // Check token expiration first
    if (token && isTokenExpired(token)) {
      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      Helpers.showToast("Session expired. Please login again.", "error");
      navigate("/login");
      return null;
    }

    // Public route logic
    if (!isAuth) {
      return user && token ? (user.isAdmin ? "/admin/dashboard" : "/chat") : null;
    }

    // Protected route logic
    if (!user || !token) {
      Helpers.showToast("Please login to continue.", "error");
      navigate("/login");
      return null;
    }

    // Admin route logic
    if (isAdmin && user.role !== "admin") {
      Helpers.showToast("Access denied. Only admin allowed.", "error");
      navigate("/chat/new");
    }

    if (!isAdmin && user.role === "admin") {
      Helpers.showToast("Access denied. Admins cannot access user routes.", "error");
      navigate("/admin/dashboard");
    }

    return null;
  };

  const redirectPath = getRedirectPath();
  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default Auth;
