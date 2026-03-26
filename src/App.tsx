import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { useAuthStore } from '@/stores/useAuthStore';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { useRoleGuard, type UserRole } from '@/lib/guards';
import { Loader2 } from 'lucide-react';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Farms = lazy(() => import('@/pages/Farms'));
const Inventory = lazy(() => import('@/pages/Inventory'));
const ProductionCycles = lazy(() => import('@/pages/ProductionCycles'));
const ProductionCycleDetails = lazy(() => import('@/pages/ProductionCycleDetails'));
const Finance = lazy(() => import('@/pages/Finance'));
const Performance = lazy(() => import('@/pages/Performance'));
const Personnel = lazy(() => import('@/pages/Personnel'));
const FarmDetails = lazy(() => import('@/pages/FarmDetails'));
const Login = lazy(() => import('@/pages/Login'));
const Unauthorized = lazy(() => import('@/pages/Unauthorized'));

/**
 * Inline role-guard wrapper for route elements.
 * Renders children only if the user has one of the allowed roles,
 * otherwise the useRoleGuard hook redirects to /unauthorized.
 */
function RoleGuard({ roles, children }: { roles: UserRole[]; children: React.ReactNode }) {
  const { isLoading, isAuthorized } = useRoleGuard(roles);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) return null; // hook handles redirect

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  const routeLoader = (
    <div className="flex items-center justify-center py-32">
      <Loader2 size={28} className="animate-spin text-primary" />
    </div>
  );

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
      <Suspense fallback={routeLoader}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

  // Authenticated: all app routes inside MainLayout
  return (
    <MainLayout>
      <Suspense fallback={routeLoader}>
        <Routes>
          {/* All roles */}
          <Route path="/" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
          <Route path="/production-cycles/:id" element={<ErrorBoundary><ProductionCycleDetails /></ErrorBoundary>} />
          <Route path="/unauthorized" element={<ErrorBoundary><Unauthorized /></ErrorBoundary>} />

          {/* Admin + Technician */}
          <Route path="/farms" element={<ErrorBoundary><RoleGuard roles={['admin', 'owner', 'technician']}><Farms /></RoleGuard></ErrorBoundary>} />
          <Route path="/farms/:id" element={<ErrorBoundary><RoleGuard roles={['admin', 'owner', 'technician']}><FarmDetails /></RoleGuard></ErrorBoundary>} />
          <Route path="/production-cycles" element={<ErrorBoundary><RoleGuard roles={['admin', 'owner', 'technician']}><ProductionCycles /></RoleGuard></ErrorBoundary>} />
          <Route path="/inventory" element={<ErrorBoundary><RoleGuard roles={['admin', 'owner', 'technician']}><Inventory /></RoleGuard></ErrorBoundary>} />

          {/* Admin only */}
          <Route path="/finance" element={<ErrorBoundary><RoleGuard roles={['admin', 'owner']}><Finance /></RoleGuard></ErrorBoundary>} />
          <Route path="/performance" element={<ErrorBoundary><RoleGuard roles={['admin', 'owner']}><Performance /></RoleGuard></ErrorBoundary>} />
          <Route path="/personnel" element={<ErrorBoundary><RoleGuard roles={['admin', 'owner']}><Personnel /></RoleGuard></ErrorBoundary>} />

          {/* V2 — Quarantined modules (routes removed, files kept) */}
          {/* <Route path="/sensors" ... /> */}
          {/* <Route path="/health" ... /> */}

          {/* Catch-all */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
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
