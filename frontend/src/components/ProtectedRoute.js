import { Navigate } from "react-router-dom";
import { getSession } from "../services/auth";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const session = getSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;