"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import MilestoneModal from "@/components/MilestoneModal";
import styles from "./dashboard.module.css";
import { use_current_user, use_log_out } from "@/hooks/use_auth";
import {
  use_recommendations,
  use_paths,
  use_create_path,
  use_toggle_milestone,
  Match,
  Milestone,
} from "@/hooks/use_opportunity";

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"paths" | "matches">("paths");
  const [activeMilestone, setActiveMilestone] = useState<{
    pathId: string;
    milestone: Milestone;
  } | null>(null);

  const { data: user, isPending: userLoading } = use_current_user();
  const logOut = use_log_out();

  const {
    data: matches,
    isPending: matchesLoading,
    error: matchesError,
  } = use_recommendations();

  const { data: paths, isPending: pathsLoading } = use_paths();

  const createPath = use_create_path();
  const toggleMilestone = use_toggle_milestone();

  function prepareForOpportunity(match: Match) {
    if (!match.opportunity_id) return;
    createPath.mutate(
      {
        opportunity_id: match.opportunity_id,
        title: match.title,
        description: match.reasoning,
        gaps: match.gaps,
      },
      { onSuccess: () => setTab("paths") },
    );
  }

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
    <>
      <Nav minimal authAction={{ label: "Log out", href: "#" }} />

      <main className={styles.main}>
        <div className="wrap">
          {!userLoading && user && (
            <p className={styles.welcome}>Welcome, {user.full_name}</p>
          )}

          <div className={styles.tabs}>
            <button
              className={tab === "paths" ? styles.tabActive : styles.tab}
              onClick={() => setTab("paths")}
            >
              Your paths ({paths?.length ?? 0})
            </button>
            <button
              className={tab === "matches" ? styles.tabActive : styles.tab}
              onClick={() => setTab("matches")}
            >
              Recommended for you
            </button>
            <button
              className={styles.tab}
              onClick={() =>
                logOut.mutate(undefined, {
                  onSuccess: () => router.push("/login"),
                })
              }
            >
              Log out
            </button>
          </div>

          {tab === "paths" && (
            <div className={styles.grid}>
              {pathsLoading && (
                <p className={styles.empty}>Loading your paths…</p>
              )}

              {!pathsLoading && paths?.length === 0 && (
                <p className={styles.empty}>
                  You&apos;re not tracking anything yet. Check the
                  &quot;Recommended for you&quot; tab and click &quot;Prepare
                  for this&quot; on something that fits.
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
                              setActiveMilestone({
                                pathId: path._id,
                                milestone: m,
                              });
                            }
                          }}
                        />
                        <span
                          className={m.is_completed ? styles.done : undefined}
                        >
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

                  {path.status === "ELIGIBLE" &&
                    path.opportunity.application_url && (
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
          )}

          {tab === "matches" && (
            <div className={styles.grid}>
              {matchesLoading && (
                <p className={styles.empty}>Finding your matches…</p>
              )}

              {matchesError && (
                <p className={styles.error}>
                  {matchesError instanceof Error
                    ? matchesError.message
                    : "Couldn't load your matches."}
                </p>
              )}

              {!matchesLoading && matches?.length === 0 && (
                <p className={styles.empty}>
                  No matches yet — try broadening your goals or check back soon.
                </p>
              )}

              {matches?.map((match, i) => (
                <div key={i} className={styles.card}>
                  <div className={styles.cardHead}>
                    <h3>{match.title}</h3>
                    <span
                      className={
                        match.eligibility_status === "ELIGIBLE"
                          ? styles.tagEligible
                          : match.eligibility_status === "WORKABLE"
                            ? styles.tagWorkable
                            : styles.tagNotEligible
                      }
                    >
                      {match.eligibility_status === "ELIGIBLE"
                        ? "Eligible now"
                        : match.eligibility_status === "WORKABLE"
                          ? "Worth working toward"
                          : "Close, but not yet"}
                    </span>
                  </div>

                  <p className={styles.reasoning}>{match.reasoning}</p>

                  {match.gaps.length > 0 && (
                    <ul className={styles.gapsList}>
                      {match.gaps.map((g, gi) => (
                        <li key={gi}>
                          <strong>{g.criterion}</strong>
                          {g.is_fixable && g.how_to_close && (
                            <span> — {g.how_to_close}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {match.eligibility_status !== "NOT_ELIGIBLE" && (
                    <button
                      className="btn btn-gold"
                      style={{ marginTop: 12 }}
                      onClick={() => prepareForOpportunity(match)}
                      disabled={createPath.isPending}
                    >
                      {match.eligibility_status === "ELIGIBLE"
                        ? "Track this"
                        : "Prepare for this"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {activeMilestone && (
        <MilestoneModal
          category={activeMilestone.milestone.category as any}
          title={activeMilestone.milestone.title}
          onClose={() => setActiveMilestone(null)}
          onSubmit={submitMilestone}
        />
      )}
    </>
  );
}
