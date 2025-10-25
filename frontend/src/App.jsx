import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import TodayWorkout from "./pages/TodayWorkout";
import ActiveWorkout from "./pages/ActiveWorkout";
import PlanManager from "./pages/PlanManager";
import PlanBuilder from "./pages/PlanBuilder";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import Progress from "./pages/Progress";
import Social from "./pages/Social";
import UserProfile from "./pages/UserProfile";

// Auth Screen Component
const AuthScreen = () => {
  const [screen, setScreen] = useState("login"); // 'login', 'register', 'forgot'

  if (screen === "register") {
    return <Register onSwitchToLogin={() => setScreen("login")} />;
  }

  if (screen === "forgot") {
    return <ForgotPassword onBack={() => setScreen("login")} />;
  }

  return (
    <Login
      onSwitchToRegister={() => setScreen("register")}
      onForgotPassword={() => setScreen("forgot")}
    />
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">🏋️</div>
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/auth" />;
};

// Main App Routes
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/auth"
        element={user ? <Navigate to="/" /> : <AuthScreen />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <TodayWorkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/plans"
        element={
          <ProtectedRoute>
            <PlanManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/plan-builder"
        element={
          <ProtectedRoute>
            <PlanBuilder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workout"
        element={
          <ProtectedRoute>
            <ActiveWorkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exercises"
        element={
          <ProtectedRoute>
            <ExerciseLibrary />
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <Progress />
          </ProtectedRoute>
        }
      />
      <Route
        path="/social"
        element={
          <ProtectedRoute>
            <Social />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:userId"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <Navbar />
          <div className="max-w-md mx-auto pb-20">
            <AppRoutes />
          </div>
          <BottomNav />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
