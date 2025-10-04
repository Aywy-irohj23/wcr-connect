import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getToken } from "./lib/auth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Inbox from "./pages/Inbox";
import Admin from "./pages/Admin";
import ReservistDashboard from "./pages/ReservistDashboard";
import TailwindTest from "./components/TailwindTest";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = getToken();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/test" element={<TailwindTest />} />
        <Route 
          path="/inbox" 
          element={
            <ProtectedRoute>
              <Inbox />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <ReservistDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;