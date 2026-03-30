import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Wastage from "./pages/Wastage";
import OrderTaking from "./pages/OrderTaking";
import HRDashboard from "./pages/HRDashboard";
import Ordering from "./pages/Ordering";
import Receiving from "./pages/Receiving";

import Navbar from "./components/Navbar";
import WarehouseOrders from "./pages/WarehouseOrders";

const WithNav = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
    <Navbar />
    <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
      {children}
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── PUBLIC ROUTES ── */}
          <Route path="/login" element={<Login />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ── DASHBOARD ROUTES ── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["cafe_manager", "area_manager"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cafe-manager"
            element={
              <ProtectedRoute allowedRoles={["cafe_manager", "area_manager"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* ── HR ── */}
          <Route
            path="/hr"
            element={
              <ProtectedRoute allowedRoles={["hr"]}>
                <HRDashboard />
              </ProtectedRoute>
            }
          />

          {/* ── OPERATIONAL ROUTES ── */}
          <Route
            path="/order"
            element={
              <ProtectedRoute allowedRoles={["team_member", "cafe_manager", "area_manager"]}>
                <WithNav><OrderTaking /></WithNav>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ordering"
            element={
              <ProtectedRoute allowedRoles={["cafe_manager", "area_manager"]}>
                <WithNav><Ordering /></WithNav>
              </ProtectedRoute>
            }
          />
          <Route
            path="/receiving"
            element={
              <ProtectedRoute allowedRoles={["cafe_manager", "area_manager"]}>
                <WithNav><Receiving /></WithNav>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={["cafe_manager", "area_manager", "warehouse"]}>
                <WithNav><Inventory /></WithNav>
              </ProtectedRoute>
            }
          />
          <Route
            path="/wastage"
            element={
              <ProtectedRoute allowedRoles={["cafe_manager", "area_manager"]}>
                <WithNav><Wastage /></WithNav>
              </ProtectedRoute>
            }
          />
          {/* ── WAREHOUSE ── */}
<Route
  path="/warehouse"
  element={
    <ProtectedRoute allowedRoles={["warehouse"]}>
      <WithNav><WarehouseOrders /></WithNav>
    </ProtectedRoute>
  }
/>

          {/* ── ERROR ── */}
          <Route
            path="/unauthorized"
            element={
              <div style={{ textAlign: "center", marginTop: "100px", color: "white" }}>
                <h2>Access Denied</h2>
                <p>You don't have permission to view this page.</p>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;