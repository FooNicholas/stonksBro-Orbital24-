import React, { createContext, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("Not Logged In");
  const [userId, setUserId] = useState("");


  const login = (token, username, userId) => { 
    localStorage.setItem("token", token);
    setUsername(username);
    setUserId(userId);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUsername("");
    setUserId("");
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, username, userId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);