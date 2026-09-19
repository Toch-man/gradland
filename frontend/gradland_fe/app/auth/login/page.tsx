"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // needed since your backend sets httpOnly cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Something went wrong. Try again.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Couldn't reach the server. Check your connection.");
    } finally {
      setLoading(false);
    }
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

            {error && <p className={styles.error}>{error}</p>}

            <button
              type="submit"
              className="btn btn-gold"
              disabled={loading}
              style={{ width: "100%", fontSize: 16, padding: "13px 0" }}
            >
              {loading ? "Logging in…" : "Log in"}
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
