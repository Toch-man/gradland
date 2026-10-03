"use client";

import { useState, useEffect } from "react";
import MilestoneModal from "@/components/MilestoneModal";
import Dialog from "@/components/dialog";
import styles from "../content.module.css";
import {
  use_paths,
  use_toggle_milestone,
  use_mark_applied,
  Milestone,
} from "@/hooks/use_opportunity";

const TYPE_ICON: Record<string, string> = {
  SCHOLARSHIP: "🎓",
  INTERNSHIP: "💼",
  JOB: "🏢",
  FELLOWSHIP: "📚",
  ADMISSION: "🏫",
};

export default function PathsPage() {
  const { data: res, isPending: pathsLoading } = use_paths();
  const toggleMilestone = use_toggle_milestone();
  const markApplied = use_mark_applied();
  const paths = res?.data ?? [];
  const [activeMilestone, setActiveMilestone] = useState<{
    pathId: string;
    milestone: Milestone;
  } | null>(null);
  const [showEmptyDialog, setShowEmptyDialog] = useState(false);

  useEffect(() => {
    if (!pathsLoading && paths?.length === 0) {
      setShowEmptyDialog(true);
    }
  }, [pathsLoading, paths]);

  function submitMilestone(details: Record<string, any>) {
    if (!activeMilestone) return;
    toggleMilestone.mutate(
      {
        pathId: activeMilestone.pathId,
        milestoneId: activeMilestone.milestone._id,
        details,
      },
      { onSuccess: () => setActiveMilestone(null) },
    );
  }

  function uncheckMilestone(pathId: string, milestone: Milestone) {
    toggleMilestone.mutate({ pathId, milestoneId: milestone._id });
  }

  return (
    <div>
      <h1 className={styles.pageTitle}>Your paths</h1>

      <div className={styles.grid}>
        {pathsLoading && <p className={styles.empty}>Loading your paths…</p>}

        {!pathsLoading && paths?.length === 0 && (
          <p className={styles.empty}>
            You&apos;re not tracking anything yet. Check &quot;Recommended&quot;
            in the sidebar and click &quot;Prepare for this&quot; on something
            that fits.
          </p>
        )}

        {paths?.map((path) => (
          <div key={path._id} className={styles.card}>
            <div className={styles.cardHead}>
              <div className={styles.cardTitleRow}>
                <span className={styles.typeIcon}>
                  {TYPE_ICON[(path.opportunity as any).type] ?? "🌟"}
                </span>
                <h3>{path.opportunity.title}</h3>
              </div>
              {path.status === "ELIGIBLE" && (
                <span className={styles.readyTag}>Ready to apply</span>
              )}
              {path.status === "APPLIED" && (
                <span className={styles.appliedTag}>Applied</span>
              )}
            </div>

            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${path.eligibility_score}%` }}
              />
            </div>
            <p className={styles.progressLabel}>
              {path.eligibility_score}% complete
            </p>

            <div className={styles.milestoneList}>
              {path.milestones.map((m) => (
                <label key={m._id} className={styles.milestoneRow}>
                  <input
                    type="checkbox"
                    checked={m.is_completed}
                    onChange={() => {
                      if (m.is_completed) {
                        uncheckMilestone(path._id, m);
                      } else {
                        setActiveMilestone({ pathId: path._id, milestone: m });
                      }
                    }}
                  />
                  <span className={m.is_completed ? styles.done : undefined}>
                    {m.title}
                  </span>
                </label>
              ))}
              {path.milestones.length === 0 && (
                <p className={styles.noMilestones}>
                  No gaps to close — you were already eligible.
                </p>
              )}
            </div>

            {path.status === "ELIGIBLE" && (
              <div className={styles.cardActions}>
                {path.opportunity.application_url && (
                  <a
                    href={path.opportunity.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-gold"
                  >
                    Apply now
                  </a>
                )}
                <button
                  className="btn btn-ghost-on-paper"
                  onClick={() => markApplied.mutate(path._id)}
                  disabled={markApplied.isPending}
                >
                  {markApplied.isPending ? "Saving…" : "Mark as applied"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showEmptyDialog && (
        <Dialog
          title="Nothing tracked yet"
          message="You haven't picked an opportunity to work toward yet. Head to Recommended to find a match and start tracking it."
          actionLabel="Go to Recommended"
          actionHref="/dashboard/matches"
          onClose={() => setShowEmptyDialog(false)}
        />
      )}

      {activeMilestone && (
        <MilestoneModal
          category={activeMilestone.milestone.category as any}
          title={activeMilestone.milestone.title}
          onClose={() => setActiveMilestone(null)}
          onSubmit={submitMilestone}
        />
      )}
    </div>
  );
}
