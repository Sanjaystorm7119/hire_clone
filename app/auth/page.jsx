"use client";

import { UserButton } from "@clerk/nextjs";
import { motion, AnimatePresence, useInView } from "motion/react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import Footer from "../auth/Footer";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// ── Constants ────────────────────────────────────────────────────────────────

const INTERVIEW_QUESTIONS = [
  "Walk me through your most challenging technical decision under pressure.",
  "Describe a time you navigated a critical conflict within your team.",
  "How do you prioritize competing demands from multiple stakeholders?",
  "Tell me about a project that taught you the most about leadership.",
];

const PLATFORM_FEATURES = [
  {
    icon: "⬡",
    label: "AI Question Generation",
    desc: "Tailored interview questions from any job description in seconds.",
    color: "#5B6EF5",
  },
  {
    icon: "◈",
    label: "Voice AI Interviews",
    desc: "Eva conducts structured voice interviews 24/7 — no scheduling required.",
    color: "#A855F7",
  },
  {
    icon: "◎",
    label: "Resume Matching",
    desc: "Score every applicant against your JD with precision AI analysis.",
    color: "#3DD68C",
  },
  {
    icon: "⊕",
    label: "Instant Feedback",
    desc: "Structured ratings on skills and fit delivered the moment the call ends.",
    color: "#F5A623",
  },
];

const LIVE_SCORES = [
  { label: "Technical Skills", pct: 87, color: "#5B6EF5" },
  { label: "Communication", pct: 73, color: "#A855F7" },
  { label: "Problem Solving", pct: 91, color: "#3DD68C" },
];

// ── Styles ───────────────────────────────────────────────────────────────────

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');

  :root {
    --pg-bg: #07070A;
    --pg-surface: #0E0E15;
    --pg-surface-2: #13131E;
    --pg-border: #16162A;
    --pg-border-2: #1E1E32;
    --pg-text: #EEEEF5;
    --pg-muted: #5A5A72;
    --pg-muted-2: #38384E;
    --pg-accent: #5B6EF5;
    --pg-accent-hover: #4A5DE4;
    --pg-purple: #A855F7;
    --pg-green: #3DD68C;
    --pg-warm: #F5A623;
  }

  .pg-root {
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--pg-bg);
    color: var(--pg-text);
    position: relative;
    overflow-x: hidden;
  }

  /* Background: fine dot grid */
  .pg-dot-grid {
    position: fixed;
    inset: 0;
    background-image: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
    z-index: 0;
  }

  /* Atmospheric glows */
  .pg-glow-1 {
    position: absolute;
    top: -240px;
    right: -120px;
    width: 720px;
    height: 720px;
    background: radial-gradient(ellipse, rgba(91,110,245,0.1) 0%, rgba(168,85,247,0.055) 40%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .pg-glow-2 {
    position: absolute;
    bottom: -80px;
    left: -160px;
    width: 520px;
    height: 420px;
    background: radial-gradient(ellipse, rgba(61,214,140,0.065) 0%, transparent 65%);
    pointer-events: none;
    z-index: 0;
  }

  /* ── Navbar ── */
  .pg-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    height: 62px;
    border-bottom: 1px solid var(--pg-border);
    background: rgba(7, 7, 10, 0.85);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .pg-nav-logo {
    display: flex;
    align-items: center;
    gap: 9px;
    text-decoration: none;
    outline: none;
  }

  .pg-nav-wordmark {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--pg-text);
    letter-spacing: -0.025em;
  }

  .pg-nav-btn {
    background: var(--pg-surface);
    border: 1px solid var(--pg-border-2);
    color: var(--pg-muted);
    border-radius: 8px;
    padding: 8px 18px;
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.18s ease;
    font-family: 'DM Sans', sans-serif;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    letter-spacing: -0.01em;
  }

  .pg-nav-btn:hover {
    border-color: #28284A;
    color: var(--pg-text);
  }

  .pg-nav-btn-primary {
    background: var(--pg-accent);
    border-color: var(--pg-accent);
    color: white !important;
  }

  .pg-nav-btn-primary:hover {
    background: var(--pg-accent-hover);
    border-color: var(--pg-accent-hover);
    box-shadow: 0 4px 18px rgba(91,110,245,0.38);
  }

  /* ── Hero ── */
  .pg-hero {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 64px;
    align-items: center;
    max-width: 1240px;
    margin: 0 auto;
    padding: 100px 40px 110px;
    min-height: calc(100vh - 62px);
  }

  .pg-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(91,110,245,0.07);
    border: 1px solid rgba(91,110,245,0.16);
    border-radius: 100px;
    padding: 5px 14px 5px 8px;
    font-size: 12px;
    font-weight: 500;
    color: #8B9CF8;
    letter-spacing: 0.015em;
    width: fit-content;
  }

  .pg-eyebrow-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--pg-accent);
    box-shadow: 0 0 8px rgba(91,110,245,0.9);
    animation: pg-pulse-accent 2.2s ease-in-out infinite;
    flex-shrink: 0;
  }

  @keyframes pg-pulse-accent {
    0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(91,110,245,0.9); }
    50% { opacity: 0.4; box-shadow: 0 0 3px rgba(91,110,245,0.3); }
  }

  .pg-h1 {
    font-size: clamp(2.5rem, 5.5vw, 4.75rem);
    font-weight: 700;
    line-height: 1.06;
    letter-spacing: -0.04em;
    color: var(--pg-text);
    margin: 0;
  }

  /* Serif italic accent — the signature typographic move */
  .pg-h1-serif {
    font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif;
    font-style: italic;
    font-weight: 400;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #7B8FF8 0%, #B07EFF 50%, #5EDEA8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .pg-sub {
    font-size: clamp(0.95rem, 1.4vw, 1.1rem);
    color: var(--pg-muted);
    line-height: 1.78;
    max-width: 480px;
    font-weight: 400;
    margin: 0;
  }

  .pg-cta-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .pg-cta-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--pg-accent);
    color: white !important;
    border-radius: 10px;
    padding: 12px 24px;
    font-size: 14.5px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: -0.01em;
    text-decoration: none;
    white-space: nowrap;
  }

  .pg-cta-primary:hover {
    background: var(--pg-accent-hover);
    transform: translateY(-1px);
    box-shadow: 0 10px 30px rgba(91,110,245,0.42);
    color: white !important;
  }

  .pg-cta-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    color: var(--pg-muted) !important;
    border-radius: 10px;
    padding: 12px 22px;
    font-size: 14.5px;
    font-weight: 500;
    border: 1px solid var(--pg-border-2);
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'DM Sans', sans-serif;
    text-decoration: none;
    white-space: nowrap;
  }

  .pg-cta-secondary:hover {
    border-color: #28284A;
    color: var(--pg-text) !important;
    transform: translateY(-1px);
  }

  /* Feature tags */
  .pg-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--pg-surface);
    border: 1px solid var(--pg-border);
    border-radius: 100px;
    padding: 5px 12px;
    font-size: 12px;
    color: var(--pg-muted);
    font-weight: 500;
    transition: border-color 0.2s;
  }

  .pg-tag:hover {
    border-color: var(--pg-border-2);
  }

  .pg-tag-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  /* Stats */
  .pg-stat-num {
    font-size: clamp(1.6rem, 2.8vw, 2.05rem);
    font-weight: 800;
    letter-spacing: -0.05em;
    color: var(--pg-text);
    line-height: 1;
  }

  .pg-stat-lbl {
    font-size: 11.5px;
    color: var(--pg-muted-2);
    font-weight: 400;
    margin-top: 4px;
    letter-spacing: 0.01em;
  }

  .pg-divider-v {
    width: 1px;
    height: 34px;
    background: var(--pg-border-2);
    align-self: center;
    flex-shrink: 0;
  }

  /* ── Interview Mockup ── */
  .pg-mockup {
    background: var(--pg-surface);
    border: 1px solid var(--pg-border-2);
    border-radius: 20px;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.03),
      0 70px 130px rgba(0,0,0,0.78),
      0 0 90px -25px rgba(91,110,245,0.14);
    position: relative;
  }

  .pg-mockup-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 11px 16px;
    border-bottom: 1px solid var(--pg-border);
    background: rgba(7, 7, 10, 0.7);
  }

  .pg-traffic-lights {
    display: flex;
    gap: 6px;
  }

  .pg-traffic-lights span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: block;
  }

  .pg-live-pill {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 10.5px;
    font-weight: 700;
    color: var(--pg-green);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .pg-live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--pg-green);
    animation: pg-pulse-green 1.6s ease-in-out infinite;
  }

  @keyframes pg-pulse-green {
    0%, 100% { opacity: 1; box-shadow: 0 0 6px rgba(61,214,140,0.85); }
    50% { opacity: 0.35; box-shadow: none; }
  }

  /* Waveform bars */
  .pg-wave-bar {
    width: 3px;
    border-radius: 3px;
    background: var(--pg-accent);
    animation: pg-wave var(--d, 0.7s) ease-in-out var(--dl, 0s) infinite alternate;
    transform-origin: center;
  }

  @keyframes pg-wave {
    from { transform: scaleY(0.15); opacity: 0.22; }
    to   { transform: scaleY(1);    opacity: 0.88; }
  }

  /* Chat bubbles */
  .pg-bubble-eva {
    background: rgba(91,110,245,0.06);
    border: 1px solid rgba(91,110,245,0.11);
    border-radius: 10px 10px 10px 2px;
    padding: 10px 13px;
    font-size: 12.5px;
    color: #C5CAFD;
    line-height: 1.55;
    margin-right: 22px;
  }

  .pg-bubble-candidate {
    background: var(--pg-surface-2);
    border: 1px solid var(--pg-border);
    border-radius: 10px 10px 2px 10px;
    padding: 10px 13px;
    font-size: 12.5px;
    color: #CACACF;
    line-height: 1.55;
    margin-left: 22px;
  }

  .pg-speaker-tag {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  /* Score bars */
  .pg-score-track {
    height: 4px;
    background: var(--pg-border);
    border-radius: 2px;
    overflow: hidden;
    flex: 1;
  }

  .pg-score-fill {
    height: 100%;
    border-radius: 2px;
    width: 0%;
    transition: width 1.8s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .pg-score-fill.pg-loaded { width: var(--w); }

  /* Cursor blink */
  .pg-cursor {
    display: inline-block;
    width: 2px;
    height: 12px;
    background: #8B9CF8;
    margin-left: 2px;
    vertical-align: middle;
    animation: pg-blink 0.7s ease-in-out infinite;
    border-radius: 1px;
  }

  @keyframes pg-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }

  /* Floating animations */
  @keyframes pg-float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-8px); }
  }

  .pg-float   { animation: pg-float 5.2s ease-in-out infinite; }
  .pg-float-2 { animation: pg-float 5.2s ease-in-out 2.1s infinite; }

  /* Floating success card */
  .pg-success-card {
    position: absolute;
    bottom: -20px;
    left: -26px;
    background: var(--pg-surface);
    border: 1px solid var(--pg-border-2);
    border-radius: 13px;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 18px 44px rgba(0,0,0,0.6);
    z-index: 10;
  }

  .pg-success-icon {
    width: 33px;
    height: 33px;
    border-radius: 8px;
    background: rgba(61,214,140,0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    color: var(--pg-green);
    flex-shrink: 0;
  }

  /* ── Features section ── */
  .pg-features {
    position: relative;
    z-index: 1;
    max-width: 1240px;
    margin: 0 auto;
    padding: 0 40px 110px;
  }

  .pg-features-header {
    text-align: center;
    margin-bottom: 48px;
  }

  .pg-features-eyebrow {
    font-size: 12px;
    font-weight: 600;
    color: var(--pg-accent);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 10px;
  }

  .pg-features-title {
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    font-weight: 700;
    letter-spacing: -0.035em;
    color: var(--pg-text);
    margin: 0;
  }

  .pg-feat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }

  .pg-feat-card {
    background: var(--pg-surface);
    border: 1px solid var(--pg-border);
    border-radius: 15px;
    padding: 22px;
    transition: all 0.22s ease;
    cursor: default;
  }

  .pg-feat-card:hover {
    border-color: var(--pg-border-2);
    transform: translateY(-3px);
    box-shadow: 0 22px 54px rgba(0,0,0,0.5);
    background: var(--pg-surface-2);
  }

  .pg-feat-icon-wrap {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    margin-bottom: 14px;
    flex-shrink: 0;
  }

  .pg-feat-title {
    font-size: 14px;
    font-weight: 700;
    color: #DDDDED;
    margin-bottom: 6px;
    letter-spacing: -0.015em;
  }

  .pg-feat-desc {
    font-size: 12.5px;
    color: var(--pg-muted-2);
    line-height: 1.68;
  }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .pg-feat-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 768px) {
    .pg-nav { padding: 0 20px; }
    .pg-hero {
      grid-template-columns: 1fr;
      padding: 60px 20px 60px;
      min-height: unset;
      gap: 48px;
    }
    .pg-mockup-col { display: none; }
    .pg-features { padding: 0 20px 60px; }
    .pg-feat-grid { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 480px) {
    .pg-feat-grid { grid-template-columns: 1fr; }
  }
`;

// ── Sub-components ────────────────────────────────────────────────────────────

function Counter({ target, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1300;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // cubic ease-out
      setVal(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(tick);
      else setVal(target);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

function WaveForm({ active }) {
  const hs = [0.3, 0.58, 0.82, 1, 0.72, 0.5, 0.88, 0.65, 0.38, 0.74, 1, 0.8, 0.55, 0.34, 0.62, 0.8];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 26 }}>
      {hs.map((h, i) => (
        <div
          key={i}
          className="pg-wave-bar"
          style={{
            "--d": active ? `${0.36 + (i % 5) * 0.07}s` : "0s",
            "--dl": `${i * 0.03}s`,
            height: `${h * 100}%`,
            animationPlayState: active ? "running" : "paused",
            opacity: active ? 1 : 0.12,
          }}
        />
      ))}
    </div>
  );
}

function ScoreBar({ label, pct, color }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "var(--pg-muted)" }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color }}>{pct}%</span>
      </div>
      <div className="pg-score-track">
        <div
          className={`pg-score-fill${inView ? " pg-loaded" : ""}`}
          style={{ "--w": `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function InterviewMockup() {
  const [qIdx, setQIdx] = useState(0);
  const [showCandidate, setShowCandidate] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
  const q = INTERVIEW_QUESTIONS[qIdx];

  useEffect(() => {
    setShowCandidate(false);
    setIsTyping(true);
    const t1 = setTimeout(() => {
      setIsTyping(false);
      const t2 = setTimeout(() => {
        setShowCandidate(true);
        const t3 = setTimeout(() => {
          setQIdx(p => (p + 1) % INTERVIEW_QUESTIONS.length);
        }, 3200);
        return () => clearTimeout(t3);
      }, 800);
      return () => clearTimeout(t2);
    }, 2800);
    return () => clearTimeout(t1);
  }, [qIdx]);

  return (
    <div className="pg-mockup pg-float">
      {/* Window chrome */}
      <div className="pg-mockup-bar">
        <div className="pg-traffic-lights">
          <span style={{ background: "#EF4444" }} />
          <span style={{ background: "#F59E0B" }} />
          <span style={{ background: "#22C55E" }} />
        </div>
        <div className="pg-live-pill">
          <span className="pg-live-dot" />
          Live Interview
        </div>
        <span style={{ fontSize: 11, color: "var(--pg-muted-2)" }}>Eva · HireEva</span>
      </div>

      <div style={{ padding: "16px 16px 15px", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Eva avatar + waveform row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--pg-accent), var(--pg-purple))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 800, color: "white", flexShrink: 0,
            boxShadow: "0 0 0 3px rgba(91,110,245,0.2), 0 0 0 6px rgba(91,110,245,0.07)",
            fontFamily: "'DM Sans', sans-serif",
          }}>E</div>
          <WaveForm active={!showCandidate} />
        </div>

        {/* Eva speech bubble */}
        <div className="pg-bubble-eva">
          <div className="pg-speaker-tag" style={{ color: "#7B8FF8" }}>Eva</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={qIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              {q}
              {isTyping && <span className="pg-cursor" />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Candidate reply bubble */}
        <AnimatePresence>
          {showCandidate && (
            <motion.div
              className="pg-bubble-candidate"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
            >
              <div className="pg-speaker-tag" style={{ color: "var(--pg-muted)" }}>Candidate</div>
              Sure! At my last company, I led a microservices migration while keeping production at 99.9% uptime throughout...
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question progress */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10.5, color: "var(--pg-muted-2)" }}>Q {qIdx + 1} / {INTERVIEW_QUESTIONS.length}</span>
          <div style={{ display: "flex", gap: 4 }}>
            {INTERVIEW_QUESTIONS.map((_, i) => (
              <div key={i} style={{
                width: 18, height: 3, borderRadius: 2,
                background: i <= qIdx ? "var(--pg-accent)" : "var(--pg-border-2)",
                transition: "background 0.4s ease",
              }} />
            ))}
          </div>
          <span style={{ fontSize: 10.5, color: "var(--pg-muted-2)" }}>18:42 left</span>
        </div>

        {/* Live evaluation panel */}
        <div style={{
          background: "rgba(7, 7, 10, 0.7)",
          borderRadius: 10,
          padding: "12px 13px",
          border: "1px solid var(--pg-border)",
        }}>
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            color: "var(--pg-muted-2)",
            textTransform: "uppercase",
            letterSpacing: "0.09em",
            marginBottom: 9,
          }}>
            Live Evaluation
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {LIVE_SCORES.map(s => <ScoreBar key={s.label} {...s} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────

function Navbar() {
  const { user } = useUser();
  return (
    <nav className="pg-nav">
      <Link href="/" className="pg-nav-logo">
        <Image
          src="/evaSvg.svg"
          width={30}
          height={30}
          alt="HireEva"
          style={{ borderRadius: "50%" }}
        />
        <span className="pg-nav-wordmark">HireEva</span>
      </Link>

      {!user ? (
        <Link href="./sign-in" className="pg-nav-btn">
          Sign in
        </Link>
      ) : (
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="./dashboard" className="pg-nav-btn pg-nav-btn-primary">
            Dashboard
          </Link>
          <UserButton />
        </div>
      )}
    </nav>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Login() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="pg-root">
        {/* Background layers */}
        <div className="pg-dot-grid" />
        <div className="pg-glow-1" />
        <div className="pg-glow-2" />

        <Navbar />

        {/* ── Hero ── */}
        <div className="pg-hero">
          {/* Left: editorial copy */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ display: "flex", flexDirection: "column", gap: 24 }}
          >
            {/* Eyebrow badge */}
            <div className="pg-eyebrow">
              <span className="pg-eyebrow-dot" />
              AI-Powered Hiring Platform
            </div>

            {/* Headline — the serif/sans contrast is the design signature */}
            <h1 className="pg-h1">
              Hire faster.<br />
              <span className="pg-h1-serif">Interview smarter.</span>
            </h1>

            <p className="pg-sub">
              Eva automates voice interviews, scores candidates instantly, and
              matches top talent to your open roles — so your team can focus on
              decisions, not logistics.
            </p>

            {/* CTA buttons */}
            <div className="pg-cta-row">
              <Link href="/dashboard" className="pg-cta-primary">
                Get started free
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
              <Link href="/sign-in" className="pg-cta-secondary">
                Sign in
              </Link>
            </div>

            {/* Feature tags */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { label: "Voice AI", c: "var(--pg-accent)" },
                { label: "Resume Matching", c: "var(--pg-purple)" },
                { label: "Instant Feedback", c: "var(--pg-green)" },
                { label: "No Scheduling", c: "var(--pg-warm)" },
              ].map(t => (
                <div key={t.label} className="pg-tag">
                  <span className="pg-tag-dot" style={{ background: t.c }} />
                  {t.label}
                </div>
              ))}
            </div>

            {/* Animated stats */}
            <div style={{ display: "flex", gap: 24, alignItems: "center", paddingTop: 4 }}>
              <div>
                <div className="pg-stat-num"><Counter target={2400} suffix="+" /></div>
                <div className="pg-stat-lbl">Interviews run</div>
              </div>
              <div className="pg-divider-v" />
              <div>
                <div className="pg-stat-num"><Counter target={98} suffix="%" /></div>
                <div className="pg-stat-lbl">Candidate satisfaction</div>
              </div>
              <div className="pg-divider-v" />
              <div>
                <div className="pg-stat-num"><Counter target={10} suffix="x" /></div>
                <div className="pg-stat-lbl">Faster hiring</div>
              </div>
            </div>
          </motion.div>

          {/* Right: animated interview mockup */}
          <motion.div
            className="pg-mockup-col"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ position: "relative" }}
          >
            <InterviewMockup />

            {/* Floating success card */}
            <motion.div
              className="pg-success-card pg-float-2"
              initial={{ opacity: 0, scale: 0.86 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.44, delay: 1.05 }}
            >
              <div className="pg-success-icon">✓</div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--pg-text)" }}>
                  Offer extended
                </div>
                <div style={{ fontSize: 11.5, color: "var(--pg-muted-2)" }}>
                  Maya Chen · Senior Engineer
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Features ── */}
        <div className="pg-features">
          <div className="pg-features-header">
            <motion.p
              className="pg-features-eyebrow"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.42 }}
            >
              Everything you need
            </motion.p>
            <motion.h2
              className="pg-features-title"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.42, delay: 0.08 }}
            >
              Built for modern recruiting teams
            </motion.h2>
          </div>

          <div className="pg-feat-grid">
            {PLATFORM_FEATURES.map((f, i) => (
              <motion.div
                key={f.label}
                className="pg-feat-card"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.38, delay: i * 0.07 }}
              >
                <div className="pg-feat-icon-wrap" style={{ background: `${f.color}18` }}>
                  <span style={{ color: f.color, fontWeight: 600 }}>{f.icon}</span>
                </div>
                <div className="pg-feat-title">{f.label}</div>
                <div className="pg-feat-desc">{f.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
