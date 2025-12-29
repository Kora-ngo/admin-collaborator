import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Login from './pages/auth/login'
import Home from './layout/home'
import Dasbaord from './pages/dashbaord/dashbaord'
import Projects from './pages/dashbaord/project'
import Register from './pages/auth/register'
import Invitation from './pages/auth/invitation'
import { useAuthStore } from './features/auth/store/authStore'
import { useEffect } from 'react'
import Users from './pages/dashbaord/users'
import GlobalToast from './utils/globalToast'

function App() {
  const token = localStorage.getItem('token');
  const { user, role, loading, getCurrentUser } = useAuthStore();

  // Step 1: On app start — if token exists, fetch user
  useEffect(() => {
    if (token && !user) {
      getCurrentUser();
    }
  }, [token, getCurrentUser, user]);


  // Step 2: While fetching user → show simple loading
  if (token && loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // No token → only show login/register pages
  if (!token) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/invitation" element={<Invitation />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <GlobalToast />
      </BrowserRouter>
    );
  }

  // Token exists + user loaded → decide once where to go
  if (user) {
    if (role != '') {
      return (
        <BrowserRouter>
          <Routes>
            <Route path="/dashbaord" element={<Home />}>
              <Route index element={<Dasbaord />} />
              <Route path="projects" element={<Projects />} />
              <Route path="users" element={<Users />} />
            </Route>
            {/* Redirect everything else to admin dashboard */}
            <Route path="*" element={<Navigate to="/dashbaord" replace />} />
          </Routes>
          <GlobalToast />
        </BrowserRouter>
      );
    }
  }

  // Fallback (should not reach here)
  return null;
}

export default App;
