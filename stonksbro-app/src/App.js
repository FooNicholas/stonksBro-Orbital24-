import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext/AuthContext";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Dashboard from "./scenes/Dashboard/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Reset from "./components/Reset/Reset";
import UpdatePassword from "./components/UpdatePassword/UpdatePassword";
import Profile from "./components/Profile/Profile";
import Friends from "./components/FriendsList/FriendsList";
import AddFriends from "./components/AddFriends/AddFriends";
import TradingSimulator from "./components/TradingSimulator/TradingSimulator";

import "./index.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<Reset />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/friends"
            element={
              <ProtectedRoute>
                <Friends />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/add"
            element={
              <ProtectedRoute>
                <AddFriends />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/simulator"
            element={
              <ProtectedRoute>
                <TradingSimulator />
              </ProtectedRoute>
            }
          />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
