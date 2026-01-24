import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import DreamList from "@/pages/DreamList";
import DreamForm from "@/pages/DreamForm";
import DreamDetail from "@/pages/DreamDetail";
import DreamCalendar from "@/pages/DreamCalendar";
import PatternAnalysis from "@/pages/PatternAnalysis";
import SharedDream from "@/pages/SharedDream";
import Settings from "@/pages/Settings";
import Explore from "@/pages/Explore";
import Layout from "@/components/Layout";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="dreams" element={<DreamList />} />
            <Route path="dreams/new" element={<DreamForm />} />
            <Route path="dreams/:id" element={<DreamDetail />} />
            <Route path="dreams/:id/edit" element={<DreamForm />} />
            <Route path="calendar" element={<DreamCalendar />} />
            <Route path="patterns" element={<PatternAnalysis />} />
            <Route path="settings" element={<Settings />} />
            <Route path="explore" element={<Explore />} />
          </Route>
          <Route path="/shared/:shareId" element={<SharedDream />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
