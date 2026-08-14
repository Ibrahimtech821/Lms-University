import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { auth, getToken, setToken, clearToken, type ApiUser } from "../services/api";

interface AuthContextValue {
  user: ApiUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirm: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }

    auth.me()
      .then(u => setUser(u))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await auth.login(email, password);
    setToken(res.token);
    setUser(res.user);
    


  };

  const register = async (name: string, email: string, password: string, passwordConfirm: string) => {
    const res = await auth.register(name, email, password, passwordConfirm);
    setToken(res.token);
    setUser(res.user);
  };


  const logout = () => {
    clearToken();
    setUser(null);
  };

  const isAdmin = user?.role?.toLowerCase() === "admin";

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


