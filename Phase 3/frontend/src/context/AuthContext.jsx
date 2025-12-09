// Author: Nathaniel Serrano (with assistance from ChatGPT)
// Description: Context for managing authentication state in the Campus Insider application.
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [role, setRole] = useState(() => {
    // Load existing role from localStorage
    const savedRole = localStorage.getItem("role");
    return savedRole ? savedRole : "visitor";
  });
  const [user, setUser] = useState(() => {
    // Load existing login from localStorage
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
