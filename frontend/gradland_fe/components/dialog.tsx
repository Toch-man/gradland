"use client";

import Link from "next/link";
import styles from "./dialog.module.css";

export default function Dialog({
  title,
  message,
  actionLabel,
  actionHref,
  onClose,
}: {
  title: string;
  message: string;
  actionLabel: string;
  actionHref: string;
  onClose: () => void;
}) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className="btn btn-ghost-on-paper" onClick={onClose}>
            Not now
          </button>
          <Link href={actionHref} className="btn btn-gold" onClick={onClose}>
            {actionLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
