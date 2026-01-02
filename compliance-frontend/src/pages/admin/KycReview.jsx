// src/pages/admin/KycReview.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

/**
 * Enhanced KycReview.jsx
 * - Improvements: lightbox, download, OCR copy, low-confidence highlight,
 *   face-match bar, keyboard shortcuts, small toast notifications.
 * - Keep mock data for now; replace fetch/mock with real API later.
 */

/* ------------------------
   Mock data (same shape)
   ------------------------ */
const mockKyc = {
  id: "KYC001",
  user: {
    name: "Ravi Kumar",
    mobile: "+91 98765 43210",
    email: "ravi.kumar@example.com",
  },
  submittedAt: "2025-12-09T10:00:00Z",
  riskScore: 78,
  riskBreakdown: {
    idMismatch: 10,
    docDamage: 5,
    behavior: 30,
    txnPattern: 33,
  },
  documents: [
    { id: "doc-fr", type: "ID Front", url: "https://via.placeholder.com/1600x1000?text=ID+Front" },
    { id: "doc-bk", type: "ID Back", url: "https://via.placeholder.com/1600x1000?text=ID+Back" },
    { id: "doc-selfie", type: "Selfie", url: "https://via.placeholder.com/1600x1000?text=Selfie" },
  ],
  ocr: {
    text: "Name: Ravi Kumar\nDOB: 1992-05-03\nID No: ABCD1234\nAddress: 123, MG Road, Pune",
    fields: [
      { label: "Name", value: "Ravi Kumar", confidence: 0.98 },
      { label: "DOB", value: "1992-05-03", confidence: 0.92 },
      { label: "ID No", value: "ABCD1234", confidence: 0.88 },
      { label: "Address", value: "123, MG Road, Pune", confidence: 0.81 },
    ],
    lastComputedAt: "2025-12-09T10:02:00Z",
  },
  faceMatch: {
    score: 0.84,
    details: "Good match (84%)",
    lastComputedAt: "2025-12-09T10:01:00Z",
  },
  history: [
    { admin: "Alice", action: "Submitted", time: "2025-12-09 10:00" },
    { admin: "Bob", action: "Flagged (auto-rule)", time: "2025-12-09 10:05" },
  ],
};

/* ------------------------
   Small helpers & UI parts
   ------------------------ */

function RiskPill({ score }) {
  const percent = Math.round(score);
  const cls = percent >= 75 ? "bg-red-100 text-red-700" : percent >= 50 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700";
  return <span className={`px-2 py-1 rounded-full text-sm font-medium ${cls}`}>Risk: {percent}</span>;
}

function DocThumb({ doc, active, onClick }) {
  return (
    <button
      onClick={() => onClick(doc)}
      className={`w-full text-left p-2 rounded-md border flex flex-col items-start gap-1 ${active ? "ring-2 ring-blue-400" : ""}`}
      aria-label={`Select ${doc.type}`}
    >
      <div className="text-sm font-medium">{doc.type}</div>
      <div className="text-xs text-gray-500 truncate">{doc.id}</div>
    </button>
  );
}

function LowConfidenceBadge() {
  return <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs">Low confidence</span>;
}

/* primitive toast */
function Toast({ message, show }) {
  if (!show) return null;
  return (
    <div className="fixed right-4 bottom-6 z-50">
      <div className="bg-gray-900 text-white text-sm px-4 py-2 rounded shadow">{message}</div>
    </div>
  );
}

/* ------------------------
   Main component
   ------------------------ */
export default function KycReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [activeDoc, setActiveDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  // modals / UI state
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject'
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  const [showRawOCR, setShowRawOCR] = useState(false);

  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    // mock fetch
    const fetchMock = async () => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 160));
      setData({ ...mockKyc, id: id || mockKyc.id });
      setActiveDoc(mockKyc.documents[0]);
      setLoading(false);
    };
    fetchMock();
  }, [id]);

  // toast helper
  const showToast = useCallback((msg, ms = 2000) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), ms);
  }, []);

  // keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        if (showLightbox) setShowLightbox(false);
        if (showActionModal) setShowActionModal(false);
      } else if (e.key.toLowerCase() === "a") {
        // A => Approve shortcut
        setActionType("approve");
        setShowActionModal(true);
      } else if (e.key.toLowerCase() === "r") {
        setActionType("reject");
        setShowActionModal(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showLightbox, showActionModal]);

  const facePercent = useMemo(() => Math.round((data?.faceMatch?.score || 0) * 100), [data]);

  const onOpenLightbox = (url) => {
    setLightboxUrl(url);
    setShowLightbox(true);
  };

  const onDownload = (url) => {
    // create invisible link
    const a = document.createElement("a");
    a.href = url;
    a.download = url.split("/").pop().split("?")[0] || "document";
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast("Download started");
  };

  const onCopy = async (text) => {
    if (!navigator.clipboard) {
      showToast("Clipboard not supported");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard");
    } catch {
      showToast("Copy failed");
    }
  };

  const onConfirmAction = async () => {
    setSubmitting(true);
    // TODO: replace with API call (POST /api/admin/kyc/:id/approve or /reject)
    await new Promise((r) => setTimeout(r, 700));
    const performed = {
      admin: "You",
      action: actionType === "approve" ? "Approved" : "Rejected",
      time: new Date().toLocaleString(),
      reason: reason || "",
    };
    setData((d) => ({ ...d, history: [performed, ...(d.history || [])] }));
    setSubmitting(false);
    setShowActionModal(false);
    showToast(`${actionType === "approve" ? "Approved" : "Rejected"} successfully`);
  };

  if (loading || !data) {
    return <div className="p-6">Loading KYC...</div>;
  }

  /* UI helpers */
  const lowConfidenceThreshold = 0.85;

  return (
    <div className="p-6">
      <Toast message={toastMsg} show={toastVisible} />

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Review KYC — {data.id}</h1>
          <div className="text-sm text-gray-600">Submitted: {new Date(data.submittedAt).toLocaleString()}</div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/kyc" className="px-3 py-2 border rounded-md text-sm">Back to list</Link>
          <button
            onClick={() => { setActionType("reject"); setShowActionModal(true); }}
            className="px-3 py-2 border rounded-md text-sm bg-white hover:bg-gray-50"
            aria-label="Reject case"
          >
            Reject
          </button>
          <button
            onClick={() => { setActionType("approve"); setShowActionModal(true); }}
            className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm"
            aria-label="Approve case"
          >
            Approve
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: documents + OCR */}
        <div className="col-span-8">
          <div className="bg-white rounded-xl border p-4 mb-4">
            <div className="flex gap-4">
              <div className="w-28 space-y-2">
                {data.documents.map((doc) => (
                  <DocThumb key={doc.id} doc={doc} active={activeDoc?.id === doc.id} onClick={(d) => setActiveDoc(d)} />
                ))}
              </div>

              <div className="flex-1">
                <div className="border rounded-lg overflow-hidden">
                  {/* main preview */}
                  <img
                    src={activeDoc.url}
                    alt={activeDoc.type}
                    className="w-full max-h-[520px] object-contain bg-gray-50"
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  <button
                    onClick={() => onOpenLightbox(activeDoc.url)}
                    className="px-3 py-1 border rounded text-sm"
                    aria-label="Open full size"
                  >
                    Open
                  </button>

                  <button
                    onClick={() => onDownload(activeDoc.url)}
                    className="px-3 py-1 border rounded text-sm"
                    aria-label="Download file"
                  >
                    Download
                  </button>

                  <button
                    onClick={() => onCopy(activeDoc.url)}
                    className="px-3 py-1 border rounded text-sm"
                    aria-label="Copy URL"
                  >
                    Copy URL
                  </button>

                  <span className="ml-2 text-xs text-gray-500">Type: {activeDoc.type}</span>
                </div>
              </div>
            </div>
          </div>

          {/* OCR + fields */}
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">OCR</div>
              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-500">Last run: {new Date(data.ocr.lastComputedAt).toLocaleString()}</div>
                <button onClick={() => setShowRawOCR((s) => !s)} className="px-2 py-1 border rounded text-sm">
                  {showRawOCR ? "Fields view" : "Raw text"}
                </button>
              </div>
            </div>

            {showRawOCR ? (
              <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">{data.ocr.text}</pre>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  {data.ocr.fields.map((f) => {
                    const isLow = f.confidence < lowConfidenceThreshold;
                    return (
                      <div key={f.label} className="p-3 border rounded flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">{f.label}</div>
                            {isLow && <LowConfidenceBadge />}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">{f.value}</div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="text-xs text-gray-500">{Math.round(f.confidence * 100)}%</div>
                          <div className="flex gap-1">
                            <button className="px-2 py-1 text-xs border rounded" onClick={() => onCopy(f.value)}>Copy</button>
                            <button className="px-2 py-1 text-xs border rounded" onClick={() => showToast("Marked for manual review")}>Flag</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* quick OCR summary */}
                <div className="p-3 border rounded bg-gray-50">
                  <div className="text-sm font-medium mb-2">OCR Summary</div>
                  <div className="text-xs text-gray-600 mb-3">Confidence flags are shown for fields below {Math.round(lowConfidenceThreshold * 100)}%.</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <div>Fields</div>
                      <div>{data.ocr.fields.length}</div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div>Low confidence</div>
                      <div>{data.ocr.fields.filter(f => f.confidence < lowConfidenceThreshold).length}</div>
                    </div>
                    <div className="pt-3">
                      <button className="w-full px-3 py-2 border rounded text-sm" onClick={() => showToast("OCR reprocessing queued")}>Re-run OCR</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: sticky summary */}
        <div className="col-span-4">
          <div className="sticky top-24 space-y-4">
            <div className="bg-white rounded-xl border p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-gray-500">User</div>
                  <div className="font-medium">{data.user.name}</div>
                  <div className="text-xs text-gray-500">{data.user.email}</div>
                  <div className="text-xs text-gray-500">{data.user.mobile}</div>
                </div>
                <div className="flex flex-col items-end">
                  <RiskPill score={data.riskScore} />
                  <div className="text-xs text-gray-400 mt-1">score breakdown</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm text-gray-500 mb-2">Face match</div>
                <div className="flex items-center gap-3">
                  <img src={data.documents.find(d => d.type === "Selfie")?.url || data.documents[0].url} alt="selfie" className="w-16 h-16 object-cover rounded-md border" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{data.faceMatch.details}</div>
                    <div className="text-xs text-gray-500">Last: {new Date(data.faceMatch.lastComputedAt).toLocaleString()}</div>

                    {/* progress bar */}
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden" aria-hidden>
                      <div
                        className={`h-2 ${data.faceMatch.score >= 0.75 ? "bg-green-500" : data.faceMatch.score >= 0.5 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${Math.round(data.faceMatch.score * 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{Math.round(data.faceMatch.score * 100)}%</div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm text-gray-500 mb-2">Actions</div>
                <div className="flex gap-2">
                  <button onClick={() => { setActionType("approve"); setShowActionModal(true); }} className="flex-1 px-3 py-2 rounded-md border text-sm bg-green-50">Approve</button>
                  <button onClick={() => { setActionType("reject"); setShowActionModal(true); }} className="flex-1 px-3 py-2 rounded-md border text-sm bg-red-50">Reject</button>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Tip: Press <span className="px-1 bg-gray-100 rounded">A</span> to open Approve, <span className="px-1 bg-gray-100 rounded">R</span> for Reject, <span className="px-1 bg-gray-100 rounded">Esc</span> to close modal.
              </div>
            </div>

            <div className="bg-white rounded-xl border p-4 shadow-sm">
              <div className="font-semibold mb-2">Risk breakdown</div>
              <div className="space-y-2 text-sm">
                {Object.entries(data.riskBreakdown).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <div className="capitalize">{k.replace(/([A-Z])/g, " $1")}</div>
                    <div>{v}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border p-4 shadow-sm">
              <div className="font-semibold mb-2">History</div>
              <div className="space-y-2 text-sm text-gray-700">
                {data.history.map((h, i) => (
                  <div key={i} className="p-2 border rounded flex items-center justify-between">
                    <div>
                      <div className="font-medium">{h.admin} <span className="text-xs text-gray-500">• {h.action}</span></div>
                      <div className="text-xs text-gray-500">{h.time}</div>
                    </div>
                    <div className="text-xs">
                      {/* small label for action */}
                      <span className={`px-2 py-0.5 rounded text-xs ${h.action.toLowerCase().includes("approve") ? "bg-green-50 text-green-700" : h.action.toLowerCase().includes("reject") ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                        {h.action}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border p-4 shadow-sm">
              <div className="font-semibold mb-2">Quick Links</div>
              <div className="space-y-2">
                <Link to="/admin/kyc" className="block px-3 py-2 border rounded text-sm">All KYC Cases</Link>
                <Link to="/admin/aml" className="block px-3 py-2 border rounded text-sm">AML Alerts</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox for image viewing */}
      {showLightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowLightbox(false)} />
          <div className="relative z-60 max-w-[95vw] max-h-[95vh]">
            <img src={lightboxUrl} alt="document-large" className="max-w-full max-h-[95vh] object-contain rounded" />
            <div className="absolute top-4 right-4 flex gap-2">
              <button className="px-3 py-1 bg-white/80 rounded" onClick={() => onDownload(lightboxUrl)}>Download</button>
              <button className="px-3 py-1 bg-white/80 rounded" onClick={() => setShowLightbox(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Approve/Reject Modal */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-30" onClick={() => setShowActionModal(false)} />
          <div className="bg-white rounded-lg p-6 z-60 w-[520px] max-w-full">
            <h2 className="text-lg font-semibold mb-2">{actionType === "approve" ? "Approve KYC" : "Reject KYC"}</h2>
            <p className="text-sm text-gray-600 mb-4">You are about to {actionType}. Optionally add a reason (visible in audit log).</p>

            {actionType === "reject" && (
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border rounded p-2 mb-3" rows={4} placeholder="Reason for rejection (required)"></textarea>
            )}

            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setShowActionModal(false)} className="px-3 py-2 border rounded">Cancel</button>
              <button
                onClick={onConfirmAction}
                className="px-4 py-2 rounded bg-blue-600 text-white"
                disabled={submitting || (actionType === "reject" && reason.trim().length < 3)}
              >
                {submitting ? "Saving..." : actionType === "approve" ? "Confirm Approve" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
