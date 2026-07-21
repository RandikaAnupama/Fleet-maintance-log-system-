import { createContext, useContext, useMemo, useState } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem("fleet_auth");
    return raw ? JSON.parse(raw) : null;
  });

  const login = async (credentials) => {
    const result = await authService.login(credentials);
    localStorage.setItem("fleet_auth", JSON.stringify(result));
    localStorage.setItem("fleet_token", result.token);
    setAuth(result);
    return result;
  };

  const logout = () => {
    localStorage.removeItem("fleet_auth");
    localStorage.removeItem("fleet_token");
    setAuth(null);
  };

  const value = useMemo(() => ({
    user: auth?.user ?? null,
    token: auth?.token ?? null,
    isAuthenticated: Boolean(auth?.token),
    login,
    logout
  }), [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
