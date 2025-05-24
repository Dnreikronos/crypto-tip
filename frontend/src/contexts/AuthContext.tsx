"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  User,
  loginUser,
  logoutUser,
  getCurrentUser,
  getToken,
} from "../lib/auth";
import { PUBLIC_ROUTES } from "@/config";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
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
  const pathname = usePathname();

  const checkAuth = async (): Promise<boolean> => {
    try {
      setLoading(true);

      const token = await getToken();
      if (!token) {
        setUser(null);
        return false;
      }

      const userData = await getCurrentUser();

      if (!userData) {
        setUser(null);
        return false;
      }

      setUser(userData);
      return true;
    } catch (error) {
      console.error("Error checking authentication:", error);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      await loginUser({ email, password });

      await checkAuth();
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutUser(); // Removes the cookie
      setUser(null);

      if (!PUBLIC_ROUTES.some((route) => pathname?.startsWith(route))) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  };

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
