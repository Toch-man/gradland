"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import MilestoneModal from "@/components/MilestoneModal";
import styles from "./dashboard.module.css";
import { use_current_user } from "@/hooks/use_auth";
type Gap = {
  criterion: string;
  is_fixable: boolean;
  how_to_close: string | null;
};

type Match = {
  opportunity_id: string | null;
  title: string;
  source: "DATABASE" | "LIVE_SEARCH";
  eligibility_status: "ELIGIBLE" | "WORKABLE" | "NOT_ELIGIBLE";
  fit_score: number;
  reasoning: string;
  gaps: Gap[];
  application_url: string | null;
  deadline: string | null;
};

type Milestone = {
  _id: string;
  title: string;
  category: string;
  description: string;
  is_completed: boolean;
};

type TrackedPath = {
  _id: string;
  opportunity: { _id: string; title: string; application_url?: string };
  milestones: Milestone[];
  eligibility_score: number;
  status: "IN_PROGRESS" | "ELIGIBLE" | "APPLIED";
};

const API = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardPage() {
  const [tab, setTab] = useState<"paths" | "matches">("paths");
  const [paths, setPaths] = useState<TrackedPath[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMilestone, setActiveMilestone] = useState<{
    pathId: string;
    milestone: Milestone;
  } | null>(null);

  useEffect(() => {
    loadPaths();
    loadMatches();
  }, []);

  async function loadPaths() {
    try {
      const res = await fetch(`${API}/paths`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setPaths(data.data);
    } catch {
      setError("Couldn't load your tracked paths.");
    }
  }

  async function loadMatches() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/opportunities/recommend`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setMatches(data.data);
      } else if (data.requires_goals) {
        setError("Set your goals to see recommendations.");
      }
    } catch {
      setError("Couldn't load your matches.");
    } finally {
      setLoading(false);
    }
  }

  async function prepareForOpportunity(match: Match) {
    try {
      const res = await fetch(`${API}/paths`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          opportunity_id: match.opportunity_id,
          title: match.title,
          description: match.reasoning,
          gaps: match.gaps,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPaths((prev) => [data.data, ...prev]);
        setTab("paths");
      }
    } catch {
      setError("Couldn't start tracking this opportunity.");
    }
  }

  async function submitMilestone(details: Record<string, any>) {
    if (!activeMilestone) return;
    const { pathId, milestone } = activeMilestone;

    try {
      const res = await fetch(
        `${API}/paths/${pathId}/milestones/${milestone._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ details }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setPaths((prev) => prev.map((p) => (p._id === pathId ? data.data : p)));
      }
    } catch {
      setError("Couldn't update that milestone.");
    } finally {
      setActiveMilestone(null);
    }
  }

  async function uncheckMilestone(pathId: string, milestone: Milestone) {
    // Unchecking needs no details modal — just toggle it back
    try {
      const res = await fetch(
        `${API}/paths/${pathId}/milestones/${milestone._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({}),
        },
      );
      const data = await res.json();
      if (data.success) {
        setPaths((prev) => prev.map((p) => (p._id === pathId ? data.data : p)));
      }
    } catch {
      setError("Couldn't update that milestone.");
    }
  }

  return (
    <>
      <Nav minimal authAction={{ label: "Log out", href: "/login" }} />

      <main className={styles.main}>
        <div className="wrap">
          <div className={styles.tabs}>
            <button
              className={tab === "paths" ? styles.tabActive : styles.tab}
              onClick={() => setTab("paths")}
            >
              Your paths ({paths.length})
            </button>
            <button
              className={tab === "matches" ? styles.tabActive : styles.tab}
              onClick={() => setTab("matches")}
            >
              Recommended for you
            </button>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          {tab === "paths" && (
            <div className={styles.grid}>
              {paths.length === 0 && !loading && (
                <p className={styles.empty}>
                  You&apos;re not tracking anything yet. Check the
                  &quot;Recommended for you&quot; tab and click &quot;Prepare
                  for this&quot; on something that fits.
                </p>
              )}

              {paths.map((path) => (
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
              {loading && <p className={styles.empty}>Finding your matches…</p>}

              {!loading && matches.length === 0 && !error && (
                <p className={styles.empty}>
                  No matches yet — try broadening your goals or check back soon.
                </p>
              )}

              {matches.map((match, i) => (
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
