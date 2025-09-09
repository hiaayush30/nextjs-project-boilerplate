"use client"
import SignupPage from '@/components/sign-up'
import React, { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import axios, { AxiosError } from 'axios'
import { toast } from 'sonner'

function Signup() {
  const router = useRouter();
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<Element>) => {
    e.preventDefault();

    if (!username || !email || !password) {
      toast("All fields are required!");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        process.env.NEXT_PUBLIC_BE_URL + "/user/signup",
        { username, email, password },
        { withCredentials: true }
      );

      toast("Signup successful!");
      router.push("/login");
    } catch (error) {
      if (error instanceof AxiosError) {
        toast(error.response?.data?.error)
      }
      else {
        toast("Something went wrong! Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SignupPage
        handleSubmit={handleSubmit}
        loading={loading}
        setUsername={setUsername}
        setPassword={setPassword}
        setEmail={setEmail}
      />
    </div>
  );
}

export default Signup;
