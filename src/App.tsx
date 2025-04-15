
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { FinanceProvider } from "@/context/FinanceContext";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import PrivateRoute from "@/components/PrivateRoute";
import Index from "./pages/Index";

// Pages
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Budget from "./pages/Budget";
import Transactions from "./pages/Transactions";
import AddTransaction from "./pages/AddTransaction";
import Goals from "./pages/Goals";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <FinanceProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/onboarding" element={<Onboarding />} />
                
                <Route element={<LayoutWrapper />}>
                  <Route path="/" element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } />
                  <Route path="/budget" element={
                    <PrivateRoute>
                      <Budget />
                    </PrivateRoute>
                  } />
                  <Route path="/transactions" element={
                    <PrivateRoute>
                      <Transactions />
                    </PrivateRoute>
                  } />
                  <Route path="/add-transaction" element={
                    <PrivateRoute>
                      <AddTransaction />
                    </PrivateRoute>
                  } />
                  <Route path="/goals" element={
                    <PrivateRoute>
                      <Goals />
                    </PrivateRoute>
                  } />
                  <Route path="/chat" element={
                    <PrivateRoute>
                      <Chat />
                    </PrivateRoute>
                  } />
                </Route>
                
                <Route path="/index" element={<Index />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </FinanceProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
