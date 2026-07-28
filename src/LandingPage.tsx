import "./LandingPage.css";

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="landing-root">

      {/* Nav */}
      <nav className="landing-nav">
        <span className="landing-logo">friend<span>.</span>notes</span>
        <button className="landing-signin" onClick={onGetStarted}>Sign in</button>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <h1 className="landing-hero-title">
          Remember what matters<br />about the people you love
        </h1>
        <p className="landing-hero-sub">
          Keep notes on your friends' interests, plan the perfect gift,
          and never forget a birthday. All in one place.
        </p>
        <button className="landing-cta" onClick={onGetStarted}>
          Get started
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </section>

      {/* Features */}
      <section className="landing-features">
        <div className="landing-feature">
          <div className="landing-feature-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <h3 className="landing-feature-title">Friend profiles</h3>
          <p className="landing-feature-desc">
            Keep a profile for each friend with their location, birthday, and everything you want to remember about them.
          </p>
        </div>

        <div className="landing-feature">
          <div className="landing-feature-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <h3 className="landing-feature-title">Organized notes</h3>
          <p className="landing-feature-desc">
            Jot down interests, hobbies, hangout ideas and gift ideas — organized by category so you can find them fast.
          </p>
        </div>

        <div className="landing-feature">
          <div className="landing-feature-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <h3 className="landing-feature-title">AI gift ideas</h3>
          <p className="landing-feature-desc">
            Select a friend and let AI suggest thoughtful, personalised gift ideas based on your notes about them.
          </p>
        </div>

        <div className="landing-feature">
          <div className="landing-feature-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3 className="landing-feature-title">Birthday reminders</h3>
          <p className="landing-feature-desc">
            Never miss a birthday. See upcoming birthdays at a glance and get email reminders a week before.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <span className="landing-logo" style={{ fontSize: 16 }}>friend<span>.</span>notes</span>
        <span>Made for thoughtful friends</span>
      </footer>

    </div>
  );
}
