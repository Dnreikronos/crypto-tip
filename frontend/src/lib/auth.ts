import { API_URL } from "@/config";

export interface User {
  id: string;
  name: string;
  email: string;
  verified: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export async function loginUser({ 
  email, 
  password, 
  rememberMe 
}: { 
  email: string;
  password: string;
  rememberMe: boolean;
}): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, rememberMe }),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Authentication failed");
  }

  return response.json();
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
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Registration failed");
  }

  return response.json();
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Error logging out from server:", error);
  }

  localStorage.removeItem("token");
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = localStorage.getItem("token");
    
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
      throw new Error("Failed to fetch current user");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}
