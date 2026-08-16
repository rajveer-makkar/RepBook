"use client";

import { useActionState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { signup, type AuthResult } from "@/lib/actions/auth";

const initialState: AuthResult = {};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-bold text-zinc-900">Create your account</h1>
        <p className="mb-6 text-sm text-zinc-500">Takes 20 seconds. Your program builds itself.</p>

        <form action={formAction} className="space-y-4">
          <div>
            <Label>Display name</Label>
            <Input name="displayName" placeholder="Raj" />
          </div>
          <div>
            <Label>Email</Label>
            <Input name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
          </div>
          <div>
            <Label>Password</Label>
            <Input name="password" type="password" required minLength={6} autoComplete="new-password" placeholder="At least 6 characters" />
          </div>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <Button type="submit" loading={pending}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-zinc-900 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}