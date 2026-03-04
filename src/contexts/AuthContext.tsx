import React, { createContext, useState, useEffect } from "react";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  emailVerified: boolean;
}

interface EmailConfirmationResult {
  sent: boolean;
  previewUrl: string | null;
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<EmailConfirmationResult>;
}

interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  username: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface RegisterResponse extends AuthResponse {
  emailConfirmation?: EmailConfirmationResult;
}

export const AuthContext = createContext<AuthContextData | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser) as User);
        } catch {
          localStorage.removeItem("user");
        }
      }

      if (token) {
        try {
          await api.get("/users/me");
        } catch {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          setUser(null);
        }
      } else {
        localStorage.removeItem("refreshToken");
      }

      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post<{ success: boolean; data: AuthResponse }>(
      "/auth/login",
      { email, password },
    );

    const { accessToken, refreshToken, user } = response.data.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));

    setUser(user);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  const register = async (data: RegisterData) => {
    const response = await api.post<{
      success: boolean;
      data: RegisterResponse;
    }>("/auth/register", data);

    const { accessToken, refreshToken, user, emailConfirmation } =
      response.data.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));

    setUser(user);

    return emailConfirmation ?? { sent: false, previewUrl: null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
