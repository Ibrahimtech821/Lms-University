import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import {
  auth,
  setToken,
  clearToken,
  getToken,
  type ApiUser,
} from "../services/api";

interface AuthContextValue {
  user: ApiUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirm: string
  ) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Single source of truth for "is this user an admin".
 * Normalizes casing/whitespace so "Admin", "admin ", "ADMIN"
 * all resolve the same way. Never trust a raw string compare
 * in more than one place.
 */
function computeIsAdmin(user: ApiUser | null): boolean {
  if (!user || !user.role) return false;
  return user.role.trim().toLowerCase() === "admin";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentServerId = __DEV_SERVER_ID__;
    const previousServerId = sessionStorage.getItem("lms_dev_server_id");

    const isNewServerInstance =
      !previousServerId || previousServerId !== currentServerId;

    if (isNewServerInstance) {
      sessionStorage.setItem("lms_dev_server_id", currentServerId);
      clearToken();
      setUser(null);
      setLoading(false);
      return;
    }

    // Same dev server instance -> normal browser refresh.
    // Try to restore the session from the stored token.
    const token = getToken();

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    auth
      .me()
      .then((freshUser) => {
        // Defensive: if backend ever returns a user without a role,
        // don't silently treat them as a valid session.
        if (!freshUser || !freshUser.role) {
          clearToken();
          setUser(null);
          return;
        }
        setUser(freshUser);
      })
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email: string, password: string) => {
    const res = await auth.login(email, password);

    if (!res.user || !res.user.role) {
      throw new Error("Login response missing user role");
    }

    setToken(res.token);
    setUser(res.user);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirm: string
  ) => {
    await auth.register(name, email, password, passwordConfirm);
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const isAdmin = computeIsAdmin(user);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

