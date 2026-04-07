import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { queryClient } from "@/lib/queryClient";
import DeploymentBanner from "@/components/DeploymentBanner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import ContentEditor from "./pages/ContentEditor";
import ProjectDetail from "./pages/ProjectDetail";
import Settings from "./pages/Settings";

const ThemeLoader = ({ children }: { children: React.ReactNode }) => {
  useTheme();
  return <>{children}</>;
};

const App = () => (
  <>
    <DeploymentBanner />
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeLoader>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/projects/:slug/content" element={<ContentEditor />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
      </ThemeLoader>
    </AuthProvider>
  </QueryClientProvider>
  </>
);

export default App;
