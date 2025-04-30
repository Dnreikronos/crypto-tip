"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/ui/AuthForm";
import AnimatedBackground from "@/components/ui/AnimatedBackground";

export default function RegisterPage() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);

	async function handleRegister(email: string, password: string, name?: string) {
		try {
			setError(null);

			if (!name) {
				throw new Error("Name is required");
			}

			const res = await fetch("http://localhost:9090/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Registration failed");
			}

			// Redirect to login page on successful registration
			router.push("/login");
		} catch (err) {
			console.error("Registration error:", err);
			setError(err instanceof Error ? err.message : "An error occurred during registration");
		}
	}

	return (
		<main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-zinc-900 text-gray-100 relative overflow-hidden">
			<AnimatedBackground />
			<div className="min-h-screen flex items-center justify-center relative z-10">
				<div className="w-full max-w-md">
					<AuthForm type="register" onSubmit={handleRegister} />
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
