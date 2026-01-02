import React from "react";

export default function AuditLogs() {
  const audits = [
    { admin: "Alice", action: "Approved", target: "KYC001", time: "Dec 9, 05:30 PM", reason: "Docs ok" },
    { admin: "Bob", action: "Rejected", target: "KYC002", time: "Dec 9, 05:00 PM", reason: "Face mismatch" }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>
      <div className="space-y-2">
        {audits.map((a, i) => (
          <div key={i} className="p-3 border rounded">
            <div className="font-medium">{a.admin} — {a.action}</div>
            <div className="text-xs text-gray-500">{a.target} • {a.time} • {a.reason}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
