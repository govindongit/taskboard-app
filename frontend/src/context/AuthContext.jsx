import { createContext, useContext, useState } from "react";

// createContext creates a "global store"
// Any component in the tree can read from it — no prop drilling
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize from localStorage so login persists across page refreshes
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userData.token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  // value is what gets shared with all descendant components
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — components call useAuth() instead of useContext(AuthContext)
export const useAuth = () => useContext(AuthContext);
