"use client";

import { useState } from "react";
import MilestoneModal from "@/components/MilestoneModal";
import styles from "../content.module.css";
import {
  use_paths,
  use_toggle_milestone,
  Milestone,
} from "@/hooks/use_opportunity";

export default function PathsPage() {
  const { data: paths, isPending: pathsLoading } = use_paths();
  const toggleMilestone = use_toggle_milestone();

  const [activeMilestone, setActiveMilestone] = useState<{
    pathId: string;
    milestone: Milestone;
  } | null>(null);

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
