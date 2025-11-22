import { BrowserRouter } from 'react-router-dom'
import './App.css'
import Login from './pages/login'
import ForgotPassword from './pages/forgot-password'
import ResetPassword from './pages/reset-password'

function App() {
  return (
    <BrowserRouter>
    <>
      {/* <Login /> */}
      {/* <ForgotPassword /> */}
      <ResetPassword />
    </>
    </BrowserRouter>
  )
}

export default App
