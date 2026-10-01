"use client";

import { useState, useEffect } from "react";
import MilestoneModal from "@/components/MilestoneModal";
import Dialog from "@/components/dialog";
import styles from "../content.module.css";
import {
  use_paths,
  use_toggle_milestone,
  Milestone,
} from "@/hooks/use_opportunity";

export default function PathsPage() {
  const { data, isPending: pathsLoading } = use_paths();
  const toggleMilestone = use_toggle_milestone();
  const paths = data?.data;
  const [activeMilestone, setActiveMilestone] = useState<{
    pathId: string;
    milestone: Milestone;
  } | null>(null);
  const [showEmptyDialog, setShowEmptyDialog] = useState(false);

  // Show the guidance dialog once, the first time we confirm there are
  // genuinely zero tracked paths (not while still loading).
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
  console.log(paths);
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
              <h3>{path.opportunity.title}</h3>
              {path.status === "ELIGIBLE" && (
                <span className={styles.readyTag}>Ready to apply</span>
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

            {path.status === "ELIGIBLE" && path.opportunity.application_url && (
              <a
                href={path.opportunity.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold"
                style={{ marginTop: 16, display: "inline-block" }}
              >
                Apply now
              </a>
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
