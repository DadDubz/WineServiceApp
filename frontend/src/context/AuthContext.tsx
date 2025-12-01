// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios, { AxiosError } from "axios";

type UserRole = "manager" | "sommelier" | "expo" | "server" | string;

export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Hard-code the correct backend URL for now so nothing else can mess it up
const API_BASE_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("authToken") // as in your README
  );
  const [isLoading, setIsLoading] = useState<boolean>(!!token);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await api.get<AuthUser>("/auth/me");
        setUser(res.data);
        setError(null);
      } catch (err) {
        console.error("Error loading current user:", err);
        localStorage.removeItem("authToken");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMe();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);

      const res = await api.post<{
        access_token: string;
        token_type: string;
      }>("/auth/login", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const accessToken = res.data.access_token;

      localStorage.setItem("authToken", accessToken);
      setToken(accessToken);
      setAuthToken(accessToken);

      const meRes = await api.get<AuthUser>("/auth/me");
      setUser(meRes.data);
      setError(null);
    } catch (err) {
      console.error("Login error:", err);
      let message = "Login failed. Please try again.";

      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError<any>;
        if (axiosErr.response?.status === 401) {
          message = "Invalid username or password.";
        } else if (axiosErr.response?.data?.detail) {
          message = String(axiosErr.response.data.detail);
        }
      }

      setError(message);
      setUser(null);
      localStorage.removeItem("authToken");
      setToken(null);
      setAuthToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
