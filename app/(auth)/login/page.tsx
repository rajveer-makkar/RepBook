"use client";

import { useActionState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { login, type AuthResult } from "@/lib/actions/auth";

const initialState: AuthResult = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-bold text-zinc-900">RepBook</h1>
        <p className="mb-6 text-sm text-zinc-500">Sign in to your training log.</p>

        <form action={formAction} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
          </div>
          <div>
            <Label>Password</Label>
            <Input name="password" type="password" required autoComplete="current-password" placeholder="••••••••" />
          </div>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <Button type="submit" loading={pending}>
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          No account?{" "}
          <Link href="/signup" className="font-medium text-zinc-900 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}