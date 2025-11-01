import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getToken, getUser } from "../utils/storage";

// Bắt buộc đăng nhập
export function RequireAuth({ children }) {
  const token = useSelector((s) => s?.auth?.token) || getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

// Yêu cầu 1 trong các role cho phép
export function RequireRole({ roles = [], children, redirectTo = "/home" }) {
  const user = useSelector((s) => s?.auth?.user) || getUser();
  const role = (user?.role || "user").toLowerCase();
  if (roles.length && !roles.map((r) => r.toLowerCase()).includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }
  return children;
}

const Guards = { RequireAuth, RequireRole };
export default Guards;
