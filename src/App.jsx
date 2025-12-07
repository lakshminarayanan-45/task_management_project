import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster.jsx";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { TaskProvider, useTaskContext } from "@/context/TaskContext.jsx";
import { AuthProvider, useAuth } from "@/context/AuthContext.jsx";
import { ThemeProvider } from "@/components/ThemeProvider.jsx";
import { AppLayout } from "@/components/layout/AppLayout.jsx";
import Login from "./pages/Login.jsx";
import Index from "./pages/Index.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tasks from "./pages/Tasks.jsx";
import Team from "./pages/Team.jsx";
import Settings from "./pages/Settings.jsx";
import NotFound from "./pages/NotFound.jsx";

const queryClient = new QueryClient();

function AuthSync({ children }) {
  const { user } = useAuth();
  const { setCurrentUser } = useTaskContext();

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user, setCurrentUser]);

  return <>{children}</>;
}

function RouteTracker({ children }) {
  const location = useLocation();

  useEffect(() => {
    // Save current route to localStorage for persistence
    if (location.pathname !== "/login" && location.pathname !== "/") {
      localStorage.setItem("taskmanager_last_route", location.pathname);
    }
  }, [location.pathname]);

  return <>{children}</>;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  
  // Get last route from localStorage
  const lastRoute = localStorage.getItem("taskmanager_last_route") || "/dashboard";

  return (
    <RouteTracker>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to={lastRoute} replace /> : <Login />} />
        <Route path="/" element={isAuthenticated ? <Navigate to={lastRoute} replace /> : <Index />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Tasks />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/team"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Team />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Settings />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </RouteTracker>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <AuthProvider>
          <TaskProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthSync>
                <AppRoutes />
              </AuthSync>
            </BrowserRouter>
          </TaskProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;