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
import Assistance from './pages/dashbaord/assistance'
import Families from './pages/dashbaord/families'
import Deliveries from './pages/dashbaord/deliveries'
import AuditLog from './pages/dashbaord/audit-log'
import { useSessionGuard } from './helpers/session/useSessionGuard'
import ForgotPassword from './pages/auth/forgot-password'

function App() {
  const token = localStorage.getItem('token');
  const { user, role, loading, getCurrentUser } = useAuthStore();


  // ✅ Initialize session guard
  useSessionGuard();


  // Step 1: On app start — if token exists, fetch user
  useEffect(() => {
    if (token && !user) {
      getCurrentUser();
    }
  }, [token, getCurrentUser, user]);


  // Allowed roles for /assistance (add more if needed)
  const assistanceAllowedRoles = ["admin"];


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
      <BrowserRouter basename="/space">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/invitation" element={<Invitation />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <GlobalToast />
      </BrowserRouter>
    );
  }


  // Token exists + user loaded → decide routing
  // if (user && organisation) {
  //   const isOwner = user.id === organisation.created_by;

  //   // If user is the organization owner AND subscription is NOT active
  //   if (isOwner && subscriptionStatus != 'active') {
  //     return (
  //       <BrowserRouter>
  //         <Routes>
  //           <Route path="/subscription" element={<Renew />} />
  //           {/* Redirect all other routes to subscription */}
  //           <Route path="*" element={<Navigate to="/subscription" replace />} />
  //         </Routes>
  //         <GlobalToast />
  //       </BrowserRouter>
  //     );
  //   }
  // }

  // Token exists + user loaded → decide once where to go
  if (user) {
    if (role != '') {
      return (
        <BrowserRouter basename="/space">
          <Routes>
            <Route path="/dashbaord" element={<Home />}>
              <Route index element={<Dasbaord />} />
              <Route path="projects" element={<Projects />} />
              <Route path="users" element={<Users />} />
              <Route path="assistance" element={assistanceAllowedRoles.includes(role) ? (<Assistance />) : (<Navigate to="/dashbaord" replace />) } />
              <Route path="families" element={<Families />} />
              <Route path="deliveries" element={<Deliveries />} />
              <Route path="log" element={<AuditLog />} />
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
