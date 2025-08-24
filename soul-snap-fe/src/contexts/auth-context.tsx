import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/lib/axios";

interface User {
  userId: number;
  username: string;
  imageUrl: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("soulsnap-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);

    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener("unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("unauthorized", handleUnauthorized);
    };
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", { username, password });

      const { access_token, user } = res.data;

      localStorage.setItem("soulsnap-token", access_token);
      localStorage.setItem("soulsnap-user", JSON.stringify(user));

      setUser(user);
      return true;
    } catch (err) {
      console.error("Login failed", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("soulsnap-user");
    localStorage.removeItem("soulsnap-token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
