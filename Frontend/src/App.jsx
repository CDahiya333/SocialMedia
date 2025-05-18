import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
// import API_BASE_URL from "./config.js";

import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";

import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { useTheme } from "./context/ThemeContext";

function App() {
  const { isDark } = useTheme();
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.error) return null;
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        console.log("authUser is here:", data);
        return data;
      } catch (error) {
        console.log("error is here:", error);
        return null;
      }
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center theme-main">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="theme-main min-h-screen">
        <div className="flex max-w-6xl mx-auto">
          {authUser && <Sidebar />}
          <main className="flex-grow theme-panel">
            <Routes>
              <Route
                path="/"
                element={authUser ? <HomePage /> : <Navigate to="/login" />}
              />
              <Route
                path="/login"
                element={!authUser ? <LoginPage /> : <Navigate to="/" />}
              />
              <Route
                path="/signup"
                element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
              />
              <Route
                path="/notifications"
                element={authUser ? <NotificationPage /> : <Navigate to="/login" />}
              />
              <Route
                path="/profile/:username"
                element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
              />
            </Routes>
          </main>
          {authUser && <RightPanel />}
          <Toaster />
        </div>
      </div>
    </div>
  );
}

export default App;
