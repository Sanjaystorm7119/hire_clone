"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "../../../frontend/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  Plus,
  LayoutDashboard,
  Calendar,
  List,
  FileText,
  BriefcaseBusiness,
  GitCompare,
  Settings,
  ChevronRight,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

// ── Navigation groups ─────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    label: "Main",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { name: "Scheduled Interviews", icon: Calendar, path: "/scheduled-interview" },
      { name: "All Interviews", icon: List, path: "/all-interview" },
    ],
  },
  {
    label: "Talent",
    items: [
      { name: "Resume Bank", icon: FileText, path: "/resume-bank" },
      { name: "Job Details Bank", icon: BriefcaseBusiness, path: "/job-details-bank" },
      { name: "Resume Matcher", icon: GitCompare, path: "/resume-matcher" },
    ],
  },
  {
    label: "Account",
    items: [
      { name: "Settings", icon: Settings, path: "/settings" },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function AppSidebar() {
  const path = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  if (!isLoaded || !user) return null;

  return (
    <Sidebar
      className="border-0"
      style={{
        "--sidebar": "#0F172A",
        "--sidebar-foreground": "rgba(248,250,252,0.85)",
        "--sidebar-border": "rgba(255,255,255,0.07)",
        "--sidebar-width": "220px",
      }}
    >
      {/* ── Brand header ── */}
      <SidebarHeader
        className="px-4 pt-5 pb-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#F59E0B" }}
          >
            <span
              className="font-bold text-[13px] leading-none"
              style={{ color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              E
            </span>
          </div>
          <div className="min-w-0">
            <p
              className="font-bold text-[14px] leading-none"
              style={{ color: "#F8FAFC", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              HireEva
            </p>
            <p className="text-[11px] mt-0.5 leading-none" style={{ color: "rgba(255,255,255,0.35)" }}>
              AI Recruiting
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            router.push(`/dashboard/create-interview?new=${Date.now()}`)
          }
          className="w-full h-9 text-[13px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors duration-150"
          style={{
            background: "#F59E0B",
            color: "#0F172A",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#E08900")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#F59E0B")}
        >
          <Plus className="h-3.5 w-3.5" />
          New Interview
        </button>
      </SidebarHeader>

      {/* ── Navigation ── */}
      <SidebarContent className="px-3 py-4 flex flex-col gap-0">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label} className={gi > 0 ? "mt-5" : ""}>
            <p
              className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2"
              style={{
                color: "rgba(255,255,255,0.28)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = path === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-150 w-full group"
                    style={{
                      background: isActive ? "rgba(245,158,11,0.12)" : "transparent",
                      color: isActive ? "#F59E0B" : "rgba(248,250,252,0.58)",
                      fontWeight: isActive ? "600" : "400",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                        e.currentTarget.style.color = "rgba(248,250,252,0.9)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "rgba(248,250,252,0.58)";
                      }
                    }}
                  >
                    <item.icon
                      className="h-4 w-4 flex-shrink-0"
                      style={{ color: isActive ? "#F59E0B" : "rgba(255,255,255,0.32)" }}
                    />
                    <span className="flex-1 truncate">{item.name}</span>
                    {isActive && (
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: "#F59E0B" }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </SidebarContent>

      {/* ── User footer ── */}
      <SidebarFooter
        className="px-3 py-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        <Link href="/settings">
          <div
            className="flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors cursor-pointer group"
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Image
              src={user.imageUrl}
              width={32}
              height={32}
              alt="avatar"
              className="rounded-lg flex-shrink-0"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <div className="min-w-0 flex-1">
              <p
                className="text-[13px] font-medium truncate leading-none"
                style={{ color: "rgba(248,250,252,0.9)" }}
              >
                {user.fullName || user.firstName || "User"}
              </p>
              <p
                className="text-[11px] truncate mt-0.5"
                style={{ color: "rgba(255,255,255,0.32)" }}
              >
                {user.emailAddresses[0]?.emailAddress}
              </p>
            </div>
            <ChevronRight
              className="h-3.5 w-3.5 flex-shrink-0"
              style={{ color: "rgba(255,255,255,0.2)" }}
            />
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
