import React from "react";
import LatestInterviewsList from "./_components/LatestInterviewsList";
import DashboardStats from "./_components/DashboardStats";

export default function Dashboard() {
  return (
    <div>
      {/* ── Page header ── */}
      <div className="mb-5">
        <h1 className="text-[20px] font-bold text-gray-900 leading-none">Dashboard</h1>
        <p className="text-[13px] text-gray-500 mt-1">
          Your AI recruiting pipeline at a glance.
        </p>
      </div>

      {/* ── Metric cards ── */}
      <DashboardStats />

      {/* ── Recent Interviews ── */}
      <LatestInterviewsList />
    </div>
  );
}
