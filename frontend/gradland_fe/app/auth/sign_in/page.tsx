"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import styles from "./signin.module.css";

type Status = "STUDENT" | "GRADUATE" | "NIL";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    age: "",
    status: "STUDENT" as Status,
    school: "",
    course_of_study: "",
    current_grade: "",
  });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...form,
            age: Number(form.age),
            current_grade: form.current_grade
              ? Number(form.current_grade)
              : undefined,
          }),
        },
      );

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Something went wrong. Try again.");
        return;
      }

      router.push("/onboarding/goals");
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
          label: "Already have an account? Sign in",
          href: "/login",
        }}
      />

      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>Create your account</h1>
          <p className={styles.subtitle}>
            A few details now — the rest of your profile grows as you use
            Gradland.
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.field}>
              <span>Full name</span>
              <input
                required
                value={form.full_name}
                onChange={(e) => update("full_name", e.target.value)}
                placeholder="Ada Obi"
              />
            </label>

            <label className={styles.field}>
              <span>Email</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>

            <label className={styles.field}>
              <span>Password</span>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </label>

            <div className={styles.row}>
              <label className={styles.field}>
                <span>Age</span>
                <input
                  type="number"
                  required
                  min={13}
                  value={form.age}
                  onChange={(e) => update("age", e.target.value)}
                  placeholder="21"
                />
              </label>

              <label className={styles.field}>
                <span>Status</span>
                <select
                  value={form.status}
                  onChange={(e) => update("status", e.target.value as Status)}
                >
                  <option value="STUDENT">Student</option>
                  <option value="GRADUATE">Graduate</option>
                  <option value="NIL">Not currently studying</option>
                </select>
              </label>
            </div>

            <label className={styles.field}>
              <span>School (optional)</span>
              <input
                value={form.school}
                onChange={(e) => update("school", e.target.value)}
                placeholder="University of Lagos"
              />
            </label>

            <div className={styles.row}>
              <label className={styles.field}>
                <span>Course of study (optional)</span>
                <input
                  value={form.course_of_study}
                  onChange={(e) => update("course_of_study", e.target.value)}
                  placeholder="Computer Science"
                />
              </label>

              <label className={styles.field}>
                <span>Current grade (optional)</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.current_grade}
                  onChange={(e) => update("current_grade", e.target.value)}
                  placeholder="4.2"
                />
              </label>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button
              type="submit"
              className="btn btn-gold"
              disabled={loading}
              style={{ width: "100%", fontSize: 16, padding: "13px 0" }}
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className={styles.switchText}>
            Already have an account?{" "}
            <Link href="/login" className={styles.switchLink}>
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
