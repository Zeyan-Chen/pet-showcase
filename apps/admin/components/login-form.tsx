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
      setError("帳號或密碼錯誤。");
      return;
    }

    window.location.href = "/products";
  }

  return (
    <form
      action={handleSubmit}
      className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4"
    >
      <div className="space-y-2 rounded-[2rem] border border-[var(--admin-border)] bg-[rgba(255,253,249,0.94)] px-6 py-6 shadow-[0_22px_70px_-40px_rgba(76,57,35,0.18)]">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--admin-muted)]">
          後台登入
        </p>
        <h1 className="text-3xl font-bold text-[var(--admin-ink)]">守宮網站管理後台</h1>
        <p className="text-sm leading-6 text-[var(--admin-muted)]">
          使用管理員帳號登入後，即可管理商品、分類與公告。
        </p>
      </div>
      <Input name="email" type="email" placeholder="電子郵件" required />
      <Input name="password" type="password" placeholder="密碼" required />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="bg-[var(--admin-ink)] text-white hover:bg-[var(--admin-brand-strong)]"
      >
        {isSubmitting ? "登入中..." : "登入"}
      </Button>
    </form>
  );
}
