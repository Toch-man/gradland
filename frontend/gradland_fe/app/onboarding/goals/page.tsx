"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { use_update_goals, Goal } from "@/hooks/use_goal";
import styles from "./goals.module.css";

const GOAL_OPTIONS: { value: Goal; label: string; description: string }[] = [
  {
    value: "SCHOLARSHIP",
    label: "Scholarships",
    description: "Undergraduate or postgraduate funding",
  },
  {
    value: "INTERNSHIP",
    label: "Internships",
    description: "Short-term roles to build experience",
  },
  {
    value: "JOB",
    label: "Graduate trainee programmes",
    description: "Entry-level roles at companies hiring now",
  },
  {
    value: "GRADUATE_SCHOOL",
    label: "Graduate school",
    description: "Funded master's or PhD programmes",
  },
  {
    value: "ADMISSION_ABROAD",
    label: "Admission abroad",
    description: "University applications and requirements",
  },
];

export default function OnboardingGoalsPage() {
  const router = useRouter();
  const updateGoals = use_update_goals();
  const [selected, setSelected] = useState<Goal[]>([]);

  function toggle(goal: Goal) {
    setSelected((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  }

  function handleContinue() {
    if (selected.length === 0) return;
    updateGoals.mutate(selected, {
      onSuccess: () => router.push("/dashboard"),
    });
  }

  return (
    <>
      <Nav minimal />

      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>What are you working toward?</h1>
          <p className={styles.subtitle}>
            Pick as many as apply — you can change these anytime from your
            profile. This is what Gradland uses to find your matches.
          </p>

          <div className={styles.options}>
            {GOAL_OPTIONS.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.option} ${isSelected ? styles.optionSelected : ""}`}
                  onClick={() => toggle(option.value)}
                  aria-pressed={isSelected}
                >
                  <span className={styles.checkbox}>
                    {isSelected && (
                      <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path
                          d="M2 6L4.5 8.5L10 3"
                          stroke="white"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span>
                    <span className={styles.optionLabel}>{option.label}</span>
                    <span className={styles.optionDescription}>
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {updateGoals.isError && (
            <p className={styles.error}>
              {updateGoals.error instanceof Error
                ? updateGoals.error.message
                : "Something went wrong. Try again."}
            </p>
          )}

          <button
            className="btn btn-gold"
            onClick={handleContinue}
            disabled={selected.length === 0 || updateGoals.isPending}
            style={{
              width: "100%",
              fontSize: 16,
              padding: "13px 0",
              marginTop: 8,
            }}
          >
            {updateGoals.isPending ? "Saving…" : "Continue to your matches"}
          </button>
        </div>
      </main>
    </>
  );
}
