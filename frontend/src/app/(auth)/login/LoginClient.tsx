"use client"

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardDescription, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Toaster, toast } from "sonner";

import AnimatedBackground from "@/components/ui/AnimatedBackground";
import { useAuth } from "@/contexts/AuthContext";

interface LoginData {
  email: string;
  password: string;
}

export default function LoginClient() {
  const router = useRouter();
  const { login, checkAuth, user, loading } = useAuth();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/my-projects';

  const [formData, setFormData] = useState<LoginData>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.push('/my-projects');
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const mutation = useMutation<void, Error, LoginData>({
    mutationFn: async (data) => {
      await login(data.email, data.password);
      const isAuthed = await checkAuth();
      if (!isAuthed) throw new Error("Authentication failed");
    },
    onSuccess: () => {
      toast.success("Login successful", {
        description: "Welcome back!",
        icon: <Lock className="h-4 w-4 text-green-400" />,
        position: "top-center",
      });
      router.push(callbackUrl);
    },
    onError: (error) => {
      toast.error("Login error", {
        description: error.message,
        icon: <Lock className="h-4 w-4 text-red-400" />,
        position: "top-center",
      });
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.warning("Incomplete fields", { position: "top-center" });
      return;
    }
    toast.promise(mutation.mutateAsync(formData), {
      loading: "Verifying credentials...",
      success: undefined,
      error: undefined,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-zinc-900">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-gray-900 to-zinc-900 text-gray-100 relative overflow-hidden">
      <AnimatedBackground />
      <Toaster richColors />
      <div className="w-full max-w-md z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="backdrop-blur-sm bg-black/30 border-white/10 shadow-xl">
            <CardHeader className="flex flex-col items-center space-y-1 text-center">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-2">
                <Lock className="h-6 w-6 text-cyan-400" />
              </div>
              <CardTitle className="text-2xl font-semibold text-white">Welcome Back</CardTitle>
              <CardDescription className="text-gray-400">Enter your credentials to sign in</CardDescription>
            </CardHeader>

            <CardContent>
              {mutation.isError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{mutation.error?.message}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-white font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="pl-10 pr-3 bg-white/5 border-white/10 focus:border-cyan-500 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm text-white font-medium">Password</Label>
                    <Link href="/forgot-password" className="text-xs text-cyan-400 hover:underline">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="pl-10 pr-10 bg-white/5 border-white/10 focus:border-cyan-500 text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full font-medium bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700" disabled={mutation.isPending}>
                  {mutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col items-center space-y-2">
              <p className="text-sm text-gray-400">
                Don’t have an account?{' '}
                <Link href="/register" className="text-cyan-400 hover:underline">Create an account</Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
