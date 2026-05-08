import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";

// AUTH
import ProtectedRoute from "./components/ProtectedRoute";

// PAGES
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// CORE
import Dashboard from "./pages/Dashboard";
import Greenhouse from "./pages/Greenhouse";
import Activities from "./pages/Activities";

// AGRICULTURE
import Calendar from "./pages/Calendar";
import Irrigation from "./pages/Irrigation";
import Ventilation from "./pages/Ventilation";
import Lighting from "./pages/Lighting";
import Reports from "./pages/Reports";
import Simulator from "./pages/Simulator";

// ADMIN
import AdminUsers from "./pages/AdminUsers";
import SuggestionsAdmin from "./pages/SuggestionsAdmin";
import Sensors from "./pages/Sensors";

import Landing from "./pages/Landing";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>

          {/* Ana yönlendirme */}
          <Route path="/" element={<Landing />} />

          {/* AUTH */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* CORE SYSTEM */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/greenhouse"
            element={
              <ProtectedRoute>
                <Greenhouse />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-greenhouse"
            element={
              <ProtectedRoute allowedRoles={["GREENHOUSE_MANAGER", "ADMIN"]}>
                <Greenhouse />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sensors"
            element={
              <ProtectedRoute>
                <Sensors />
              </ProtectedRoute>
            }
          />

          <Route
            path="/activities"
            element={
              <ProtectedRoute>
                <Activities />
              </ProtectedRoute>
            }
          />

          {/* AGRICULTURE MODULES */}
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            }
          />

          <Route
            path="/irrigation"
            element={
              <ProtectedRoute>
                <Irrigation />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ventilation"
            element={
              <ProtectedRoute>
                <Ventilation />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lighting"
            element={
              <ProtectedRoute>
                <Lighting />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />

          {/* ADMIN */}
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manager-suggestions"
            element={
              <ProtectedRoute allowedRoles={["GREENHOUSE_MANAGER"]}>
                <SuggestionsAdmin />
              </ProtectedRoute>
            }
          />

          {/* SETTINGS & NOTIFICATIONS */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/simulator"
            element={
              <ProtectedRoute>
                <Simulator />
              </ProtectedRoute>
            }
          />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;