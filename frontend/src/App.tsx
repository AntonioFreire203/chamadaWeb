import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Calendar from "./pages/Calendar";
import Attendance from "./pages/Attendance";
import History from "./pages/History";
import Login from "./pages/Login";
import Reports from "./pages/Reports";
import ClassManagement from "./pages/ClassManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/estudantes" element={<Students />} />
            <Route path="/professores" element={<Teachers />} />
            <Route path="/calendario" element={<Calendar />} />
            <Route path="/chamada" element={<Attendance />} />
            <Route path="/historico" element={<History />} />
            <Route path="/login" element={<Login />} />
            <Route path="/relatorios" element={<Reports />} />
            <Route path="/turmas" element={<ClassManagement />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
