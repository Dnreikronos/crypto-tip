'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
	id: string;
	name: string;
	email: string;
}

interface AuthContextType {
	user: User | null;
	token: string | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
	isAuthenticated: boolean;
	isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		// Check for stored token and user data
		const storedToken = localStorage.getItem('token');
		const storedUser = localStorage.getItem('user');

		if (storedToken && storedUser) {
			setToken(storedToken);
			setUser(JSON.parse(storedUser));
		}
		setIsLoading(false);
	}, []);

	const login = async (email: string, password: string) => {
		try {
			const res = await fetch('http://localhost:9090/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			});

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.error || 'Login failed');
			}

			const data = await res.json();

			if (!data.token) {
				throw new Error('Invalid response from server');
			}

			// Get user profile after successful login
			const profileRes = await fetch('http://localhost:9090/profile', {
				headers: {
					'Authorization': `Bearer ${data.token}`,
				},
			});

			if (!profileRes.ok) {
				throw new Error('Failed to fetch user profile');
			}

			const userProfile = await profileRes.json();

			// Store token and user data
			localStorage.setItem('token', data.token);
			localStorage.setItem('user', JSON.stringify(userProfile));

			setToken(data.token);
			setUser(userProfile);

			router.push('/donation');
		} catch (error) {
			console.error('Login error:', error);
			throw error;
		}
	};

	const logout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		setToken(null);
		setUser(null);
		router.push('/login');
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				login,
				logout,
				isAuthenticated: !!token,
				isLoading,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}
