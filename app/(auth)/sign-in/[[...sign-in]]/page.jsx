"use client";
import { SignIn } from "@clerk/nextjs";

const appearance = {
  variables: {
    colorPrimary: "#111111",
    colorBackground: "#ffffff",
    colorText: "#111111",
    colorTextSecondary: "#888888",
    colorInputBackground: "#ffffff",
    colorInputText: "#111111",
    colorInputPlaceholder: "#b0a99e",
    borderRadius: "6px",
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: "14px",
    spacingUnit: "16px",
  },
  elements: {
    rootBox: {
      width: "100%",
    },
    card: {
      boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px #E2DBD2",
      borderRadius: "14px",
      padding: "28px",
    },
    logoBox: {
      display: "none",
    },
    headerTitle: {
      fontSize: "22px",
      fontWeight: "700",
      textAlign: "left",
      color: "#111111",
      letterSpacing: "-0.02em",
    },
    headerSubtitle: {
      fontSize: "13px",
      textAlign: "left",
      color: "#8C8378",
      marginTop: "4px",
    },
    socialButtonsBlockButton: {
      border: "1px solid #DDD7CE",
      backgroundColor: "#ffffff",
      borderRadius: "6px",
      height: "40px",
      boxShadow: "none",
      color: "#111111",
      fontWeight: "500",
      fontSize: "14px",
    },
    dividerText: {
      color: "#B5AFA9",
      fontSize: "11px",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
    },
    dividerLine: {
      backgroundColor: "#E8E2DA",
    },
    formFieldLabel: {
      fontSize: "10px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      color: "#9B938A",
    },
    formFieldInput: {
      border: "1px solid #DDD7CE",
      borderRadius: "6px",
      height: "38px",
      fontSize: "14px",
      backgroundColor: "#ffffff",
      color: "#111111",
      boxShadow: "none",
    },
    formButtonPrimary: {
      backgroundColor: "#ffffff",
      border: "1px solid #C8C0B4",
      color: "#111111",
      borderRadius: "6px",
      height: "40px",
      fontWeight: "500",
      fontSize: "14px",
      boxShadow: "none",
    },
    footerActionText: {
      fontSize: "13px",
      color: "#8C8378",
    },
    footerActionLink: {
      color: "#111111",
      fontWeight: "600",
      fontSize: "13px",
    },
    footer: {
      backgroundColor: "transparent",
    },
    identityPreviewEditButtonIcon: {
      color: "#111111",
    },
  },
};

const Logo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "20px" }}>
    <div
      style={{
        width: "30px",
        height: "30px",
        background: "#111111",
        borderRadius: "7px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M6.5 1v11M1 6.5h11" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
    <span
      style={{
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 700,
        fontSize: "17px",
        color: "#111111",
        letterSpacing: "-0.03em",
      }}
    >
      HireEva
    </span>
  </div>
);

export default function Page() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
      />
      <div
        style={{ background: "#EDE8DF", minHeight: "100vh" }}
        className="flex flex-col items-center justify-center px-4"
      >
        <Logo />
        <SignIn forceRedirectUrl="/dashboard" appearance={appearance} />
      </div>
    </>
  );
}
