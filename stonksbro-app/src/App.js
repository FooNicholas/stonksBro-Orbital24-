import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext/AuthContext';
import "./index.css";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Dashboard from './components/Dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Reset from './components/Reset/Reset'
import UpdatePassword from './components/UpdatePassword/UpdatePassword';
import Profile from './components/Profile/Profile'


function App() {
  return (
    <Router>  
      <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<Reset />} />
        <Route path='/update-password' element={<UpdatePassword/>} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
            <Dashboard /> 
            </ProtectedRoute>
          } 
        />
        <Route 
          path='/profile' 
          element={
            <ProtectedRoute>
            <Profile/>
            </ProtectedRoute>
          }/>
      </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
