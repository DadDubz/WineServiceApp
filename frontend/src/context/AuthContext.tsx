import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios, { AxiosError } from "axios";

// Define the roles your application supports. You can extend this later.
type UserRole = "manager" | "sommelier" | "expo" | "server" | string;

// Shape of the user returned from your API
export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
}

// What the AuthContext will expose to consumers
interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create the actual context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/*
 * Configure a base URL for your API. Because this file ends up under
 * src/context, you may want to load this value from an environment
 * variable (e.g. VITE_API_BASE_URL). For clarity we hard‑code it here.
 *
 * Note: using a baseURL ending in `/api` lets you call `/auth/login`
 * and `/auth/me` without repeating the `/api` segment.
 */
const API_BASE_URL = "http://localhost:8000/api";

// Create an Axios instance that all requests go through
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Helper to set or clear the Authorization header on the Axios instance
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

/*
 * AuthProvider maintains the authentication state for your entire app.
 * It exposes login and logout functions and keeps track of the current
 * user.  When the component mounts, it tries to restore an existing
 * token from localStorage. If one exists, it calls `/auth/me` to load
 * the current user. Whenever the token changes, it re‑loads the user.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Initially, try to restore the token from localStorage
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("authToken")
  );
  // If a token exists on mount, show a loading state until we validate it
  const [isLoading, setIsLoading] = useState<boolean>(!!token);
  const [error, setError] = useState<string | null>(null);

  // Whenever the token changes, update the Authorization header
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  // Whenever the token changes, (re)load the current user
  useEffect(() => {
    const fetchMe = async () => {
      // If there is no token, just mark loading as false and return
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Because baseURL ends with /api, this requests /api/auth/me
        const res = await api.get<AuthUser>("/auth/me");
        setUser(res.data);
        setError(null);
      } catch (err) {
        console.error("Error loading current user:", err);
        // If the token is invalid or expired, remove it and reset state
        localStorage.removeItem("authToken");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMe();
  }, [token]);  // 👈 re-run when the token changes

  // Log in with username & password.  This uses the OAuth2 password flow,
  // so grant_type must be set to "password".  The FastAPI backend also
  // defines optional fields (scope, client_id, client_secret) that we
  // include as empty values to satisfy the request body structure.
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("grant_type", "password");
      params.append("username", username);
      params.append("password", password);
      // Optional fields for the OAuth2 password form
      params.append("scope", "");
      params.append("client_id", "");
      params.append("client_secret", "");

      const res = await api.post<{
        access_token: string;
        token_type: string;
      }>("/auth/login", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const accessToken = res.data.access_token;
      // Persist token in localStorage and update our state
      localStorage.setItem("authToken", accessToken);
      setToken(accessToken);
      setAuthToken(accessToken);

      // Immediately load the user after login
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

  // Log out by clearing localStorage and resetting state
  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  // Everything that consumers of this context will receive
  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    error,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

// Hook for child components to access the authentication context
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
