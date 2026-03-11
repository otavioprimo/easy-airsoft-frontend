import React, { createContext, useState, useEffect } from "react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/query-client";

interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  emailVerified: boolean;
  bio?: string | null;
  city?: string | null;
  state?: string | null;
  profilePhoto?: string | null;
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
  syncCurrentUser: (updates: Partial<User>) => void;
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
          const response = await api.get<{ success: boolean; data: User }>(
            "/users/me",
          );
          const freshUser = response.data.data;

          setUser((currentUser) => {
            const nextUser = {
              ...currentUser,
              ...freshUser,
            } as User;

            localStorage.setItem("user", JSON.stringify(nextUser));
            return nextUser;
          });
        } catch {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          queryClient.clear();
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

    queryClient.clear();
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
      queryClient.clear();
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

    queryClient.clear();
    setUser(user);

    return emailConfirmation ?? { sent: false, previewUrl: null };
  };

  const syncCurrentUser = (updates: Partial<User>) => {
    setUser((currentUser) => {
      if (!currentUser) {
        return currentUser;
      }

      const nextUser = {
        ...currentUser,
        ...updates,
      };

      localStorage.setItem("user", JSON.stringify(nextUser));
      return nextUser;
    });
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
        syncCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
