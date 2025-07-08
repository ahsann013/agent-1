import React, { ReactNode, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import  Helpers from "@/config/helpers";
import useUserStore from '@/store/useUserStore';

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
  const { user, token } = useUserStore();
  const navigate = useNavigate();

  // Check if token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
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

      const checkInterval = setInterval(() => {
        if (isTokenExpired(token)) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          Helpers.showToast("Session expired. Please login again.", "error");
          navigate("/login");
          clearInterval(checkInterval);
        }
      }, 60000);

      return () => clearInterval(checkInterval);
    }
  }, [token, navigate]);

  const getRedirectPath = (): string | null => {
    if (token && isTokenExpired(token)) {
      useUserStore.getState().clearUser();
      Helpers.showToast("Session expired. Please login again.", "error");
      navigate("/login");
      return null;
    }

    if (!isAuth) {
      if (user && token) {
        return user.role === "admin" ? "/admin/dashboard" : "/chat/new";
      }
      return null;
    }

    if (!user || !token) {
      Helpers.showToast("Please login to continue.", "error");
      return "/login";
    }

    if (isAdmin && user.role !== "admin") {
      Helpers.showToast("Access denied. Only administrators can access this area.", "error");
      return "/chat/new";
    }

    if (!isAdmin && user.role === "admin") {
      console.log("isAdmin", isAdmin);
      console.log("user.role", user.role);
      Helpers.showToast("Access denied. Please use the admin dashboard.", "error");
      return "/admin/dashboard";
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
