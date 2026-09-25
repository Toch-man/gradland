"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./nav.module.css";
import {
  use_notifications,
  use_mark_as_read,
  use_mark_all_as_read,
} from "@/hooks/use_notification";

export default function Nav({
  minimal = false,
  authAction,
  showNotifications = false,
}: {
  minimal?: boolean;
  authAction?: { label: string; href: string };
  showNotifications?: boolean;
}) {
  const [bellOpen, setBellOpen] = useState(false);

  return (
    <nav className={styles.nav}>
      <div className={`wrap ${styles.navInner}`}>
        <Link href="/" className={styles.logo}>
          <svg
            className={styles.logoMark}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" stroke="#E3A63E" strokeWidth="1.6" />
            <path
              d="M12 6L13.6 10.4L18 12L13.6 13.6L12 18L10.4 13.6L6 12L10.4 10.4L12 6Z"
              fill="#E3A63E"
            />
          </svg>
          Gradland
        </Link>

        <div className={styles.rightGroup}>
          {showNotifications && (
            <NotificationBell open={bellOpen} setOpen={setBellOpen} />
          )}

          {!minimal && (
            <div className={styles.navLinks}>
              <a href="#how">How it works</a>
              <a href="#opportunities">Opportunities</a>
              <a href="#why">Why Gradland</a>
              <Link href="/login" className="btn btn-ghost-on-ink">
                Sign in
              </Link>
              <Link href="/signup" className="btn btn-gold">
                Get started
              </Link>
            </div>
          )}

          {minimal && authAction && (
            <Link href={authAction.href} className={styles.authLink}>
              {authAction.label}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function NotificationBell({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const { data } = use_notifications();
  const markAsRead = use_mark_as_read();
  const markAllAsRead = use_mark_all_as_read();

  const unreadCount = data?.unread_count ?? 0;

  return (
    <div className={styles.bellWrap}>
      <button
        className={styles.bellButton}
        onClick={() => setOpen(!open)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          width="20"
          height="20"
          aria-hidden="true"
        >
          <path
            d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.73 21a2 2 0 01-3.46 0"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        {unreadCount > 0 && (
          <span className={styles.bellBadge}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className={styles.bellOverlay} onClick={() => setOpen(false)} />
          <div className={styles.bellPanel}>
            <div className={styles.bellHeader}>
              <span>Notifications</span>
              {unreadCount > 0 && (
                <button
                  className={styles.markAllLink}
                  onClick={() => markAllAsRead.mutate()}
                >
                  Mark all as read
                </button>
              )}
            </div>

            {(!data || data.notifications.length === 0) && (
              <p className={styles.bellEmpty}>You&apos;re all caught up.</p>
            )}

            <ul className={styles.bellList}>
              {data?.notifications.slice(0, 8).map((n) => (
                <li key={n._id}>
                  <Link
                    href={n.link || "#"}
                    className={`${styles.bellItem} ${n.is_read ? "" : styles.bellItemUnread}`}
                    onClick={() => {
                      if (!n.is_read) markAsRead.mutate(n._id);
                      setOpen(false);
                    }}
                  >
                    {n.message}
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/notifications"
              className={styles.viewAllLink}
              onClick={() => setOpen(false)}
            >
              View all
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
