import { Navigate, Route, Routes } from "react-router-dom"
import { useEffect } from "react"
import Navbar from "./components/nav/Navbar"
import HomePage from "./components/home/HomePage"
import LoginPage from "./components/auth/LoginPage"
import SignupPage from "./components/auth/SignupPage"
import SettingsPage from "./components/settings/SettingsPage"
import ProfilePage from "./components/settings/ProfilePage"
import NotFound from "./components/404/ErrorPage"
import { useAuthStore } from "./store/useAuthStore"
import Loading from "./components/loader/Loading"
import { Toaster } from "react-hot-toast"
import { useThemeStore } from "./store/useThemeStore"


function App() {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers }: any = useAuthStore();
  const { theme }: any = useThemeStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) return <div><Loading /></div>


  return (
    <>
      <div data-theme={theme}>
        <Navbar />
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to={'/login'} />} />
          <Route path="/signup" element={!authUser ? <SignupPage /> : <Navigate to="/" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to={'/login'} />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </>
  )
}

export default App
