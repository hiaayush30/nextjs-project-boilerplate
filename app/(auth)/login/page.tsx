"use client"
import { useSearchParams } from 'next/navigation';
import React, { FormEvent, useEffect, useState } from 'react';
import { toast } from "sonner";
import LoginPage from '@/components/login';
import { signIn } from "next-auth/react"

function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false);

  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (!mounted) return;
    const error = searchParams.get("error");
    if (error) toast(error);
  }, [mounted, searchParams]);

  const handleSubmit = async (e: FormEvent<Element>) => {
    e.preventDefault();
    if (!username || !password) {
      toast("Username and password required");
      return;
    }
    try {
      setLoading(true);
      await signIn("credentials", {
        username,
        password,
        callbackUrl: "/dashboard"
      });
    } catch (error) {
      toast("Invalid credentials!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <LoginPage
        handleSubmit={handleSubmit}
        setPassword={setPassword}
        setUsername={setUsername}
        loading={loading}
      />
    </div>
  )
}

export default Login
