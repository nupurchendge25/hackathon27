// src/pages/admin/AdminDashboard.jsx
// Self-contained Admin Dashboard (no external chart libraries).
// - Uses mock data
// - Single sticky right column with internal scrolling (smooth)
// - Tailwind classes (assumes Tailwind is configured)
// - Drop this file in place of your current AdminDashboard.jsx

import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/* ----------------------
   Mock data (replace with API calls)
   ---------------------- */
const mockData = {
  totals: {
    totalSubmissions: 1240,
    pending: 32,
    approved: 1080,
    rejected: 128,
    highRisk: 24,
    openAmlAlerts: 7,
  },
  submissionsOverTime: Array.from({ length: 30 }).map((_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    count: Math.floor(12 + Math.sin(i / 2) * 6 + Math.random() * 6),
  })),
  riskDistribution: [
    { name: "Low", value: 80, key: "low" },
    { name: "Medium", value: 40, key: "medium" },
    { name: "High", value: 24, key: "high" },
  ],
  topPendingCases: [
    { id: "KYC001", name: "Ravi Kumar", submittedAt: "18h ago", risk: 78 },
    { id: "KYC002", name: "Sarah Chen", submittedAt: "16h ago", risk: 45 },
    { id: "KYC003", name: "Alex Johnson", submittedAt: "19h ago", risk: 82 },
    { id: "KYC004", name: "Maria Garcia", submittedAt: "19h ago", risk: 22 },
    { id: "KYC005", name: "James Wilson", submittedAt: "1d ago", risk: 61 },
  ],
  recentCases: [
    { id: "KYC001", name: "Ravi Kumar", time: "Dec 9, 03:30 PM", risk: 78 },
    { id: "KYC002", name: "Sarah Chen", time: "Dec 9, 05:00 PM", risk: 45 },
    { id: "KYC003", name: "Alex Johnson", time: "Dec 9, 02:45 PM", risk: 82 },
    { id: "KYC004", name: "Maria Garcia", time: "Dec 9, 02:15 PM", risk: 22 },
    { id: "KYC005", name: "James Wilson", time: "Dec 8, 09:50 PM", risk: 61 },
    { id: "KYC006", name: "Priya Sharma", time: "Dec 8, 07:30 PM", risk: 88 },
    { id: "KYC007", name: "David Lee", time: "Dec 8, 06:00 PM", risk: 35 },
    { id: "KYC008", name: "Emma Brown", time: "Dec 8, 03:45 PM", risk: 71 },
  ],
  topAlerts: [
    { id: "AML001", severity: "high", related: 3 },
    { id: "AML002", severity: "medium", related: 1 },
    { id: "AML003", severity: "high", related: 5 },
    { id: "AML004", severity: "low", related: 2 },
  ],
  recentAudits: [
    { admin: "Alice", action: "Approved", target: "KYC001", time: "Dec 9, 05:30 PM", reason: "Documents verified" },
    { admin: "Bob", action: "Rejected", target: "KYC002", time: "Dec 9, 05:00 PM", reason: "Failed face match" },
    { admin: "Charlie", action: "Reviewed", target: "KYC003", time: "Dec 9, 04:30 PM", reason: "" },
    { admin: "Diana", action: "Flagged", target: "KYC004", time: "Dec 9, 03:45 PM", reason: "High risk score" },
    { admin: "Alice", action: "Approved", target: "KYC005", time: "Dec 9, 03:15 PM", reason: "" },
  ],
};

/* ----------------------
   Helpers for small inline SVG charts (no libs)
   ---------------------- */

function LineSpark({ data = [], width = 560, height = 260, stroke = "#2563eb" }) {
  if (!data || data.length === 0) {
    return <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">No data</div>;
  }

  const counts = data.map((d) => d.count);
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  const pad = 8;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  const points = counts
    .map((v, i) => {
      const x = pad + (innerW * i) / (counts.length - 1);
      const y = pad + innerH - ((v - min) / (max - min || 1)) * innerH;
      return `${x},${y}`;
    })
    .join(" ");

  // Fill area under curve
  const fillPoints = [
    `M ${pad} ${pad + innerH}`,
    ...counts.map((v, i) => {
      const x = pad + (innerW * i) / (counts.length - 1);
      const y = pad + innerH - ((v - min) / (max - min || 1)) * innerH;
      return `L ${x} ${y}`;
    }),
    `L ${pad + innerW} ${pad + innerH}`,
  ].join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.3" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPoints} fill="url(#grad)" />
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {counts.map((v, i) => {
        const x = pad + (innerW * i) / (counts.length - 1);
        const y = pad + innerH - ((v - min) / (max - min || 1)) * innerH;
        return <circle key={i} cx={x} cy={y} r="2" fill={stroke} />;
      })}
    </svg>
  );
}

function BarChart({ data = [], width = 300, height = 200, barColor = "#3b82f6" }) {
  if (!data || data.length === 0) {
    return <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">No data</div>;
  }

  const max = Math.max(...data.map(d => d.value));
  const pad = 20;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const barWidth = innerW / data.length * 0.7;
  const spacing = innerW / data.length;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
        const y = pad + innerH * (1 - ratio);
        return (
          <line key={i} x1={pad} y1={y} x2={width - pad} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
        );
      })}
      
      {/* Bars */}
      {data.map((d, i) => {
        const barHeight = (d.value / max) * innerH;
        const x = pad + i * spacing + (spacing - barWidth) / 2;
        const y = pad + innerH - barHeight;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={barHeight} fill={barColor} rx="4" opacity="0.8" />
            <text x={x + barWidth / 2} y={height - 5} textAnchor="middle" className="text-xs" fill="#6b7280">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Donut({ slices = [], size = 200, inner = 60 }) {
  // slices: [{ value, color }]
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  let angle = 0;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;
  const ring = [];

  slices.forEach((s, idx) => {
    const sliceAngle = (s.value / total) * 360;
    const startAngle = angle;
    const endAngle = angle + sliceAngle;
    const large = sliceAngle > 180 ? 1 : 0;

    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);

    const d = [
      `M ${start.x} ${start.y}`,
      `A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`,
      `L ${cx} ${cy}`,
      "Z",
    ].join(" ");

    ring.push(
      <path key={idx} d={d} fill={s.color} stroke="none" opacity="1" />
    );

    angle += sliceAngle;
  });

  // white hole
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
      {ring}
      <circle cx={cx} cy={cy} r={inner} fill="#ffffff" />
    </svg>
  );
}
function polarToCartesian(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180.0;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/* ----------------------
   Small presentational subcomponents
   ---------------------- */
function StatCard({ title, value, icon, trend, color = "slate" }) {
  const colorMap = {
    slate: "bg-white border-slate-200",
  };
  
  const textColorMap = {
    slate: "text-slate-700",
  };

  return (
    <div className={`p-5 rounded-lg shadow-sm border ${colorMap[color]} cursor-pointer hover:shadow-md transition-all duration-300 group`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-slate-600">{title}</div>
        {icon && <span className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity">{icon}</span>}
      </div>
      <div className="flex items-end justify-between">
        <div className={`text-3xl font-bold ${textColorMap[color]}`}>{value}</div>
        {trend && <div className={`text-sm font-semibold ${trend > 0 ? "text-green-600" : "text-red-600"}`}>{trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%</div>}
      </div>
    </div>
  );
}

function RiskBadge({ risk }) {
  const cls =
    risk >= 75 ? "bg-red-100 text-red-700" : risk >= 50 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700";
  return <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${cls}`}>Risk: {risk}</span>;
}

function RecentCaseItem({ item, onReview }) {
  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-200 p-4 mb-3 hover:shadow-md transition-all duration-200 hover:border-blue-300">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold text-gray-900">{item.id}</div>
          <span className="text-xs text-gray-500">•</span>
          <div className="text-sm text-gray-700">{item.name}</div>
        </div>
        <div className="text-xs text-gray-500 mt-1">{item.time}</div>
      </div>
      <div className="flex items-center gap-3">
        <RiskBadge risk={item.risk} />
        <button onClick={() => onReview(item)} className="px-3 py-1.5 rounded-md border border-blue-300 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors">Review</button>
      </div>
    </div>
  );
}

function AlertItem({ alert, onView }) {
  const cls = alert.severity === "high" ? "bg-red-100 text-red-700" : alert.severity === "medium" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700";
  const icon = alert.severity === "high" ? "🔴" : alert.severity === "medium" ? "🟡" : "🟢";
  
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 mb-3 hover:shadow-md transition-all duration-200 hover:border-orange-300">
      <div className="flex items-center gap-3 flex-1">
        <span className="text-lg">{icon}</span>
        <div>
          <div className="text-sm font-semibold">{alert.id}</div>
          <div className="text-xs text-gray-500">{alert.related} related case{alert.related !== 1 ? "s" : ""}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>{alert.severity}</span>
        <button onClick={() => onView(alert)} className="px-3 py-1.5 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors">View</button>
      </div>
    </div>
  );
}

/* ----------------------
   Main component
   ---------------------- */
export default function AdminDashboard() {
  const navigate = useNavigate ? useNavigate() : null;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    // Replace with real API call
    const fetchData = async () => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 200));
      setData(mockData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const submissions = useMemo(() => data?.submissionsOverTime || [], [data]);
  const riskDist = useMemo(() => data?.riskDistribution || [], [data]);
  const recentCases = useMemo(() => {
    if (!data) return [];
    if (filter === "all") return data.recentCases;
    if (filter === "pending") return data.recentCases.filter((c) => c.risk >= 50);
    if (filter === "high") return data.recentCases.filter((c) => c.risk >= 75);
    if (filter === "today") return data.recentCases.slice(0, 5);
    return data.recentCases;
  }, [data, filter]);

  const onReview = (item) => { if (navigate) navigate(`/admin/kyc/${item.id}`); };
  const onViewAlert = (alert) => { if (navigate) navigate(`/admin/aml/${alert.id}`); };

  if (loading || !data) {
    return (
      <div className="p-6">
        <div className="text-2xl font-bold mb-4">Admin Dashboard</div>
        <div className="space-y-4">
          <div className="h-12 rounded-lg bg-gray-100 w-1/3" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 rounded-lg bg-gray-100" />
            <div className="h-24 rounded-lg bg-gray-100" />
            <div className="h-24 rounded-lg bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  /* Prepare donut colors */
  const donut = [
    { value: riskDist[0]?.value || 0, color: "#10b981" }, // low
    { value: riskDist[1]?.value || 0, color: "#f59e0b" }, // medium
    { value: riskDist[2]?.value || 0, color: "#ef4444" }, // high
  ];

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back! Here's your compliance overview.</p>
        </div>
        <div className="flex items-center gap-4 bg-white rounded-lg p-2 shadow-sm border border-gray-200">
          <input type="search" placeholder="Search by name / case id" className="flex-1 border-0 rounded-md px-4 py-2 text-sm focus:outline-none" />
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">⚙️</button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">AD</div>
        </div>
      </div>

      {/* Stats row - 6 column grid */}
      <div className="grid grid-cols-6 gap-4 mb-8">
        <StatCard title="Total Submissions" value={data.totals.totalSubmissions} icon="📄" color="blue" trend={12} />
        <StatCard title="Pending Review" value={data.totals.pending} icon="⏳" color="amber" trend={-5} />
        <StatCard title="Approved" value={data.totals.approved} icon="✅" color="green" trend={8} />
        <StatCard title="Rejected" value={data.totals.rejected} icon="❌" color="red" trend={-2} />
        <StatCard title="High Risk" value={data.totals.highRisk} icon="⚠️" color="red" trend={3} />
        <StatCard title="AML Alerts" value={data.totals.openAmlAlerts} icon="🚨" color="purple" trend={1} />
      </div>

      {/* Main grid layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left column - 8 cols */}
        <div className="col-span-8 space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-6">
            {/* Submissions Line Chart */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-semibold text-slate-800">Submissions Trend</div>
                  <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
                </div>
                <span className="text-2xl">📈</span>
              </div>
              <div style={{ height: 260 }}>
                <LineSpark data={submissions} />
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
                <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded">Avg: {Math.round(submissions.reduce((s, d) => s + d.count, 0) / submissions.length)}/day</span>
              </div>
            </div>

            {/* Risk Distribution Donut */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-semibold text-gray-900">Risk Distribution</div>
                  <p className="text-xs text-gray-600 mt-1">Current portfolio</p>
                </div>
                <span className="text-2xl">🎯</span>
              </div>
              <div className="flex-1 flex items-center justify-center" style={{ height: 220 }}>
                <div style={{ width: 220, height: 220 }}>
                  <Donut slices={donut} size={220} inner={60} />
                </div>
              </div>
              <div className="mt-4 flex justify-center gap-4 text-xs text-gray-600">
                {riskDist.map((r) => {
                  const color = r.key === "low" ? "#10b981" : r.key === "medium" ? "#f59e0b" : "#ef4444";
                  return (
                    <div key={r.name} className="flex items-center gap-2">
                      <span style={{ width: 8, height: 8, borderRadius: 4, background: color }} />
                      <span className="font-medium">{r.name}: {r.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Pending Cases Bar Chart */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-slate-800">Top Pending Cases by Risk</div>
                <p className="text-xs text-slate-500 mt-1">Cases requiring immediate attention</p>
              </div>
              <span className="text-2xl">📊</span>
            </div>
            <div style={{ height: 200 }}>
              <BarChart 
                data={data.topPendingCases.map(c => ({ label: c.id, value: c.risk }))}
                barColor="#f59e0b"
              />
            </div>
          </div>

          {/* Recent Cases */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="font-semibold text-slate-800">Recent Cases</div>
                <p className="text-xs text-slate-500 mt-1">Latest submissions and updates</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end gap-2">
                <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === "all" ? "bg-slate-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>All</button>
                <button onClick={() => setFilter("pending")} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === "pending" ? "bg-slate-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>Pending</button>
                <button onClick={() => setFilter("high")} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === "high" ? "bg-slate-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>High-Risk</button>
                <button onClick={() => setFilter("today")} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === "today" ? "bg-slate-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>Today</button>
              </div>
            </div>
            <div>
              {recentCases.map((c) => <RecentCaseItem key={c.id} item={c} onReview={onReview} />)}
            </div>
          </div>
        </div>

        {/* Right column - 4 cols (no separate scroll) */}
        <div className="col-span-4 space-y-6">
            {/* Top 5 Pending KYC */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-semibold text-slate-800">Top 5 Pending KYC</div>
                  <p className="text-xs text-slate-500 mt-1">Action required</p>
                </div>
                <span className="text-2xl">👥</span>
              </div>
              <div>
                {data.topPendingCases.map((p, idx) => (
                  <div key={p.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg mb-3 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600">{idx + 1}</div>
                      <div>
                        <div className="text-sm font-medium text-slate-800">{p.name}</div>
                        <div className="text-xs text-slate-500">{p.submittedAt}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.risk >= 75 ? "bg-red-100 text-red-700" : p.risk >= 50 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>{p.risk}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/admin/kyc" className="block text-center px-4 py-2.5 mt-4 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors">View All KYC</Link>
            </div>

            {/* Top AML Alerts */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-semibold text-slate-800">Top AML Alerts</div>
                  <p className="text-xs text-slate-500 mt-1">Active investigations</p>
                </div>
                <span className="text-2xl">🚨</span>
              </div>
              <div>
                {data.topAlerts.map((a) => <AlertItem key={a.id} alert={a} onView={onViewAlert} />)}
              </div>
              <Link to="/admin/aml" className="block text-center px-4 py-2.5 mt-4 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors">View All Alerts</Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-slate-800">Quick Actions</div>
                <span className="text-2xl">⚡</span>
              </div>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors">🔄 Refresh Data</button>
                <button className="w-full text-left px-4 py-3 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors">📥 Export CSV</button>
                <button className="w-full text-left px-4 py-3 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors">📋 Create Report</button>
              </div>
            </div>

            {/* Status Summary */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <div className="font-semibold text-gray-900 mb-4">Status Summary</div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">On Track</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: "75%" }}></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">75%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Pending</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: "15%" }}></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">15%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Issues</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: "10%" }}></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">10%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      

      {/* Audit log - Full width */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="font-semibold text-gray-900">Recent Audit Log</div>
            <p className="text-xs text-gray-600 mt-1">Admin activity and case decisions</p>
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">📤 Export</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 font-semibold text-gray-700">Admin</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Action</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Target</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Time</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Reason</th>
              </tr>
            </thead>
            <tbody>
              {data.recentAudits.map((r, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-medium text-gray-900">{r.admin}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      r.action === "Approved" ? "bg-green-100 text-green-700" :
                      r.action === "Rejected" ? "bg-red-100 text-red-700" :
                      r.action === "Flagged" ? "bg-orange-100 text-orange-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>{r.action}</span>
                  </td>
                  <td className="py-4 px-4 text-gray-700">{r.target}</td>
                  <td className="py-4 px-4 text-gray-600">{r.time}</td>
                  <td className="py-4 px-4 text-gray-500">{r.reason || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
