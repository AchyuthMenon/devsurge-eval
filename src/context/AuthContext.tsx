import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("sdep_user");
    if (stored) setUser(JSON.parse(stored));
    setIsLoading(false);
  }, []);

  const signup = (name: string, email: string, _password: string) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("sdep_user", JSON.stringify(newUser));
    // Store in users list
    const users = JSON.parse(localStorage.getItem("sdep_users") || "[]");
    users.push({ ...newUser, password: _password });
    localStorage.setItem("sdep_users", JSON.stringify(users));
    setUser(newUser);
    return true;
  };

  const login = (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem("sdep_users") || "[]");
    const found = users.find((u: any) => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...userData } = found;
      localStorage.setItem("sdep_user", JSON.stringify(userData));
      setUser(userData);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("sdep_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
