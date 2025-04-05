'use client'

import AuthForm from "@/components/ui/AuthForm";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import AnimatedBackground from "@/components/ui/AnimatedBackground";

export default function LoginPage() {
  const router = useRouter();

  async function handleLogin(email: string, password: string) {
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.ok) router.push("/");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-zinc-900 text-gray-100 relative overflow-hidden">
      <AnimatedBackground />
      <div className="min-h-screen flex items-center justify-center  relative z-10">
        <AuthForm type="login" onSubmit={handleLogin} />
      </div>
    </main>
    
  );
}
