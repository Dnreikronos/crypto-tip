"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { User, loginUser, logoutUser, getCurrentUser } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async (): Promise<boolean> => {
    try {
      setLoading(true);
      const userData = await getCurrentUser();

      if (!userData) {
        return false;
      }

      setUser(userData);
      return true;
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean): Promise<void> => {
    try {
      const response = await loginUser({ email, password, rememberMe });

      // Save token in localStorage
      localStorage.setItem("token", response.token);

      setUser(response.user);
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutUser();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  };

  // Check authentication on page load
  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
    };
    verifyAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
