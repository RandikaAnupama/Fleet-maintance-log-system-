import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

function loadAuth() {
  try {
    const raw = sessionStorage.getItem("fleet_auth");
    return raw ? JSON.parse(raw) : null;
  } catch {
    sessionStorage.removeItem("fleet_auth");
    sessionStorage.removeItem("fleet_token");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadAuth);

  const login = useCallback(async (credentials) => {
    const result = await authService.login(credentials);

    sessionStorage.setItem("fleet_auth", JSON.stringify(result));
    sessionStorage.setItem("fleet_token", result.token);
    setAuth(result);

    return result;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("fleet_auth");
    sessionStorage.removeItem("fleet_token");
    setAuth(null);
  }, []);

  const updateUser = useCallback(
    (profile) => {
      if (
        !auth?.user ||
        String(profile.id) !== String(auth.user.id)
      ) {
        return;
      }

      const currentToken = sessionStorage.getItem("fleet_token");

      if (!currentToken || currentToken !== auth.token) {
        return;
      }

      const updatedAuth = {
        ...auth,
        user: {
          ...auth.user,
          full_name: profile.full_name,
          name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          role: profile.role,
          status: profile.status,
        },
      };

      sessionStorage.setItem(
        "fleet_auth",
        JSON.stringify(updatedAuth)
      );

      setAuth(updatedAuth);
    },
    [auth]
  );

  const value = useMemo(
    () => ({
      user: auth?.user ?? null,
      token: auth?.token ?? null,
      isAuthenticated: Boolean(auth?.token),
      login,
      logout,
      updateUser,
    }),
    [auth, login, logout, updateUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}