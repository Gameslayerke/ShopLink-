import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  console.log("Checking Admin Authentication:", localStorage.getItem("admin"));

  const isAdminAuthenticated = () => {
    try {
      const admin = JSON.parse(localStorage.getItem("admin"));

      if (!admin || !admin.token) {
        console.log("Admin not authenticated, redirecting...");
        return false;
      }

      // Optional: Check for token expiration (if backend provides `exp`)
      // const isExpired = admin.exp * 1000 < Date.now();
      // if (isExpired) return false;

      return true;
    } catch (error) {
      return false;
    }
  };

  if (!isAdminAuthenticated()) {
    console.log("Redirecting to login...");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
