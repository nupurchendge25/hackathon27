import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 animate-pulse">
        Loading verification…
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 animate-fade-in">
        No KYC data found
      </div>
    );
  }

  const statusUI = {
    VERIFIED: {
      label: "Verified",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      ring: "ring-emerald-300",
      animation: "animate-float animate-glow-green",
    },
    REVIEW_REQUIRED: {
      label: "Review Required",
      bg: "bg-amber-50",
      text: "text-amber-700",
      ring: "ring-amber-300",
      animation: "animate-float animate-pulse",
    },
    REJECTED: {
      label: "Rejected",
      bg: "bg-red-50",
      text: "text-red-700",
      ring: "ring-red-300",
      animation: "animate-shake animate-glow-red",
    },
  };

  const status = statusUI[result.final_status] || statusUI.REJECTED;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-10 animate-fade-in">
        {/* ================= USER SUMMARY ================= */}
        <section className="bg-white rounded-2xl shadow-lg p-8 transition-transform hover:scale-105 duration-300">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">
                {result.aadhaar?.name || "—"}
              </h1>

              {/* ✅ Aadhaar number (masked, optional) */}
              {result.aadhaar?.number && (
                <p className="text-sm text-slate-600 mt-1">
                  Aadhaar:{" "}
                  <span className="font-medium">
                    {result.aadhaar.number}
                  </span>
                </p>
              )}

              <p className="text-slate-500 mt-2 max-w-xl">
                {result.aadhaar?.address || "—"}
              </p>
            </div>

            <div
              className={`
                relative px-6 py-2 rounded-full text-sm font-semibold
                border ring-2 ring-offset-2
                shadow-md cursor-default
                transition-all duration-300
                hover:scale-110 hover:-translate-y-1
                ${status.bg} ${status.text} ${status.ring}
                ${status.animation}
              `}
            >
              {status.label}

              <span
                className={`
                  absolute -top-1 -right-1 h-3 w-3 rounded-full
                  ${
                    result.final_status === "VERIFIED"
                      ? "bg-emerald-500"
                      : result.final_status === "REJECTED"
                      ? "bg-red-500"
                      : "bg-amber-500"
                  }
                  animate-ping
                `}
              />
            </div>
          </div>

          {result.final_status === "REVIEW_REQUIRED" &&
            Array.isArray(result.review_reasons) && (
              <div className="mt-6 bg-amber-50 rounded-xl p-4">
                <div className="font-medium text-amber-800 mb-2">
                  Reason for review
                </div>
                <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                  {result.review_reasons.map((r) => (
                    <li key={r}>{humanizeReason(r)}</li>
                  ))}
                </ul>
              </div>
            )}
        </section>

        {/* ================= DOCUMENTS ================= */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-800">
            Submitted Documents
          </h2>

          <DocumentRow
            title="Aadhaar / ID Proof"
            description="Government issued identity document"
            src={images.front}
            onView={setViewerSrc}
          />

          <DocumentRow
            title="Address Proof"
            description="Residential address verification"
            src={images.address}
            onView={setViewerSrc}
          />

          <DocumentRow
            title="Selfie Verification"
            description="Live facial verification"
            src={images.selfie}
            onView={setViewerSrc}
          />

          {images.video && (
            <DocumentRow
              title="Video KYC"
              description="Liveness & identity confirmation"
              src={images.video}
              onView={setViewerSrc}
            />
          )}
        </section>
      </div>

      {/* ================= IMAGE / VIDEO VIEWER ================= */}
      {viewerSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center backdrop-blur-sm animate-fade-in"
          onClick={() => setViewerSrc(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-4 max-h-[90vh] animate-zoom-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full shadow-md hover:bg-red-600 transition"
              onClick={() => setViewerSrc(null)}
            >
              Close
            </button>

            <div className="overflow-y-auto max-h-[80vh]">
              {viewerSrc.endsWith(".mp4") || viewerSrc.endsWith(".webm") ? (
                <video
                  src={viewerSrc}
                  controls
                  autoPlay
                  className="max-h-[80vh] rounded-xl"
                />
              ) : (
                <img
                  src={viewerSrc}
                  alt="preview"
                  className="max-h-[80vh] rounded-xl"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= HELPERS ================= */

function humanizeReason(reason) {
  const map = {
    ADDRESS_MISMATCH: "Address does not match Aadhaar records",
    SELFIE_MISMATCH: "Selfie does not match ID photo",
    VIDEO_IDENTITY_MISMATCH: "Video identity verification failed",
  };
  return map[reason] || reason;
}

/* ================= DOCUMENT CARD ================= */

function DocumentRow({ title, description, src, onView }) {
  const isVideo = src?.endsWith(".mp4") || src?.endsWith(".webm");

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col md:flex-row gap-6">
      <div
        onClick={() => src && onView(src)}
        className="relative cursor-pointer w-full md:w-56 h-40 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center"
      >
        {src ? (
          isVideo ? (
            <video src={src} muted className="h-full object-cover" />
          ) : (
            <img src={src} alt={title} className="h-full object-cover" />
          )
        ) : (
          <span className="text-slate-400 text-sm">No file uploaded</span>
        )}

        {src && (
          <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition flex items-center justify-center">
            <span className="bg-white px-4 py-2 rounded-full text-sm font-medium shadow">
              View
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <h3 className="text-lg font-semibold text-slate-900">
          {title}
        </h3>
        <p className="text-slate-500 text-sm mt-1">
          {description}
        </p>

        <div className="mt-4 flex items-center gap-3 text-sm">
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600">
            Submitted
          </span>
        </div>
      </div>
    </div>
  );
}
