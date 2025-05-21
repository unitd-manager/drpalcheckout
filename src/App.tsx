// src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Registeration from "./pages/Registeration";
import Subscription from "./pages/Subscription";
import NotFound from "./pages/NotFound";
import AllPlans from "./pages/AllPlans";
import TransactionHistory from "./pages/TransactionHistory";
import ForgetPassword from "./pages/ForgetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AdminDashboard from "./pages/AdminDashBoard";
import useAuthStore from "./constants/useAuthStore";
import EnrollOnlineShow from "./pages/EnrollOnlineShow";

const App = () => {
  const { role, isAuthenticated } = useAuthStore();

  /* helper that always returns the right landing page */
  const Landing = () =>
    role === "admin" ? (
      <Navigate to="/admin" replace />
    ) : (
      <Navigate to="/subscription" replace />
    );

  return (
    <Router>
      <Routes>
        {/* ROOT ───────────────────────────────────────── */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Landing /> // decide on every render
            ) : (
              <PublicRoute>
                <Login />
              </PublicRoute>
            )
          }
        />

        <Route
          path="/india-show"
          element={
            <PublicRoute>
              <EnrollOnlineShow />
            </PublicRoute>
          }
        />
        {/* PUBLIC AUTH ROUTES ─────────────────────────── */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Registeration />
            </PublicRoute>
          }
        />
        <Route
          path="/forget-password"
          element={
            <PublicRoute>
              <ForgetPassword />
            </PublicRoute>
          }
        />

        {/* DASHBOARD REDIRECT ─────────────────────────── */}
        {/* Login still does navigate('/dashboard'); this route funnels to Landing */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Landing />
            </ProtectedRoute>
          }
        />

        {/* PROTECTED ROUTES ───────────────────────────── */}
        {/* If an admin somehow hits /subscription, bounce them to /admin */}
        <Route
          path="/subscription"
          element={
            <ProtectedRoute>
              {role === "admin" ? (
                <Navigate to="/admin" replace />
              ) : (
                <Subscription />
              )}
            </ProtectedRoute>
          }
        />
        {/* If a normal user hits /admin, send them to /subscription */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              {role === "admin" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/subscription" replace />
              )}
            </ProtectedRoute>
          }
        />

        <Route
          path="/allplans"
          element={
            <ProtectedRoute>
              <AllPlans />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactionhistory"
          element={
            <ProtectedRoute>
              <TransactionHistory />
            </ProtectedRoute>
          }
        />

        {/* 404 ────────────────────────────────────────── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
