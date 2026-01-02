// src/pages/admin/KycList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * KycList.jsx
 * - Client-side mock list of KYC submissions with search, filters, pagination, export.
 * - Replace mock fetch with API calls to GET /api/admin/kyc when ready.
 */

const MOCK_ROWS = Array.from({ length: 47 }).map((_, i) => {
  const id = `KYC${String(i + 1).padStart(3, "0")}`;
  const risk = Math.floor(Math.random() * 100);
  const statuses = ["pending", "approved", "rejected"];
  const status = risk > 75 ? "pending" : statuses[Math.floor(Math.random() * statuses.length)];
  const daysAgo = Math.floor(Math.random() * 10);
  const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return {
    id,
    name: ["Ravi Kumar", "Sarah Chen", "Alex Johnson", "Priya Sharma", "James Wilson"][i % 5],
    submittedAt: date.toISOString(),
    risk,
    status,
    email: `${id.toLowerCase()}@example.com`,
    phone: `+91 9${Math.floor(100000000 + Math.random() * 899999999)}`,
  };
});

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString();
}

function RiskPill({ risk }) {
  const cls = risk >= 75 ? "bg-red-100 text-red-700" : risk >= 50 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700";
  return <span className={`px-2 py-1 rounded-full text-sm font-medium ${cls}`}>{risk}</span>;
}

export default function KycList() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all / pending / approved / rejected / high
  const [sortBy, setSortBy] = useState("submittedDesc"); // submittedDesc | submittedAsc | riskDesc | riskAsc
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // selection for bulk actions
  const [selected, setSelected] = useState(new Set());
  const [selectAllPage, setSelectAllPage] = useState(false);

  useEffect(() => {
    // simulate fetch
    setLoading(true);
    const t = setTimeout(() => {
      setRows(MOCK_ROWS);
      setLoading(false);
    }, 220);
    return () => clearTimeout(t);
  }, []);

  // derived list (search + filter + sort)
  const filtered = useMemo(() => {
    let list = rows.slice();

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((r) => r.id.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q));
    }

    if (statusFilter !== "all") {
      if (statusFilter === "high") {
        list = list.filter((r) => r.risk >= 75);
      } else {
        list = list.filter((r) => r.status === statusFilter);
      }
    }

    switch (sortBy) {
      case "submittedAsc":
        list.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
        break;
      case "submittedDesc":
        list.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        break;
      case "riskAsc":
        list.sort((a, b) => a.risk - b.risk);
        break;
      case "riskDesc":
        list.sort((a, b) => b.risk - a.risk);
        break;
      default:
        break;
    }

    return list;
  }, [rows, query, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  // selection handlers
  useEffect(() => {
    // when selecting all on page toggle
    if (selectAllPage) {
      const newSet = new Set(selected);
      pageItems.forEach((r) => newSet.add(r.id));
      setSelected(newSet);
    } else {
      // unselect page items
      const newSet = new Set(selected);
      pageItems.forEach((r) => newSet.delete(r.id));
      setSelected(newSet);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectAllPage]);

  function toggleSelect(id) {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setSelected(s);
  }

  function toggleSelectAllCurrentPage() {
    setSelectAllPage((v) => !v);
  }

  function clearSelection() {
    setSelected(new Set());
    setSelectAllPage(false);
  }

  function exportCsv(rowsToExport) {
    const headers = ["id", "name", "email", "phone", "submittedAt", "risk", "status"];
    const csv = [headers.join(",")].concat(
      rowsToExport.map((r) =>
        headers.map((h) => {
          const v = r[h];
          if (v == null) return "";
          // escape quotes
          return `"${String(v).replace(/"/g, '""')}"`;
        }).join(",")
      )
    ).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kyc_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleBulkExport() {
    if (selected.size === 0) {
      alert("No rows selected.");
      return;
    }
    const rowsToExport = rows.filter((r) => selected.has(r.id));
    exportCsv(rowsToExport);
  }

  function handleSingleExport(row) {
    exportCsv([row]);
  }

  function gotoReview(id) {
    navigate(`/admin/kyc/${id}`);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">KYC Submissions</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => { setRows(MOCK_ROWS); setQuery(""); setStatusFilter("all"); setPage(1); }} className="px-3 py-2 border rounded">Refresh</button>
          <button onClick={handleBulkExport} className="px-3 py-2 bg-blue-600 text-white rounded">Export selected</button>
        </div>
      </div>

      <div className="bg-white border rounded p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3 w-full md:w-1/2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by case id, name or email"
              className="flex-1 border rounded px-3 py-2"
              aria-label="Search KYC"
            />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded px-3 py-2 text-sm">
              <option value="submittedDesc">Newest</option>
              <option value="submittedAsc">Oldest</option>
              <option value="riskDesc">Risk (High → Low)</option>
              <option value="riskAsc">Risk (Low → High)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {["all", "pending", "approved", "rejected", "high"].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1 rounded-md text-sm ${statusFilter === s ? "bg-blue-600 text-white" : "border"}`}
              >
                {s === "all" ? "All" : s === "high" ? "High Risk" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border rounded">
        <div className="p-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={selectAllPage} onChange={toggleSelectAllCurrentPage} aria-label="Select all on page" />
            <div className="text-sm text-gray-600">Select page ({pageItems.length})</div>
          </div>
          <div className="text-sm text-gray-500">{filtered.length} results</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-sm text-gray-500 text-left">
                <th className="py-3 px-4">Select</th>
                <th className="py-3 px-4">Case</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-6 text-center text-gray-500">Loading...</td></tr>
              ) : pageItems.length === 0 ? (
                <tr><td colSpan={7} className="p-6 text-center text-gray-500">No results</td></tr>
              ) : pageItems.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} aria-label={`Select ${r.id}`} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium">{r.id}</div>
                    <div className="text-xs text-gray-500">{r.email}</div>
                  </td>
                  <td className="py-3 px-4">{r.name}<div className="text-xs text-gray-500">{r.phone}</div></td>
                  <td className="py-3 px-4 text-sm text-gray-600">{formatDate(r.submittedAt)}</td>
                  <td className="py-3 px-4"><RiskPill risk={r.risk} /></td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-sm ${r.status === "pending" ? "bg-yellow-50 text-yellow-700" : r.status === "approved" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <button onClick={() => gotoReview(r.id)} className="px-2 py-1 border rounded text-sm">Review</button>
                    <button onClick={() => handleSingleExport(r)} className="px-2 py-1 border rounded text-sm">Export</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div className="p-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setPage(1)} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">First</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">Prev</button>
            <input
              type="number"
              value={page}
              onChange={(e) => {
                const v = Number(e.target.value) || 1;
                setPage(Math.min(Math.max(1, v), totalPages));
              }}
              className="w-16 text-center border rounded px-2 py-1"
            />
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2 py-1 border rounded disabled:opacity-50">Next</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-2 py-1 border rounded disabled:opacity-50">Last</button>
          </div>
        </div>
      </div>

      {/* footer selection actions */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">{selected.size} selected</div>
        <div className="flex items-center gap-2">
          <button onClick={() => { if (selected.size === 0) return alert("No rows selected"); /* action e.g., bulk approve */ }} className="px-3 py-2 border rounded text-sm">Bulk action</button>
          <button onClick={clearSelection} className="px-3 py-2 border rounded text-sm">Clear selection</button>
        </div>
      </div>
    </div>
  );
}
