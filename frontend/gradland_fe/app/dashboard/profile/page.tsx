"use client";

import { useState, useEffect } from "react";
import { use_current_user } from "@/hooks/use_profile";
import { use_update_profile } from "@/hooks/use_profile";
import { use_update_goals, Goal } from "@/hooks/use_goal";
import styles from "./profile.module.css";

const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: "SCHOLARSHIP", label: "Scholarships" },
  { value: "INTERNSHIP", label: "Internships" },
  { value: "JOB", label: "Graduate trainee programmes" },
  { value: "GRADUATE_SCHOOL", label: "Graduate school" },
  { value: "ADMISSION_ABROAD", label: "Admission abroad" },
];

export default function ProfilePage() {
  const { data: user, isPending: userLoading } = use_current_user();
  const updateProfile = use_update_profile();
  const updateGoals = use_update_goals();

  const [form, setForm] = useState({
    full_name: "",
    age: "",
    school: "",
    course_of_study: "",
    current_grade: "",
  });
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);

  // Fill the form once the user data actually arrives
  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name ?? "",
        age: user.age?.toString() ?? "",
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

  function saveProfile() {
    updateProfile.mutate({
      full_name: form.full_name,
      age: form.age ? Number(form.age) : undefined,
      school: form.school,
      course_of_study: form.course_of_study,
      current_grade: form.current_grade
        ? Number(form.current_grade)
        : undefined,
    });
  }

  function saveGoals() {
    if (selectedGoals.length === 0) return;
    updateGoals.mutate(selectedGoals);
  }

  if (userLoading)
    return <p className={styles.loading}>Loading your profile…</p>;

  return (
    <div>
      <h1 className={styles.pageTitle}>Profile</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Your details</h2>

        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span>Full name</span>
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </label>
          <label className={styles.field}>
            <span>Age</span>
            <input
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
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

        {updateProfile.isError && (
          <p className={styles.error}>
            {updateProfile.error instanceof Error
              ? updateProfile.error.message
              : "Couldn't save your changes."}
          </p>
        )}

        <button
          className="btn btn-gold"
          onClick={saveProfile}
          disabled={updateProfile.isPending}
        >
          {updateProfile.isPending ? "Saving…" : "Save details"}
        </button>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          {user?.goals?.length ? "Your goals" : "Set your goals"}
        </h2>
        <p className={styles.sectionSubtitle}>
          This is what Gradland uses to find your matches. Pick as many as
          apply.
        </p>

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

        {updateGoals.isError && (
          <p className={styles.error}>
            {updateGoals.error instanceof Error
              ? updateGoals.error.message
              : "Couldn't save your goals."}
          </p>
        )}
        {updateGoals.isSuccess && (
          <p className={styles.success}>Goals updated.</p>
        )}

        <button
          className="btn btn-gold"
          onClick={saveGoals}
          disabled={selectedGoals.length === 0 || updateGoals.isPending}
        >
          {updateGoals.isPending ? "Saving…" : "Save goals"}
        </button>
      </section>
    </div>
  );
}
