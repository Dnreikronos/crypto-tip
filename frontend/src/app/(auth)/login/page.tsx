"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Toaster, toast } from "sonner";

import AnimatedBackground from "@/components/ui/AnimatedBackground";
import { useAuth } from "@/contexts/AuthContext";

interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Define a custom error type
interface AuthError {
  message: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const mutation = useMutation({
    mutationFn: async (data: LoginData) => {
      await login(data.email, data.password, data.rememberMe);
    },
    onSuccess: () => { // Enhanced success toast with icon and description
      toast.success("Login successful", {
        description: `Welcome back!`,
        icon: <Lock className="h-4 w-4 text-green-500" />,
        position: "top-center",
        duration: 3000,
      });
      
      router.push("/my-projects");
    },
    onError: (error: Error | AuthError) => {
      // Enhanced error toast with icon
      toast.error("Login error", {
        description: error.message,
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
        position: "top-center",
        duration: 5000,
      });
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add validation toast when form is incomplete
    if (!formData.email || !formData.password) {
      toast.warning("Incomplete fields", {
        description: "Please fill in all required fields",
        position: "top-center",
      });
      return;
    }
    
    // Show loading toast when submitting
    toast.promise(
      // The actual login request will be handled by the mutation
      mutation.mutateAsync(formData),
      {
        loading: "Verifying your credentials...",
        success: undefined, // We'll handle success manually in onSuccess
        error: undefined, // We'll handle errors manually in onError
      }
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }));
  };

  const handleForgotPassword = () => {
    toast.info("Password reset", {
      description: "Instructions have been sent to your email",
      action: {
        label: "OK",
        onClick: () => toast.dismiss(),
      },
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 antialiased bg-gradient-to-br from-gray-950 via-gray-900 to-zinc-900 text-gray-100 relative overflow-hidden">
      <AnimatedBackground />
      <Toaster richColors closeButton />
      
      <div className="w-full max-w-md z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="backdrop-blur-sm bg-black/30 border-white/10 shadow-xl">
            <CardHeader className="space-y-1 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-2">
                <Lock className="h-6 w-6 text-cyan-500" />
              </div>
              <CardTitle className="text-2xl font-semibold tracking-tight text-white">Welcome back</CardTitle>
              <CardDescription className="text-gray-400">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {mutation.error && (
                <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/50 text-red-500">
                  <AlertDescription>{(mutation.error as Error).message}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-white font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10 bg-white/5 border-white/10 focus:border-cyan-500 text-white"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-white text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Password
                    </Label>
                    <button 
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs text-cyan-500 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-white/5 border-white/10 focus:border-cyan-500 text-white"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="rememberMe" 
                    checked={formData.rememberMe}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="rememberMe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Remember me
                  </Label>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full cursor-pointer font-medium bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700" 
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="flex flex-col items-center justify-center gap-2">
              <p className="text-center text-sm text-gray-400">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-cyan-500 hover:underline">
                  Create an account
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}