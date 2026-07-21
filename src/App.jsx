import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { IssueProvider } from "./context/IssueContext";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import Drivers from "./pages/Drivers";
import AdminIssues from "./pages/AdminIssues";
import Maintenance from "./pages/Maintenance";
import FuelLogs from "./pages/FuelLogs";
import RepairLogs from "./pages/RepairLogs";
import ServiceSchedules from "./pages/ServiceSchedules";
import Reports from "./pages/Reports";
import Users from "./pages/Users";

import MyVehicle from "./pages/MyVehicle";
import MaintenanceHistory from "./pages/MaintenanceHistory";
import ReportIssue from "./pages/ReportIssue";
import Profile from "./pages/Profile";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <IssueProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />

                <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
                  <Route path="/vehicles" element={<Vehicles />} />
                  <Route path="/drivers" element={<Drivers />} />
                  <Route path="/issues" element={<AdminIssues />} />
                  <Route path="/maintenance" element={<Maintenance />} />
                  <Route path="/fuel-logs" element={<FuelLogs />} />
                  <Route path="/repair-logs" element={<RepairLogs />} />
                  <Route
                    path="/service-schedules"
                    element={<ServiceSchedules />}
                  />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/users" element={<Users />} />
                </Route>

                <Route element={<RoleRoute allowedRoles={["USER"]} />}>
                  <Route path="/my-vehicle" element={<MyVehicle />} />
                  <Route
                    path="/maintenance-history"
                    element={<MaintenanceHistory />}
                  />
                  <Route path="/report-issue" element={<ReportIssue />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </IssueProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}