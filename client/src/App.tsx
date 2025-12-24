import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './pages/auth/login'
import ProtectedRoute from './routes/protectedRoute'
import Home from './layout/home'
import Dasbaord from './pages/admin/dashbaord'
import Projects from './pages/admin/project'
import User from './pages/admin/users'
import Register from './pages/auth/register'
import Invitation from './pages/auth/invitation'


function App() {
  const user = {
    role: "admin"
  }

  return (
    <BrowserRouter>
      <Routes>

        {/* The authentication  */}

        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/invitation" element={<Invitation />} />



        {/* For the admin  */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin" user={user}>
                <Home />
            </ProtectedRoute>
          }
          >
              <Route index element={<Dasbaord />} />
              <Route path="projects" element={<Projects />} />
              <Route path="users" element={<User />} />
          </Route>


        {/* For the collaborator  */}

        <Route
          path="/collaborator"
          element={
            <ProtectedRoute allowedRole="collaborator" user={user}>
                <div></div>
            </ProtectedRoute>
          }
          />



      </Routes>
    </BrowserRouter>
  )
}

export default App
