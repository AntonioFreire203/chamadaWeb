import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Calendar from "./pages/Calendar";
import Attendance from "./pages/Attendance";
import History from "./pages/History";
import Login from "./pages/Login";
import Reports from "./pages/Reports";
import ClassManagement from "./pages/ClassManagement";
import Users from "./pages/Users";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/nao-autorizado" element={<Unauthorized />} />
          
          <Route element={<MainLayout><Dashboard /></MainLayout>} path="/dashboard" />
          <Route element={<MainLayout><Students /></MainLayout>} path="/estudantes" />
          <Route element={<MainLayout><Teachers /></MainLayout>} path="/professores" />
          
          {/* Rota protegida - apenas ADMIN */}
          <Route 
            path="/usuarios" 
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MainLayout><Users /></MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route element={<MainLayout><Calendar /></MainLayout>} path="/calendario" />
          <Route element={<MainLayout><Attendance /></MainLayout>} path="/chamada" />
          <Route element={<MainLayout><History /></MainLayout>} path="/historico" />
          <Route element={<MainLayout><Reports /></MainLayout>} path="/relatorios" />
          <Route element={<MainLayout><ClassManagement /></MainLayout>} path="/turmas" />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
