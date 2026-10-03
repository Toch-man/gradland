"use client";

import { useState, useEffect } from "react";
import { use_current_user, use_update_profile } from "@/hooks/use_profile";
import { use_update_goals, Goal } from "@/hooks/use_goal";
import { use_paths } from "@/hooks/use_opportunity";
import styles from "./profile.module.css";

const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: "SCHOLARSHIP", label: "Scholarships" },
  { value: "INTERNSHIP", label: "Internships" },
  { value: "JOB", label: "Graduate trainee programmes" },
  { value: "GRADUATE_SCHOOL", label: "Graduate school" },
  { value: "ADMISSION_ABROAD", label: "Admission abroad" },
];

const GOAL_LABELS: Record<string, string> = Object.fromEntries(
  GOAL_OPTIONS.map((g) => [g.value, g.label]),
);

export default function ProfilePage() {
  const { data: user_res, isPending: userLoading } = use_current_user();
  const { data: path_res } = use_paths();
  const updateProfile = use_update_profile();
  const updateGoals = use_update_goals();
  const user = user_res?.data;
  const paths = path_res?.data;
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    date_of_birth: "",
    school: "",
    course_of_study: "",
    current_grade: "",
  });
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name ?? "",
        date_of_birth: user.date_of_birth
          ? user.date_of_birth.slice(0, 10)
          : "",
        school: user.school ?? "",
        course_of_study: user.course_of_study ?? "",
        current_grade: user.current_grade?.toString() ?? "",
      });
      setSelectedGoals(user.goals ?? []);
    }
  }, [user]);

  function toggleGoal(goal: Goal) {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  }

  function saveAll() {
    updateProfile.mutate({
      full_name: form.full_name,
      date_of_birth: form.date_of_birth || undefined,
      school: form.school,
      course_of_study: form.course_of_study,
      current_grade: form.current_grade
        ? Number(form.current_grade)
        : undefined,
    });
    if (selectedGoals.length > 0) {
      updateGoals.mutate(selectedGoals, {
        onSuccess: () => setIsEditing(false),
      });
    } else {
      setIsEditing(false);
    }
  }

  if (userLoading)
    return <p className={styles.loading}>Loading your profile…</p>;

  const trackedCount = paths?.length ?? 0;
  const eligibleCount =
    paths?.filter((p) => p.status === "ELIGIBLE").length ?? 0;
  const appliedCount =
    paths?.filter((p) => (p.status as string) === "APPLIED").length ?? 0;

  return (
    <div>
      {!isEditing && (
        <>
          <div className={styles.heroCard}>
            <div className={styles.avatar}>
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "?"}
            </div>
            <div>
              <h1 className={styles.heroName}>
                {user?.full_name || "Your profile"}
              </h1>
              <p className={styles.heroSub}>
                {user?.course_of_study || "Course not set"}
                {user?.school ? ` · ${user.school}` : ""}
              </p>
            </div>
          </div>

          <div className={styles.detailGrid}>
            <div className={styles.detailBox} style={{ animationDelay: "0ms" }}>
              <span className={styles.detailIcon}>🎂</span>
              <span className={styles.detailValue}>{user?.age ?? "—"}</span>
              <span className={styles.detailLabel}>Age</span>
            </div>
            <div
              className={styles.detailBox}
              style={{ animationDelay: "40ms" }}
            >
              <span className={styles.detailIcon}>📊</span>
              <span className={styles.detailValue}>
                {user?.current_grade ?? "—"}
              </span>
              <span className={styles.detailLabel}>Current grade</span>
            </div>
            <div
              className={styles.detailBox}
              style={{ animationDelay: "80ms" }}
            >
              <span className={styles.detailIcon}>🏫</span>
              <span className={styles.detailValue}>{user?.school || "—"}</span>
              <span className={styles.detailLabel}>School</span>
            </div>
            <div
              className={styles.detailBox}
              style={{ animationDelay: "120ms" }}
            >
              <span className={styles.detailIcon}>📖</span>
              <span className={styles.detailValue}>
                {user?.course_of_study || "—"}
              </span>
              <span className={styles.detailLabel}>Course</span>
            </div>
          </div>

          <h2 className={styles.sectionTitle}>Your activity</h2>
          <div className={styles.statGrid}>
            <div
              className={`${styles.statBox} ${styles.statTracked}`}
              style={{ animationDelay: "160ms" }}
            >
              <span className={styles.statIcon}>📌</span>
              <span className={styles.statValue}>{trackedCount}</span>
              <span className={styles.statLabel}>Tracking</span>
            </div>
            <div
              className={`${styles.statBox} ${styles.statEligible}`}
              style={{ animationDelay: "200ms" }}
            >
              <span className={styles.statIcon}>✅</span>
              <span className={styles.statValue}>{eligibleCount}</span>
              <span className={styles.statLabel}>Eligible</span>
            </div>
            <div
              className={`${styles.statBox} ${styles.statApplied}`}
              style={{ animationDelay: "240ms" }}
            >
              <span className={styles.statIcon}>🎉</span>
              <span className={styles.statValue}>{appliedCount}</span>
              <span className={styles.statLabel}>Applied</span>
            </div>
          </div>

          <h2 className={styles.sectionTitle}>Your goals</h2>
          {user?.goals?.length ? (
            <div className={styles.goalTagRow}>
              {user.goals.map((g: string) => (
                <span key={g} className={styles.goalTag}>
                  {GOAL_LABELS[g] ?? g}
                </span>
              ))}
            </div>
          ) : (
            <p className={styles.sectionSubtitle}>No goals set yet.</p>
          )}

          <button
            className="btn btn-gold"
            style={{ marginTop: 20 }}
            onClick={() => setIsEditing(true)}
          >
            Edit profile
          </button>
        </>
      )}

      {isEditing && (
        <>
          <h1 className={styles.pageTitle}>Edit profile</h1>

          <section className={styles.section}>
            <div className={styles.fieldGrid}>
              <label className={styles.field}>
                <span>Full name</span>
                <input
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Date of birth</span>
                <input
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) =>
                    setForm({ ...form, date_of_birth: e.target.value })
                  }
                />
              </label>
              <label className={styles.field}>
                <span>School</span>
                <input
                  value={form.school}
                  onChange={(e) => setForm({ ...form, school: e.target.value })}
                />
              </label>
              <label className={styles.field}>
                <span>Course of study</span>
                <input
                  value={form.course_of_study}
                  onChange={(e) =>
                    setForm({ ...form, course_of_study: e.target.value })
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Current grade</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.current_grade}
                  onChange={(e) =>
                    setForm({ ...form, current_grade: e.target.value })
                  }
                />
              </label>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Your goals</h2>
            <div className={styles.goalGrid}>
              {GOAL_OPTIONS.map((option) => {
                const isSelected = selectedGoals.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`${styles.goalOption} ${isSelected ? styles.goalOptionSelected : ""}`}
                    onClick={() => toggleGoal(option.value)}
                    aria-pressed={isSelected}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </section>

          {(updateProfile.isError || updateGoals.isError) && (
            <p className={styles.error}>
              Couldn&apos;t save your changes. Try again.
            </p>
          )}

          <div className={styles.editActions}>
            <button
              className="btn btn-ghost-on-paper"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-gold"
              onClick={saveAll}
              disabled={updateProfile.isPending || updateGoals.isPending}
            >
              {updateProfile.isPending || updateGoals.isPending
                ? "Saving…"
                : "Save changes"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
