import { API_URL } from "@/app/config";
import Cookies from "js-cookie";

export interface User {
  id: string;
  name: string;
  email: string;
  verified: boolean;
}

export interface LoginResponse {
  token: string;
}

export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Authentication failed");
  }

  const data = await response.json();

  if (data.token) {
    Cookies.set("token", data.token, {
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      expires: 1, // 1 day
    });
  }

  return data;
}

export async function registerUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}): Promise<User> {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Registration failed");
  }

  return response.json();
}

export async function logoutUser(): Promise<void> {
  Cookies.remove("token", { path: "/" });
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = Cookies.get("token");

    if (!token) {
      return null;
    }

    const response = await fetch(`${API_URL}/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      Cookies.remove("token", { path: "/" });
      throw new Error("Failed to fetch current user");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function isAuthenticated(): Promise<boolean> {
  return !!Cookies.get("token");
}

export async function getToken(): Promise<string | undefined> {
  return Cookies.get("token");
}
