"use client";

import Sidebar from "@/components/side_bar";
import { use_require_auth } from "@/hooks/use_require_auth";
import styles from "./layout.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isPending, isError } = use_require_auth();

  // use_require_auth redirects to /login on failure — just wait here so
  // no protected content flashes before that redirect happens.
  if (isPending || isError) return null;

  return (
    <div className={styles.shell}>
      <Sidebar />
      <main className={styles.content}>{children}</main>
    </div>
  );
}
