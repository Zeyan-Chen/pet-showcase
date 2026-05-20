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
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setError("帳號或密碼錯誤");
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
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-bark">
          後台管理
        </p>
        <h1 className="text-3xl font-bold">守宮後台管理展示站</h1>
      </div>
      <Input name="email" type="email" placeholder="電子郵件" required />
      <Input name="password" type="password" placeholder="密碼" required />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "登入中..." : "登入"}
      </Button>
    </form>
  );
}
