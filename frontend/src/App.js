import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import ToolsPage from "./pages/ToolsPage";
import StockManagementPage from "./pages/StockManagementPage";
import { Toaster } from "./components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          setUser(response.data);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
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
        return <DashboardHome user={user} />;
      case 'tools':
        return <ToolsPage user={user} />;
      case 'stock':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-slate-800">Stock Management</h1>
            <p className="text-slate-600 mt-4">Stock management features coming soon...</p>
          </div>
        );
      case 'forms':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-slate-800">Forms</h1>
            <p className="text-slate-600 mt-4">Forms features coming soon...</p>
          </div>
        );
      case 'analysis':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-slate-800">Analysis</h1>
            <p className="text-slate-600 mt-4">Analysis features coming soon...</p>
          </div>
        );
      default:
        return <DashboardHome user={user} />;
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
            path="/login" 
            element={user ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />} 
          />
          <Route 
            path="/" 
            element={
              user ? (
                <DashboardLayout 
                  user={user} 
                  onLogout={handleLogout}
                  currentPage={currentPage}
                  onNavigate={handleNavigate}
                >
                  {renderPage()}
                </DashboardLayout>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
