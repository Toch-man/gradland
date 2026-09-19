import Link from "next/link";
import styles from "./nav.module.css";

// `minimal` hides the marketing links (how it works / opportunities / why)
// so auth pages (login, signup) show just the logo and a single action link.
export default function Nav({
  minimal = false,
  authAction,
}: {
  minimal?: boolean;
  authAction?: { label: string; href: string };
}) {
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

        {!minimal && (
          <div className={styles.navLinks}>
            <a href="#how">How it works</a>
            <a href="#opportunities">Opportunities</a>
            <a href="#why">Why Gradland</a>
            <Link href="/auth/login" className={`btn btn-ghost-on-ink`}>
              Sign in
            </Link>
            <Link href="/auth/sign_in" className={`btn btn-gold`}>
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
    </nav>
  );
}
