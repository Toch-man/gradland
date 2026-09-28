"use client";

import {
  use_recommendations,
  use_create_path,
  Match,
} from "@/hooks/use_opportunity";
import styles from "../content.module.css";

export default function MatchesPage() {
  const {
    data: matches,
    isFetching: matchesLoading,
    error: matchesError,
    refetch: refetchMatches,
  } = use_recommendations();

  const createPath = use_create_path();

  function prepareForOpportunity(match: Match) {
    if (!match.opportunity_id) return;
    createPath.mutate({
      opportunity_id: match.opportunity_id,
      title: match.title,
      description: match.reasoning,
      gaps: match.gaps,
    });
  }

  return (
    <div>
      <h1 className={styles.pageTitle}>Recommended for you</h1>

      <div className={styles.matchesHeader}>
        <button
          className="btn btn-gold"
          onClick={() => refetchMatches()}
          disabled={matchesLoading}
        >
          {matchesLoading
            ? "Checking…"
            : matches
              ? "Refresh matches"
              : "Get my matches"}
        </button>
      </div>

      <div className={styles.grid}>
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

        {matches === undefined && !matchesLoading && !matchesError && (
          <p className={styles.empty}>
            Click &quot;Get my matches&quot; above to see opportunities picked
            for you.
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

            {match.program_overview && (
              <p className={styles.programOverview}>{match.program_overview}</p>
            )}

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

            {match.application_strategy && (
              <div className={styles.strategyBox}>
                <p className={styles.strategyLabel}>
                  How to strengthen your application
                </p>
                <p className={styles.strategyText}>
                  {match.application_strategy}
                </p>
              </div>
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
    </div>
  );
}
