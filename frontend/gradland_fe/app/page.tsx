import Link from "next/link";
import Nav from "@/components/Nav";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <>
      <Nav />

      <header className={styles.hero}>
        <div className={`wrap ${styles.heroInner}`}>
          <div>
            <p className={styles.eyebrowFree}>
              For students and graduates figuring out what&apos;s next
            </p>
            <h1 className={styles.heroTitle}>
              Find the path that actually gets you there.
            </h1>
            <p className={styles.heroSub}>
              Gradland matches your profile to real scholarships, internships,
              graduate programmes, and admissions abroad — then shows you
              exactly what&apos;s missing and what to do about it.
            </p>
            <div className={styles.heroCtas}>
              <Link href="/auth/sign_in" className="btn btn-gold">
                Get your matches
              </Link>
              <a href="#how" className="btn btn-ghost-on-ink">
                See how it works
              </a>
            </div>
            <div className={styles.heroStat}>
              <span>Opportunities refreshed daily</span>
              <span className={styles.dot} />
              <span>Built for wherever you&apos;re starting</span>
            </div>
          </div>

          <div className={styles.trailWrap}>
            <svg
              viewBox="0 0 480 380"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="A path from current profile to an eligible scholarship, with milestones for internship, leadership and certification along the way"
            >
              <path
                d="M50 320 C 120 320, 100 240, 170 220 S 260 160, 240 110 S 340 70, 400 55"
                stroke="#3C5A4F"
                strokeWidth="2"
                strokeDasharray="1 9"
                strokeLinecap="round"
              />
              <circle cx="50" cy="320" r="7" fill="#5C8B76" />
              <text
                x="68"
                y="316"
                fill="#EFEADC"
                fontSize="14"
                fontWeight="500"
              >
                Your profile
              </text>
              <text x="68" y="334" fill="#9FB0A6" fontSize="12.5">
                Student, 3.2 CGPA
              </text>

              <circle cx="172" cy="219" r="7" fill="#5C8B76" />
              <text
                x="190"
                y="215"
                fill="#EFEADC"
                fontSize="14"
                fontWeight="500"
              >
                Internship
              </text>
              <text x="190" y="233" fill="#9FB0A6" fontSize="12.5">
                In progress
              </text>

              <circle cx="240" cy="110" r="7" fill="#E3A63E" />
              <text
                x="258"
                y="106"
                fill="#EFEADC"
                fontSize="14"
                fontWeight="500"
              >
                Leadership role
              </text>
              <text x="258" y="124" fill="#9FB0A6" fontSize="12.5">
                Marked complete
              </text>

              <circle cx="400" cy="55" r="9" fill="#E3A63E" />
              <circle
                cx="400"
                cy="55"
                r="14"
                stroke="#E3A63E"
                strokeWidth="1.4"
                fill="none"
                opacity="0.5"
              />
              <text
                x="400"
                y="34"
                fill="#EFEADC"
                fontSize="16"
                fontWeight="500"
                textAnchor="middle"
              >
                Eligible
              </text>
              <text
                x="400"
                y="80"
                fill="#9FB0A6"
                fontSize="12"
                textAnchor="middle"
              >
                Mastercard Foundation
              </text>
            </svg>
            <p className={styles.trailCaption}>
              A real roadmap, not just a list of links
            </p>
          </div>
        </div>
      </header>

      <div className={styles.strip}>
        <div className={`wrap ${styles.stripInner}`}>
          <span>
            <strong>Scholarships</strong> · undergrad &amp; postgrad
          </span>
          <span>
            <strong>Internships</strong> · local &amp; remote
          </span>
          <span>
            <strong>Graduate trainee</strong> programmes
          </span>
          <span>
            <strong>Admission</strong> abroad
          </span>
        </div>
      </div>

      <section id="how" className={styles.section}>
        <div className="wrap">
          <div className={styles.sectionHead}>
            <h2>How Gradland works</h2>
            <p>
              You don&apos;t need to know exactly what you&apos;re looking for
              yet. You need to know where you&apos;re starting from.
            </p>
          </div>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNum}>01</div>
              <h3>Tell us where you&apos;re headed</h3>
              <p>
                Set your goals — scholarship, internship, grad school, admission
                abroad, or more than one. Your course, grade, and experience
                fill in the rest.
              </p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>02</div>
              <h3>We show your real fit</h3>
              <p>
                Every match comes with a reason: eligible now, worth working
                toward, or genuinely not a fit — and why, so you&apos;re never
                guessing.
              </p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>03</div>
              <h3>Close the gap, one box at a time</h3>
              <p>
                Missing an internship or a certification? Get a checklist built
                for that specific opportunity, and know the moment you&apos;re
                ready to apply.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`${styles.typesSection} ${styles.section}`}
        id="opportunities"
      >
        <div className="wrap">
          <div className={styles.sectionHead}>
            <h2>What we match you to</h2>
            <p>One profile, every kind of opportunity worth tracking.</p>
          </div>
          <div className={styles.typesGrid}>
            {[
              {
                title: "Scholarships",
                desc: "Undergraduate and postgraduate funding, matched against your grade, course, and country eligibility.",
              },
              {
                title: "Internships",
                desc: "Short-term roles that build the exact experience many scholarships and jobs ask for.",
              },
              {
                title: "Graduate trainee programmes",
                desc: "Structured entry-level roles at companies actively hiring recent graduates right now.",
              },
              {
                title: "Graduate school",
                desc: "Funded master's and PhD programmes, filtered by field, funding type, and country.",
              },
              {
                title: "Admission abroad",
                desc: "University applications and requirements, tracked alongside the scholarships that could fund them.",
              },
              {
                title: "More being added",
                desc: "Every profile you build helps Gradland surface opportunities we haven't seen before too.",
              },
            ].map((t) => (
              <div className={styles.typeCard} key={t.title}>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="why" className={styles.section}>
        <div className={`wrap ${styles.diffGrid}`}>
          <div>
            <div className={styles.sectionHead} style={{ marginBottom: 40 }}>
              <h2>Not eligible yet isn&apos;t the end of the answer</h2>
              <p>
                Most search tools stop at a yes or no. Gradland tells you
                what&apos;s actually missing — and whether it&apos;s worth
                working toward.
              </p>
            </div>
            <div className={styles.diffItem}>
              <h3>Every match comes with a reason</h3>
              <p>
                No opportunity shows up unexplained. You&apos;ll always know why
                something fits, or why it doesn&apos;t, in plain language.
              </p>
            </div>
            <div className={styles.diffItem}>
              <h3>Gaps become a checklist, not a dead end</h3>
              <p>
                Need two years of leadership experience? We tell you that
                directly, and give you a concrete way to start closing it.
              </p>
            </div>
            <div className={styles.diffItem}>
              <h3>New opportunities, found while you work</h3>
              <p>
                Alongside our curated list, Gradland checks the web for openings
                that match your goals as they appear.
              </p>
            </div>
          </div>

          <div className={styles.exampleCard}>
            <span className={styles.tag}>Worth working toward</span>
            <h4>Mastercard Foundation Scholars Program</h4>
            <p className={styles.reason}>
              You meet the course and country requirements. Two gaps stand
              between you and applying — both closeable within a semester.
            </p>
            <div className={`${styles.milestoneRow} ${styles.done}`}>
              <div className={`${styles.check} ${styles.checkDone}`}>
                <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M2 6L4.5 8.5L10 3"
                    stroke="white"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span>Leadership role — student organisation, 6+ months</span>
            </div>
            <div className={styles.milestoneRow}>
              <div className={styles.check} />
              <span>Project management certification</span>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.ctaBand}>
        <div className="wrap">
          <h2>Your next opportunity is closer than it looks.</h2>
          <p>
            Set your goals once. Gradland keeps matching, checking, and telling
            you exactly where you stand.
          </p>
          <Link
            href="/signup"
            className="btn btn-gold"
            style={{ fontSize: 16, padding: "13px 26px" }}
          >
            Get your matches
          </Link>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={`wrap ${styles.footerInner}`}>
          <span>© 2026 Gradland</span>
          <div className={styles.footerLinks}>
            <a href="#how">How it works</a>
            <a href="#opportunities">Opportunities</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </>
  );
}
