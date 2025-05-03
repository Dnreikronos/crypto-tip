'use client'

import AuthForm from "@/components/ui/AuthForm";
import { useAuth } from "@/contexts/AuthContext";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import { useState } from "react";

export default function LoginPage() {
	const { login } = useAuth();
	const [error, setError] = useState<string | null>(null);

	async function handleLogin(email: string, password: string) {
		try {
			setError(null);
			await login(email, password);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred during login');
		}
	}

	return (
		<main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-zinc-900 text-gray-100 relative overflow-hidden">
			<AnimatedBackground />
			<div className="min-h-screen flex items-center justify-center relative z-10">
				<div className="w-full max-w-md">
					<AuthForm type="login" onSubmit={handleLogin} />
					{error && (
						<div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-500 text-center">
							{error}
						</div>
					)}
				</div>
			</div>
		</main>
	);
}
