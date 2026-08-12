import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import AppLayout from "./layouts/AppLayout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import BatchDetail from "./pages/Inventory/BatchDetail";
import Distribution from "./pages/Distribution";
import DistributionPlanning from "./pages/DistributionPlanning";
import Analytics from "./pages/Analytics";
import QualityControl from "./pages/QualityControl";
import Branches from "./pages/Branches";
import Farms from "./pages/Farms";
import FlowerCatalog from "./pages/FlowerCatalog";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Receiving from "./pages/Receiving";
import DailySales from "./pages/DailySales";
import DashboardReport from "./components/dashboard/DashboardReport";
function Protected() {
  const { user, isRestoring } = useAuth();

  if (isRestoring) return null;

  return user ? <AppLayout /> : <Navigate to="/auth" replace />;
}
export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard/report" element={<DashboardReport />} />
      <Route element={<Protected />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory/:flowerId" element={<BatchDetail />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/distribution" element={<Distribution />} />
        <Route path="/distribution-planning" element={<DistributionPlanning />} />
        <Route path="/forecasting" element={<Navigate to="/distribution-planning" replace />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/quality-control" element={<QualityControl />} />
        <Route path="/branches" element={<Branches />} />
        <Route path="/farms" element={<Farms />} />
        <Route path="/flower-catalog" element={<FlowerCatalog />} />
        <Route path="/users" element={<Users />} />
        <Route path="/receiving" element={<Receiving />} />
        <Route path="/daily-sales" element={<DailySales />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
