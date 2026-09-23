"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use_log_in } from "@/hooks/use_auth";
import Nav from "@/components/Nav";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const log_in = use_log_in();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    log_in.mutate(
      {
        email: email,
        password: password,
      },
      { onSuccess: () => router.push("/dashboard") },
    );
  }

  return (
    <>
      <Nav
        minimal
        authAction={{
          label: "New here? Create an account",
          href: "/auth/sign_in",
        }}
      />

      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>
            Sign in to see your matches and track your progress.
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.field}>
              <span>Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>

            <label className={styles.field}>
              <span>Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </label>

            {log_in.isError && (
              <p className={styles.error}>{log_in.error.message}</p>
            )}

            <button
              type="submit"
              className="btn btn-gold"
              disabled={log_in.isPending}
              style={{ width: "100%", fontSize: 16, padding: "13px 0" }}
            >
              {log_in.isPending ? "Logging in…" : "Log in"}
            </button>
          </form>

          <p className={styles.switchText}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign_in" className={styles.switchLink}>
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
