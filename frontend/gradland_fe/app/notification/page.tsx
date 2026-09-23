"use client";

import Nav from "@/components/Nav";
import {
  use_notifications,
  use_mark_as_read,
  use_mark_all_as_read,
} from "@/hooks/use_notification";
import Link from "next/link";
import styles from "./notifications.module.css";

export default function NotificationsPage() {
  const { data, isPending } = use_notifications();
  const markAsRead = use_mark_as_read();
  const markAllAsRead = use_mark_all_as_read();

  return (
    <>
      <Nav
        minimal
        showNotifications
        authAction={{ label: "Back to dashboard", href: "/dashboard" }}
      />

      <main className={styles.main}>
        <div className="wrap">
          <div className={styles.header}>
            <h1>Notifications</h1>
            {data && data.unread_count > 0 && (
              <button
                className={styles.markAllBtn}
                onClick={() => markAllAsRead.mutate()}
              >
                Mark all as read
              </button>
            )}
          </div>

          {isPending && <p className={styles.empty}>Loading…</p>}

          {!isPending && data?.notifications.length === 0 && (
            <p className={styles.empty}>
              You&apos;re all caught up — nothing here yet.
            </p>
          )}

          <ul className={styles.list}>
            {data?.notifications.map((n) => (
              <li key={n._id}>
                <Link
                  href={n.link || "#"}
                  className={`${styles.item} ${n.is_read ? "" : styles.itemUnread}`}
                  onClick={() => {
                    if (!n.is_read) markAsRead.mutate(n._id);
                  }}
                >
                  <span>{n.message}</span>
                  <span className={styles.time}>
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
