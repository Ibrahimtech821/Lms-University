import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import {
  auth,
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
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function computeIsAdmin(user: ApiUser | null): boolean {
  if (!user || !user.role) return false;

  return user.role.trim().toLowerCase() === "admin";
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore authenticated user when React starts
  useEffect(() => {
    auth
      .me()
      .then((freshUser) => {
        if (!freshUser || !freshUser.role) {
          setUser(null);
          return;
        }

        setUser(freshUser);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (
    email: string,
    password: string
  ) => {
    const res = await auth.login(email, password);

    if (!res.user || !res.user.role) {
      throw new Error(
        "Login response missing user role"
      );
    }

    setUser(res.user);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirm: string
  ) => {
    const res = await auth.register(
      name,
      email,
      password,
      passwordConfirm
    );

    if (res.user && res.user.role) {
      setUser(res.user);
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
    } finally {
      setUser(null);
    }
  };

  const isAdmin = computeIsAdmin(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return ctx;
}