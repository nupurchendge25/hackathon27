import React, { useEffect, useId } from "react";
import { useNavigate } from "react-router-dom";

/*
  Dashboard.jsx
  Enterprise-grade KYC / AML Dashboard
*/

export default function Dashboard({ user = null }) {
  const navigate = useNavigate();

  const profile = user || {
    name: "Atharv",
    lastLogin: "December 9, 2025 17:30",
    kycStatus: "Pending",
    riskScore: 42,
    riskCategory: "Medium",
    activities: [
      { id: 1, activity: "PAN Verified", status: "Completed", date: "Nov 23, 2025" },
      { id: 2, activity: "AML Screening", status: "Completed", date: "Nov 23, 2025" },
      { id: 3, activity: "Aadhaar Upload", status: "Pending", date: "Nov 22, 2025" }
    ],
    documents: []
  };

  useEffect(() => {}, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-[1400px] mx-auto">
        <Header profile={profile} onUploadClick={() => navigate("/user/kyc/new")} />
        <MetricsStrip />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          {/* LEFT */}
          <div className="lg:col-span-8 space-y-8">
            <KYCCard
              profile={profile}
              onUploadClick={() => navigate("/user/kyc/new")}
              onViewDetails={() => navigate("/user/kyc/1")}
            />
            <VerificationTimeline status={profile.kycStatus} />
            <ComplianceHistory />
            <ActivitiesTable activities={profile.activities} />
            <Notifications />
          </div>

          {/* RIGHT */}
          <aside className="lg:col-span-4 space-y-8">
            <TrustLevel />
            <AMLCard score={profile.riskScore} category={profile.riskCategory} />
            <ComplianceScore score={profile.riskScore} />
            <DocumentLocker documents={profile.documents} onUpload={() => navigate("/user/kyc/new")} />
            <QuickActions onUpload={() => navigate("/user/kyc/new")} />
            <SupportCard />
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI Helpers ---------- */

function Card({ children }) {
  return <section className="bg-white p-8 rounded-2xl shadow">{children}</section>;
}

function Badge({ children, variant }) {
  const map = {
    success: "bg-green-100 text-green-700",
    danger: "bg-red-100 text-red-700",
    warning: "bg-yellow-100 text-yellow-800",
    neutral: "bg-gray-100 text-gray-700"
  };
  return <span className={`px-3 py-1 rounded-full text-sm ${map[variant]}`}>{children}</span>;
}

/* ---------- Header ---------- */

function Header({ profile, onUploadClick }) {
  return (
    <header className="bg-white p-8 rounded-2xl shadow flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-semibold">Welcome, {profile.name}</h1>
        <p className="text-gray-500 mt-1">Compliance overview & account status</p>
        <p className="text-xs text-gray-400 mt-2">Last login: {profile.lastLogin}</p>
      </div>

      <div className="flex items-center gap-8">
        <div>
          <div className="text-xs text-gray-400">KYC Status</div>
          <KycStatusBadge status={profile.kycStatus} />
        </div>

        <div>
          <div className="text-xs text-gray-400">Risk Score</div>
          <div className="text-2xl font-semibold">{profile.riskScore}/100</div>
          <div className="text-xs text-gray-400">{profile.riskCategory}</div>
        </div>

        <button
          onClick={onUploadClick}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
        >
          Upload KYC
        </button>
      </div>
    </header>
  );
}

function KycStatusBadge({ status }) {
  if (status === "Verified") return <Badge variant="success">Verified</Badge>;
  if (status === "Rejected") return <Badge variant="danger">Rejected</Badge>;
  if (status === "Pending") return <Badge variant="warning">Pending</Badge>;
  return <Badge variant="neutral">Not Submitted</Badge>;
}

/* ---------- Metrics ---------- */

function MetricsStrip() {
  const items = [
    { label: "Documents Uploaded", value: "4", sub: "+1 this week" },
    { label: "KYC Completion", value: "68%", sub: "In progress" },
    { label: "AML Flags", value: "2", sub: "Needs review" },
    { label: "Account Health", value: "Good", sub: "Low risk" }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
      {items.map((m, i) => (
        <Card key={i}>
          <div className="text-sm text-gray-500">{m.label}</div>
          <div className="text-3xl font-semibold mt-2">{m.value}</div>
          <div className="text-xs text-gray-400 mt-1">{m.sub}</div>
        </Card>
      ))}
    </div>
  );
}

/* ---------- KYC Card ---------- */

function KYCCard({ profile, onUploadClick, onViewDetails }) {
  return (
    <Card>
      <h2 className="text-xl font-semibold">KYC Status</h2>
      <p className="text-sm text-gray-500 mt-1">Submission & verification details</p>

      <div className="mt-6 flex justify-between items-center">
        <div className="space-y-1">
          <div className="text-sm">Submission: {profile.documents.length ? "Uploaded" : "Not Uploaded"}</div>
          <div className="text-sm">Verification: {profile.kycStatus}</div>
        </div>

        <div className="flex gap-3">
          <button onClick={onViewDetails} className="px-4 py-2 border rounded-lg">
            View Details
          </button>
          <button
            onClick={onUploadClick}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Upload / Reupload
          </button>
        </div>
      </div>
    </Card>
  );
}

/* ---------- Timeline ---------- */

function VerificationTimeline({ status }) {
  const progress = status === "Verified" ? 100 : status === "Pending" ? 55 : 0;

  return (
    <Card>
      <h3 className="text-xl font-semibold">Verification Timeline</h3>

      <div className="mt-6">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Upload</span>
          <span>Validation</span>
          <span>OCR</span>
          <span>Face Match</span>
          <span>Review</span>
          <span>Done</span>
        </div>

        <div className="h-3 bg-gray-200 rounded-full">
          <div
            className="h-3 bg-indigo-600 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Card>
  );
}

/* ---------- Compliance History ---------- */

function ComplianceHistory() {
  const values = [40, 55, 60, 70, 78, 85];

  return (
    <Card>
      <h3 className="text-xl font-semibold">Compliance History</h3>
      <p className="text-sm text-gray-500 mt-1">Last 6 months</p>

      <div className="mt-6 h-44 flex items-end gap-4">
        {values.map((v, i) => (
          <div key={i} className="flex-1">
            <div className="bg-indigo-500 rounded-t" style={{ height: `${v}%` }} />
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------- Trust Level ---------- */

function TrustLevel() {
  return (
    <Card>
      <h3 className="text-xl font-semibold">Account Trust Level</h3>
      <div className="mt-4 flex items-center gap-4">
        <div className="text-5xl font-bold text-indigo-600">A+</div>
        <p className="text-sm text-gray-500">
          Based on document quality, AML history and verification success.
        </p>
      </div>
    </Card>
  );
}

/* ---------- AML ---------- */

function AMLCard({ score, category }) {
  return (
    <Card>
      <h3 className="text-xl font-semibold">AML Risk</h3>
      <div className="text-3xl font-semibold mt-2">{score}/100</div>
      <div className="text-sm text-gray-400">{category}</div>

      <div className="mt-4 space-y-2">
        {[
          { l: "Low Risk", v: 70, c: "bg-green-500" },
          { l: "Medium Risk", v: 20, c: "bg-yellow-500" },
          { l: "High Risk", v: 10, c: "bg-red-500" }
        ].map((r) => (
          <div key={r.l}>
            <div className="flex justify-between text-xs mb-1">
              <span>{r.l}</span>
              <span>{r.v}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded">
              <div className={`${r.c} h-2 rounded`} style={{ width: `${r.v}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------- Others ---------- */

function ActivitiesTable({ activities }) {
  return (
    <Card>
      <h3 className="text-xl font-semibold">Recent Activities</h3>
      <table className="w-full mt-4 text-sm">
        <tbody>
          {activities.map((a) => (
            <tr key={a.id} className="border-t">
              <td className="py-3">{a.activity}</td>
              <td>{a.status}</td>
              <td className="text-gray-400">{a.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function Notifications() {
  return (
    <Card>
      <h3 className="text-xl font-semibold">Notifications</h3>
      <ul className="mt-4 space-y-2 text-sm">
        <li>Your KYC verification is in progress</li>
        <li>Additional address proof required</li>
        <li>AML flag raised on transaction</li>
      </ul>
    </Card>
  );
}

function DocumentLocker({ documents, onUpload }) {
  return (
    <Card>
      <h3 className="text-xl font-semibold">Document Locker</h3>
      {documents.length === 0 && (
        <button
          onClick={onUpload}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Upload Documents
        </button>
      )}
    </Card>
  );
}

function ComplianceScore({ score }) {
  return (
    <Card>
      <h3 className="text-xl font-semibold">Compliance Score</h3>
      <Donut percent={score} size={120} />
    </Card>
  );
}

function QuickActions({ onUpload }) {
  return (
    <Card>
      <h3 className="text-xl font-semibold">Quick Actions</h3>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button className="border p-2 rounded">Update Profile</button>
        <button onClick={onUpload} className="bg-indigo-600 text-white p-2 rounded">
          Upload Document
        </button>
      </div>
    </Card>
  );
}

function SupportCard() {
  return (
    <Card>
      <h3 className="text-xl font-semibold">Support</h3>
      <p className="text-sm text-gray-500 mt-2">Need help with KYC or AML?</p>
      <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">
        Contact Support
      </button>
    </Card>
  );
}

/* ---------- Donut ---------- */

function Donut({ percent, size }) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const id = useId();

  return (
    <svg width={size} height={size}>
      <defs>
        <linearGradient id={`g-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>

      <circle r={radius} cx={size / 2} cy={size / 2} fill="none" stroke="#E5E7EB" strokeWidth={stroke} />
      <circle
        r={radius}
        cx={size / 2}
        cy={size / 2}
        fill="none"
        stroke={`url(#g-${id})`}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}
