import { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

const getTokenTimeRemaining = (token) => {
  if (!token) return 0;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return 0;
    return payload.exp * 1000 - Date.now();
  } catch {
    return 0;
  }
};

const ProtectedRoute = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [expired, setExpired] = useState(() => isTokenExpired(token));

  useEffect(() => {
    if (!token || !isAuthenticated) return;

    const remainingTime = getTokenTimeRemaining(token);

    if (remainingTime <= 0) {
      handleTokenExpiry();
      return;
    }

    // Set timer to trigger auto-logout the exact millisecond the token expires
    const timer = setTimeout(() => {
      handleTokenExpiry();
    }, remainingTime);

    return () => clearTimeout(timer);
  }, [token, isAuthenticated]);

  const handleTokenExpiry = () => {
    setExpired(true);
    logout?.();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  if (!isAuthenticated || expired || isTokenExpired(token)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;