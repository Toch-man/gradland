"use client";

import { useState, FormEvent } from "react";
import styles from "./MilestoneModal.module.css";

type Category =
  | "INTERNSHIP"
  | "LEADERSHIP"
  | "CERTIFICATION"
  | "SKILL"
  | "ACADEMIC"
  | "DOCUMENT";

export default function MilestoneModal({
  category,
  title,
  onClose,
  onSubmit,
}: {
  category: Category;
  title: string;
  onClose: () => void;
  onSubmit: (details: Record<string, any>) => void;
}) {
  const [orgTitle, setOrgTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [durationMonths, setDurationMonths] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (category === "INTERNSHIP") {
      onSubmit({
        title: orgTitle,
        organization,
        duration_months: Number(durationMonths),
      });
    } else if (category === "LEADERSHIP") {
      onSubmit({ title: orgTitle, organization, description });
    } else if (category === "CERTIFICATION") {
      onSubmit({ name: orgTitle });
    } else {
      onSubmit({});
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>Mark complete: {title}</h3>
        <p className={styles.subtitle}>
          A couple of details so this stays on your profile for future matches.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {(category === "INTERNSHIP" || category === "LEADERSHIP") && (
            <>
              <label className={styles.field}>
                <span>
                  {category === "INTERNSHIP"
                    ? "Role title"
                    : "Position / title"}
                </span>
                <input
                  required
                  value={orgTitle}
                  onChange={(e) => setOrgTitle(e.target.value)}
                  placeholder={
                    category === "INTERNSHIP"
                      ? "Software Engineering Intern"
                      : "President, CS Club"
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Organization</span>
                <input
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Company or organization name"
                />
              </label>
            </>
          )}

          {category === "INTERNSHIP" && (
            <label className={styles.field}>
              <span>Duration (months)</span>
              <input
                type="number"
                required
                min={1}
                value={durationMonths}
                onChange={(e) => setDurationMonths(e.target.value)}
                placeholder="3"
              />
            </label>
          )}

          {category === "LEADERSHIP" && (
            <label className={styles.field}>
              <span>What did you do in this role?</span>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Led a team of 8, organized..."
              />
            </label>
          )}

          {category === "CERTIFICATION" && (
            <label className={styles.field}>
              <span>Certification name</span>
              <input
                required
                value={orgTitle}
                onChange={(e) => setOrgTitle(e.target.value)}
                placeholder="Google Project Management Certificate"
              />
            </label>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className="btn btn-ghost-on-paper"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-gold">
              Mark complete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
