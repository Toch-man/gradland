"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { use_log_out } from "@/hooks/use_auth";
import { use_notifications } from "@/hooks/use_notification";
import styles from "./side_bar.module.css";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Your paths" },
  { href: "/dashboard/matches", label: "Recommended" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/notifications", label: "Notifications" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logOut = use_log_out();
  const { data: notifData } = use_notifications();
  const unreadCount = notifData?.unread_count ?? 0;

  return (
    <aside className={styles.sidebar}>
      <Link href="/dashboard" className={styles.logo}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={styles.logoMark}
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

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
            >
              <span>{item.label}</span>
              {item.href === "/dashboard/notifications" && unreadCount > 0 && (
                <span className={styles.badge}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <button
        className={styles.logoutBtn}
        onClick={() =>
          logOut.mutate(undefined, { onSuccess: () => router.push("/login") })
        }
      >
        Log out
      </button>
    </aside>
  );
}
