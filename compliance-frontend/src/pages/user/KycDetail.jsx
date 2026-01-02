import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/* ==========================================================
   KYC DETAIL PAGE
========================================================== */
export default function KycDetail() {
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [images, setImages] = useState(null);
  const [viewerSrc, setViewerSrc] = useState(null);

  useEffect(() => {
    const backendResult = location.state?.kycResult;
    const uploadedImages = location.state?.images;

    if (!backendResult || !uploadedImages) {
      setLoading(false);
      return;
    }

    setResult(backendResult);
    setImages(uploadedImages);
    setLoading(false);
  }, [location.state]);

  if (loading) return <div className="p-6">Loading KYC…</div>;
  if (!result) return <div className="p-6">No KYC data found</div>;

  const statusColor =
    result.final_status === "VERIFIED"
      ? "text-green-600"
      : result.final_status === "REVIEW_REQUIRED"
      ? "text-amber-600"
      : "text-red-600";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ==================================================
            HEADER: NAME / ADDRESS / STATUS
        ================================================== */}
        <section className="bg-white p-6 rounded shadow space-y-2">
          <h1 className="text-2xl font-bold">
            {result.aadhaar?.name || "—"}
          </h1>

          <p className="text-sm text-gray-600">
            <strong>Address:</strong>{" "}
            {result.aadhaar?.address || "—"}
          </p>

          <p className={`text-sm font-semibold ${statusColor}`}>
            Status: {result.final_status}
          </p>

          {/* -------- REVIEW CAUSES -------- */}
          {result.final_status === "REVIEW_REQUIRED" &&
            Array.isArray(result.review_reasons) && (
              <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3">
                <div className="font-medium text-amber-800 mb-1">
                  Review Required – Reason(s)
                </div>
                <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                  {result.review_reasons.map((reason) => (
                    <li key={reason}>{humanizeReason(reason)}</li>
                  ))}
                </ul>
              </div>
            )}
        </section>

        {/* ==================================================
            UPLOADED DOCUMENTS
        ================================================== */}
        <section className="bg-white p-6 rounded shadow">
          <h2 className="font-semibold mb-4">Uploaded Documents</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DocThumb title="ID Proof" src={images.front} onView={setViewerSrc} />
            <DocThumb title="Address Proof" src={images.address} onView={setViewerSrc} />
            <DocThumb title="Selfie" src={images.selfie} onView={setViewerSrc} />
            {images.video && (
              <DocThumb title="Video KYC" src={images.video} onView={setViewerSrc} />
            )}
          </div>
        </section>

      </div>

      {/* ==================================================
          IMAGE / VIDEO VIEWER
      ================================================== */}
      {viewerSrc && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setViewerSrc(null)}
        >
          {viewerSrc.endsWith(".mp4") || viewerSrc.endsWith(".webm") ? (
            <video src={viewerSrc} controls className="max-h-[90vh]" />
          ) : (
            <img src={viewerSrc} alt="preview" className="max-h-[90vh]" />
          )}
        </div>
      )}
    </div>
  );
}

/* ==========================================================
   HELPERS
========================================================== */

function humanizeReason(reason) {
  const map = {
    ADDRESS_MISMATCH: "Address does not match Aadhaar records",
    SELFIE_MISMATCH: "Selfie does not match Aadhaar photo",
    VIDEO_IDENTITY_MISMATCH: "Video identity verification failed",
  };
  return map[reason] || reason;
}

/* ==========================================================
   DOCUMENT THUMB
========================================================== */
function DocThumb({ title, src, onView }) {
  return (
    <div
      className="border rounded cursor-pointer hover:shadow"
      onClick={() => src && onView(src)}
    >
      <div className="text-sm p-2 bg-gray-100 font-medium">{title}</div>
      <div className="h-40 flex items-center justify-center bg-white">
        {src ? (
          src.endsWith(".mp4") || src.endsWith(".webm") ? (
            <video src={src} className="max-h-full" />
          ) : (
            <img src={src} alt={title} className="max-h-full" />
          )
        ) : (
          <span className="text-gray-400">No file</span>
        )}
      </div>
    </div>
  );
}
