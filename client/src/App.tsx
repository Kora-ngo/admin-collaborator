import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './pages/auth/login'
import ProtectedRoute from './routes/protectedRoute'
import AdminRoute from './pages/admin/adminRoute'


function App() {
  const user = {
    role: "admin"
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin" user={user}>
                <AdminRoute />
            </ProtectedRoute>
          }
          />


        <Route
          path="/collaborator"
          element={
            <ProtectedRoute allowedRole="collaborator" user={user}>
                <AdminRoute />
            </ProtectedRoute>
          }
          />



      </Routes>
    </BrowserRouter>
  )
}

export default App
