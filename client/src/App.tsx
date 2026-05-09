import { type ReactElement, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuthStore } from "./hooks/useAuthStore";
import { userActions } from "./store/userStore";

import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { MapPage } from "./pages/MapPage";
import { RescueRequestsPage } from "./pages/RescueRequestsPage";
import { TeamsPage } from "./pages/TeamsPage";
import { VehiclesPage } from "./pages/VehiclesPage";
import { ReliefPage } from "./pages/ReliefPage";
import { SheltersPage } from "./pages/SheltersPage";
import { AlertsPage } from "./pages/AlertsPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { ProfilePage } from "./pages/ProfilePage";
import { DashboardLayout } from "./layouts/DashboardLayout";

function PublicOnlyRoute({ children }: { children: ReactElement }) {
  const isAuthenticated = useAuthStore((state) => state.accessToken.length > 0);
  const location = useLocation();
  if (isAuthenticated) return <Navigate replace state={{ from: location }} to="/dashboard" />;
  return children;
}

function ProtectedRoute({ children }: { children: ReactElement }) {
  const isAuthenticated = useAuthStore((state) => state.accessToken.length > 0);
  const location = useLocation();
  if (!isAuthenticated) return <Navigate replace state={{ from: location }} to="/login" />;
  return children;
}

function DashboardRoute({ children }: { children: ReactElement }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.accessToken.length > 0);

  useEffect(() => {
    if (!isAuthenticated) { userActions.clear(); return; }
    void userActions.loadMyProfile().catch(() => undefined);
  }, [isAuthenticated]);

  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/dashboard" />} />
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

      <Route path="/dashboard" element={<DashboardRoute><DashboardPage /></DashboardRoute>} />
      <Route path="/map" element={<DashboardRoute><MapPage /></DashboardRoute>} />
      <Route path="/rescue-requests" element={<DashboardRoute><RescueRequestsPage /></DashboardRoute>} />
      <Route path="/teams" element={<DashboardRoute><TeamsPage /></DashboardRoute>} />
      <Route path="/vehicles" element={<DashboardRoute><VehiclesPage /></DashboardRoute>} />
      <Route path="/relief" element={<DashboardRoute><ReliefPage /></DashboardRoute>} />
      <Route path="/shelters" element={<DashboardRoute><SheltersPage /></DashboardRoute>} />
      <Route path="/alerts" element={<DashboardRoute><AlertsPage /></DashboardRoute>} />
      <Route path="/notifications" element={<DashboardRoute><NotificationsPage /></DashboardRoute>} />
      <Route path="/admin/users" element={<DashboardRoute><AdminUsersPage /></DashboardRoute>} />
      <Route path="/profile" element={<DashboardRoute><ProfilePage /></DashboardRoute>} />

      <Route path="*" element={<Navigate replace to={isAuthenticated ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}
