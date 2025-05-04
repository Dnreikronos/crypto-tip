"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Lock, Mail, User, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { z } from "zod";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AnimatedBackground from "@/components/ui/AnimatedBackground";

import { registerUser } from "../../../lib/auth";

const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterData = z.infer<typeof registerSchema>;


export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterData, string>>>({});

  const mutation = useMutation({
    mutationFn: ({ name, email, password }: Omit<RegisterData, 'confirmPassword'>) =>
      registerUser({ name, email, password }),
    onSuccess: () => {
      router.push("/login");
    },
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterData, string>> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof RegisterData;
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    mutation.mutate({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });
  };

  const renderError = (field: keyof RegisterData) => {
    return errors[field] ? <p className="text-red-400 text-sm mt-1">{errors[field]}</p> : null;
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 antialiased bg-gradient-to-br from-gray-950 via-gray-900 to-zinc-900 text-gray-100 relative overflow-hidden">
      <AnimatedBackground />

      <div className="w-full max-w-md z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="backdrop-blur-sm bg-black/30 border-white/10 shadow-xl">
            <CardHeader className="space-y-1 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-2">
                <User className="h-6 w-6 text-cyan-500" />
              </div>
              <CardTitle className="text-2xl font-semibold tracking-tight text-white">Create an account</CardTitle>
              <CardDescription className="text-gray-400">Enter your information to create your account</CardDescription>
            </CardHeader>

            <CardContent>
              {mutation.isError && (
                <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/50 text-red-500">
                  <AlertDescription>{(mutation.error as Error).message}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm text-white font-medium">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      className="pl-10 bg-white/5 border-white/10 focus:border-cyan-500 text-white"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  {renderError('name')}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-white font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10 bg-white/5 border-white/10 focus:border-cyan-500 text-white"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  {renderError('email')}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm text-white font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10 bg-white/5 border-white/10 focus:border-cyan-500 text-white"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3" tabIndex={-1}>
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </button>
                  </div>
                  {renderError('password')}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm text-white font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10 bg-white/5 border-white/10 focus:border-cyan-500 text-white"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3" tabIndex={-1}>
                      {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </button>
                  </div>
                  {renderError('confirmPassword')}
                </div>

                <Button type="submit" className="w-full font-medium bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700" disabled={mutation.isPending}>
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col items-center justify-center gap-2">
              <p className="text-center text-sm text-gray-400">
                Already have an account? <Link href="/login" className="text-cyan-500 hover:underline">Sign in</Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}