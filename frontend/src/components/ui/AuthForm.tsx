"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "./input";
import { Button } from "./button";

interface AuthFormProps {
  type: "login" | "register";
  onSubmit: (name: string,email: string, password: string) => void;
}

export default function AuthForm({ type, onSubmit }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  
  return (
    <motion.form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(email, password);
      }}
      className="space-y-4 bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-2xl font-bold text-white text-center">
        {type === "login" ? "Login" : "Create Account"}
      </h2>
      <label className="text-white">
        E-mail
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label className="text-white">
        Password
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>

      <Button type="submit">{type === "login" ? "Login" : "Register"}</Button>
    </motion.form>
  );
}
