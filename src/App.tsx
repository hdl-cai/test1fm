import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { useAuthStore } from '@/stores/useAuthStore';
import { Loader2 } from 'lucide-react';
import Dashboard from '@/pages/Dashboard';
import Farms from '@/pages/Farms';
import Inventory from '@/pages/Inventory';
import Sensors from '@/pages/Sensors';
import ProductionCycles from '@/pages/ProductionCycles';
import ProductionCycleDetails from '@/pages/ProductionCycleDetails';
import Health from '@/pages/Health';
import Finance from '@/pages/Finance';
import Performance from '@/pages/Performance';
import Personnel from '@/pages/Personnel';
import FarmDetails from '@/pages/FarmDetails';
import Login from '@/pages/Login';

function AppRoutes() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Full-screen loader while auth state resolves
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading…</span>
        </div>
      </div>
    );
  }

  // Unauthenticated: only login route
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Authenticated: all app routes inside MainLayout
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/farms" element={<Farms />} />
        <Route path="/farms/:id" element={<FarmDetails />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/sensors" element={<Sensors />} />
        <Route path="/production-cycles" element={<ProductionCycles />} />
        <Route path="/production-cycles/:id" element={<ProductionCycleDetails />} />
        <Route path="/health" element={<Health />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/personnel" element={<Personnel />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
