import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./hooks/useAuth";
import { AuthGuard } from "./components/AuthGuard";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Cameras from "./pages/Cameras";
import Faces from "./pages/Faces";
import Notifications from "./pages/Notifications";
import Billing from "./pages/Billing";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route
                path="/login"
                element={
                  <AuthGuard requireAuth={false}>
                    <Login />
                  </AuthGuard>
                }
              />
              <Route
                path="/signup"
                element={
                  <AuthGuard requireAuth={false}>
                    <Signup />
                  </AuthGuard>
                }
              />
              <Route
                path="/"
                element={
                  <AuthGuard>
                    <Index />
                  </AuthGuard>
                }
              />
              <Route
                path="/cameras"
                element={
                  <AuthGuard>
                    <Cameras />
                  </AuthGuard>
                }
              />
              <Route
                path="/faces"
                element={
                  <AuthGuard>
                    <Faces />
                  </AuthGuard>
                }
              />
              <Route
                path="/notifications"
                element={
                  <AuthGuard>
                    <Notifications />
                  </AuthGuard>
                }
              />
              <Route
                path="/billing"
                element={
                  <AuthGuard>
                    <Billing />
                  </AuthGuard>
                }
              />
              <Route
                path="/help"
                element={
                  <AuthGuard>
                    <Help />
                  </AuthGuard>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
