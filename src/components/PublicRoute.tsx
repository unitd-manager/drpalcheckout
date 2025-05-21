import { Navigate } from "react-router-dom";
import useAuthStore from "@/constants/useAuthStore";

const PublicRoute = ({ children }: any) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/subscription" /> : children;
};

export default PublicRoute;
