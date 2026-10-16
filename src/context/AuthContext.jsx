import { createContext, useContext, useMemo, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    const stored = sessionStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const setSession = ({ user: nextUser, token }) => {
    sessionStorage.setItem("user", JSON.stringify(nextUser));
    sessionStorage.setItem("token", token);
    setUser(nextUser);
  };

  const login = async (payload) => {
    const session = await api.login(payload);
    setSession(session);
    return session.user;
  };

  const register = async (payload) => {
    const session = await api.register(payload);
    setSession(session);
    return session.user;
  };

  const logout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, register, logout }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
