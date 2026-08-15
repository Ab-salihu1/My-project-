import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import StudentDashboard from "./pages/StudentDashboard";
import LecturerDashboard from "./pages/LecturerDashboard";
import RegistrarDashboard from "./pages/RegistrarDashboard";

function Gate() {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  if (user.role === "STUDENT") return <StudentDashboard />;
  if (user.role === "LECTURER") return <LecturerDashboard />;
  return <RegistrarDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
