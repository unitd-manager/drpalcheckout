// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import useAuthStore from "@/constants/useAuthStore";

const ProtectedRoute = ({ children }: any) => {
  const { isAuthenticated } = useAuthStore();

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
