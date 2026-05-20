"use client";

import { useState } from "react";
import { Button, Input } from "@pet-showcase/ui";

export function LoginForm() {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? "")
      })
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setError("Invalid credentials");
      return;
    }

    window.location.href = "/products";
  }

  return (
    <form
      action={handleSubmit}
      className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4"
    >
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-bark">Admin</p>
        <h1 className="text-3xl font-bold">Manage pet showcase</h1>
      </div>
      <Input name="email" type="email" placeholder="Email" required />
      <Input name="password" type="password" placeholder="Password" required />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
