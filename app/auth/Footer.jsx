"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "../../frontend/components/ui/dialog";

// ── Styles ───────────────────────────────────────────────────────────────────

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');

  .ft-root {
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #07070A;
    color: #EEEEF5;
    position: relative;
    overflow: hidden;
  }

  /* Gradient separator line */
  .ft-top-line {
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(91, 110, 245, 0.6) 30%,
      rgba(6, 182, 212, 0.45) 60%,
      transparent 100%
    );
  }

  /* Enormous faded serif wordmark — the design statement */
  .ft-wordmark-bg {
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Instrument Serif', Georgia, serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(88px, 14vw, 196px);
    line-height: 1;
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
    letter-spacing: -0.04em;
    /* transparent fill, faint stroke */
    color: transparent;
    -webkit-text-stroke: 1px rgba(255, 255, 255, 0.045);
    z-index: 0;
  }

  /* Main grid */
  .ft-grid {
    position: relative;
    z-index: 1;
    max-width: 1240px;
    margin: 0 auto;
    padding: 56px 40px 52px;
    display: grid;
    grid-template-columns: 1.7fr 0.75fr 0.85fr;
    gap: 48px;
    align-items: start;
  }

  /* Brand column */
  .ft-logo-row {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 10px;
  }

  .ft-logo-mark {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #5B6EF5, #06B6D4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 800;
    color: white;
    flex-shrink: 0;
    font-family: 'DM Sans', sans-serif;
  }

  .ft-brand-name {
    font-size: 1.05rem;
    font-weight: 700;
    color: #EEEEF5;
    letter-spacing: -0.025em;
    margin: 0;
  }

  .ft-tagline {
    font-size: 13px;
    color: #8B8BA7;
    line-height: 1.68;
    max-width: 270px;
    margin: 0 0 22px;
  }

  /* Contact items */
  .ft-contact {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12.5px;
    color: #7A7A96;
    margin-bottom: 9px;
    text-decoration: none;
    transition: color 0.18s;
  }

  .ft-contact:hover {
    color: #C8C8D8;
  }

  .ft-contact-chip {
    width: 26px;
    height: 26px;
    border-radius: 7px;
    background: #0E0E18;
    border: 1px solid #1C1C2E;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #606082;
  }

  /* Column label */
  .ft-col-label {
    font-size: 10.5px;
    font-weight: 700;
    color: #5A5A78;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 16px;
  }

  /* Text links */
  .ft-nav-link {
    display: block;
    font-size: 13px;
    color: #7A7A96;
    text-decoration: none;
    margin-bottom: 9px;
    transition: color 0.18s;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    font-family: 'DM Sans', sans-serif;
    text-align: left;
    letter-spacing: -0.01em;
  }

  .ft-nav-link:hover {
    color: #EEEEF5;
  }

  /* Social buttons — labeled with icon */
  .ft-social-btn {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 9px 13px;
    background: #0E0E18;
    border: 1px solid #1C1C2E;
    border-radius: 9px;
    color: #7A7A96;
    text-decoration: none;
    font-size: 12.5px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    letter-spacing: -0.01em;
    margin-bottom: 7px;
    width: 100%;
  }

  .ft-social-btn:hover {
    color: #EEEEF5;
    background: #111120;
    border-color: #242438;
  }

  .ft-social-btn.ft-linkedin:hover {
    border-color: rgba(10, 102, 194, 0.35);
    box-shadow: 0 0 18px rgba(10, 102, 194, 0.1);
    color: #7BAEE8;
  }

  .ft-social-btn.ft-twitter:hover {
    border-color: rgba(29, 161, 242, 0.3);
    box-shadow: 0 0 18px rgba(29, 161, 242, 0.08);
    color: #7BCAF5;
  }

  .ft-social-btn.ft-instagram:hover {
    border-color: rgba(225, 48, 108, 0.3);
    box-shadow: 0 0 18px rgba(225, 48, 108, 0.08);
    color: #F07BA8;
  }

  .ft-social-icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  /* Divider */
  .ft-divider {
    height: 1px;
    background: #16162A;
    position: relative;
    z-index: 1;
    margin: 0 40px;
  }

  /* Bottom bar */
  .ft-bottom {
    position: relative;
    z-index: 1;
    max-width: 1240px;
    margin: 0 auto;
    padding: 18px 40px 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ft-copy {
    font-size: 12px;
    color: #5A5A78;
    letter-spacing: -0.01em;
  }

  .ft-made-in {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #5A5A78;
    letter-spacing: -0.01em;
  }

  .ft-heart {
    color: #5B6EF5;
    font-size: 11px;
  }

  /* ── About Dialog ── */
  .ft-about-bg {
    background: #07070A;
    color: #EEEEF5;
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  .ft-about-header {
    position: relative;
    padding: 36px 36px 28px;
    border-bottom: 1px solid #12122A;
    overflow: hidden;
  }

  .ft-about-header-glow {
    position: absolute;
    top: -60px;
    right: -80px;
    width: 320px;
    height: 240px;
    background: radial-gradient(ellipse, rgba(91,110,245,0.12) 0%, rgba(6,182,212,0.06) 40%, transparent 70%);
    pointer-events: none;
  }

  .ft-about-eyebrow {
    font-size: 11px;
    font-weight: 700;
    color: #5B6EF5;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 10px;
  }

  .ft-about-title {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(1.4rem, 3vw, 1.9rem);
    font-weight: 700;
    letter-spacing: -0.035em;
    color: #EEEEF5;
    margin: 0 0 10px;
    line-height: 1.1;
  }

  .ft-about-title em {
    font-family: 'Instrument Serif', Georgia, serif;
    font-style: italic;
    font-weight: 400;
    background: linear-gradient(135deg, #7B8FF8 0%, #38BDF8 55%, #5EDEA8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .ft-about-sub {
    font-size: 13.5px;
    color: #7A7A96;
    line-height: 1.72;
    max-width: 520px;
    margin: 0;
  }

  .ft-about-body {
    padding: 28px 36px 10px;
  }

  .ft-about-section-title {
    font-size: 11px;
    font-weight: 700;
    color: #5A5A78;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 16px;
  }

  .ft-about-mission {
    font-size: 13.5px;
    color: #7A7A96;
    line-height: 1.75;
    margin-bottom: 28px;
  }

  .ft-value-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 28px;
  }

  .ft-value-card {
    background: #0C0C16;
    border: 1px solid #1A1A2C;
    border-left: 2px solid;
    border-radius: 10px;
    padding: 14px 16px;
  }

  .ft-value-card-title {
    font-size: 13px;
    font-weight: 700;
    color: #DDDDED;
    margin-bottom: 5px;
    letter-spacing: -0.015em;
  }

  .ft-value-card-desc {
    font-size: 12px;
    color: #7A7A96;
    line-height: 1.65;
  }

  .ft-about-footer {
    padding: 0 36px 24px;
    display: flex;
    justify-content: flex-end;
  }

  .ft-about-close {
    font-size: 13px;
    font-weight: 500;
    color: #7A7A96;
    cursor: pointer;
    background: none;
    border: 1px solid #1C1C2E;
    border-radius: 8px;
    padding: 8px 18px;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.18s;
    text-decoration: none;
    display: inline-block;
  }

  .ft-about-close:hover {
    color: #EEEEF5;
    border-color: #2A2A40;
    background: #0E0E18;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .ft-grid {
      grid-template-columns: 1fr;
      padding: 40px 20px 36px;
      gap: 30px;
    }
    .ft-divider { margin: 0 20px; }
    .ft-bottom {
      padding: 16px 20px 18px;
      flex-direction: column;
      gap: 5px;
      text-align: center;
    }
    .ft-wordmark-bg {
      font-size: clamp(60px, 22vw, 110px);
    }
    .ft-value-grid {
      grid-template-columns: 1fr;
    }
    .ft-about-header { padding: 24px 20px 20px; }
    .ft-about-body { padding: 20px 20px 10px; }
    .ft-about-footer { padding: 0 20px 20px; }
  }
`;

// ── Icons ────────────────────────────────────────────────────────────────────

const LinkedInSvg = () => (
  <svg className="ft-social-icon" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const TwitterSvg = () => (
  <svg className="ft-social-icon" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
  </svg>
);

const InstagramSvg = () => (
  <svg className="ft-social-icon" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const MailSvg = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PinSvg = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// ── About Dialog ──────────────────────────────────────────────────────────────

const VALUE_CARDS = [
  {
    title: "Fairness by design",
    desc: "Structured, consistent, and explainable evaluations for every candidate.",
    color: "#5B6EF5",
  },
  {
    title: "Speed with signal",
    desc: "Automations that save time while preserving the insights that matter.",
    color: "#06B6D4",
  },
  {
    title: "Human in the loop",
    desc: "Experts guide, calibrate, and approve — AI augments, never replaces humans.",
    color: "#3DD68C",
  },
];

const AboutUsDialog = ({ open, onOpenChange }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent
      className="p-0 overflow-hidden border-0 max-w-2xl w-full"
      style={{ background: "#07070A", border: "1px solid #12122A", borderRadius: 18 }}
    >
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Header */}
      <div className="ft-about-header">
        <div className="ft-about-header-glow" />
        <div className="ft-about-eyebrow">AI-Powered Hiring Platform</div>
        <h2 className="ft-about-title">
          About <em>HireEva</em>
        </h2>
        <p className="ft-about-sub">
          AI that scales your hiring without sacrificing quality. Eva helps teams
          hire faster and fairer — from job post to final decision.
        </p>
      </div>

      {/* Body */}
      <div className="ft-about-body">
        <div className="ft-about-section-title">Our mission</div>
        <p className="ft-about-mission">
          We help teams hire faster and fairer by combining structured interviews,
          adaptive AI, and deeply human feedback loops. From sourcing to final
          decision, Eva turns hours into minutes while keeping candidates at the
          center.
        </p>

        <div className="ft-about-section-title">What we value</div>
        <div className="ft-value-grid">
          {VALUE_CARDS.map(v => (
            <div
              key={v.title}
              className="ft-value-card"
              style={{ borderLeftColor: v.color }}
            >
              <div className="ft-value-card-title">{v.title}</div>
              <p className="ft-value-card-desc">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="ft-about-footer">
        <DialogClose className="ft-about-close">
          Close
        </DialogClose>
      </div>
    </DialogContent>
  </Dialog>
);

// ── Footer ────────────────────────────────────────────────────────────────────

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isAboutOpen, setIsAboutOpen] = React.useState(false);

  return (
    <footer className="ft-root">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Glowing gradient top border */}
      <div className="ft-top-line" />

      {/* Giant faded wordmark — purely decorative depth element */}
      <div className="ft-wordmark-bg" aria-hidden="true">HireEva</div>

      {/* Main three-column grid */}
      <div className="ft-grid">

        {/* Column 1 — Brand + contact */}
        <div>
          <div className="ft-logo-row">
            <div className="ft-logo-mark">E</div>
            <h3 className="ft-brand-name">HireEva</h3>
          </div>
          <p className="ft-tagline">
            Interviewing made Simple, Quick and Easy.<br />
            AI that scales your hiring without sacrificing quality.
          </p>

          <a
            href="mailto:Sanjaysrivastavab@gmail.com"
            className="ft-contact"
          >
            <span className="ft-contact-chip"><MailSvg /></span>
            Sanjaysrivastavab@gmail.com
          </a>
          <div className="ft-contact">
            <span className="ft-contact-chip"><PinSvg /></span>
            Chennai, India
          </div>
        </div>

        {/* Column 2 — Company links */}
        <div>
          <div className="ft-col-label">Company</div>
          <button
            className="ft-nav-link"
            onClick={() => setIsAboutOpen(true)}
          >
            About Us
          </button>
          <a href="#" className="ft-nav-link">Help Center</a>
          <a href="#" className="ft-nav-link">Community</a>
        </div>

        {/* Column 3 — Social */}
        <div>
          <div className="ft-col-label">Connect</div>
          <a
            href="https://www.linkedin.com/company/hireeva-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="ft-social-btn ft-linkedin"
          >
            <LinkedInSvg /> LinkedIn
          </a>
          <a href="#" className="ft-social-btn ft-twitter">
            <TwitterSvg /> Twitter
          </a>
          <a href="#" className="ft-social-btn ft-instagram">
            <InstagramSvg /> Instagram
          </a>
        </div>
      </div>

      {/* Divider */}
      <div className="ft-divider" />

      {/* Bottom bar */}
      <div className="ft-bottom">
        <span className="ft-copy">© {currentYear} HireEva. All rights reserved.</span>
        <span className="ft-made-in">
          Made with <span className="ft-heart">♥</span> in Chennai, India
        </span>
      </div>

      <AboutUsDialog open={isAboutOpen} onOpenChange={setIsAboutOpen} />
    </footer>
  );
};

export default Footer;
