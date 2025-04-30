"use client";

import { useRouter } from "next/navigation";
import AuthForm from "@/components/ui/AuthForm";
import AnimatedBackground from "@/components/ui/AnimatedBackground";

export default function RegisterPage() {
  const router = useRouter();

  async function handleRegister(name: string, email: string, password: string) {
    const res = await fetch("http://localhost:9090/register", {
      credentials: "include",
      method: "POST",
      body: JSON.stringify({ name, email, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) router.push("/login");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-zinc-900 text-gray-100 relative overflow-hidden">
          <AnimatedBackground />
          <div className="min-h-screen flex items-center justify-center  relative z-10">
        <AuthForm type="register" onSubmit={handleRegister} />
      </div>
    </main>
    
  );
}
