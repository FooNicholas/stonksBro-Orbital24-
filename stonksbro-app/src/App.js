import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext/AuthContext';
import "./index.css";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Dashboard from './components/Dashboard/Dashboard';
import News from './components/TradingViewWidget/TradingViewNews/TradingViewNews';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';


function App() {
  return (
    <Router>  
      <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
            <Dashboard /> 
            </ProtectedRoute>
          } 
        />
        <Route path="/news" element={<News />} />
      </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
