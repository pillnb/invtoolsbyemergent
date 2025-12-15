import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import ToolsPage from "./pages/ToolsPage";
import StockManagementPage from "./pages/StockManagementPage";
import AnalysisPage from "./pages/AnalysisPage";
import LoansPage from "./pages/LoansPage";
import FormsPage from "./pages/FormsPage";
import { Toaster } from "./components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  // Auto-login: Set default user without authentication
  const [user, setUser] = useState({
    id: 'auto-login-user',
    username: 'admin',
    role: 'admin',
    full_name: 'System Administrator'
  });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  // No authentication check needed - auto-login enabled
  useEffect(() => {
    // User is automatically logged in, no need to check token
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardHome user={user} onNavigate={handleNavigate} />;
      case 'tools':
        return <ToolsPage user={user} />;
      case 'stock':
        return <StockManagementPage user={user} />;
      case 'loans':
        return <LoansPage user={user} />;
      case 'forms':
        return <FormsPage user={user} />;
      case 'analysis':
        return <AnalysisPage user={user} />;
      default:
        return <DashboardHome user={user} onNavigate={handleNavigate} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route 
            path="/*" 
            element={
              <DashboardLayout 
                user={user} 
                onLogout={handleLogout}
                currentPage={currentPage}
                onNavigate={handleNavigate}
              >
                {renderPage()}
              </DashboardLayout>
            } 
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
