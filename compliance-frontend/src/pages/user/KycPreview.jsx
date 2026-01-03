import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function KycPreview() {
  const location = useLocation();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);

  const state = location.state || {};

  const images =
    state.images ||
    (state.draft && state.draft.documents
      ? {
          front: state.draft.documents.frontUrl,
          address: state.draft.documents.addressProofUrl,
          selfie: state.draft.documents.selfieUrl,
          video: state.draft.documents.videoUrl || null,
        }
      : null);

  const createdAt = state.draft?.meta?.createdAt;

  if (!images) {
    navigate("/user/kyc/new");
    return null;
  }

  const toBlob = async (url) => {
    const res = await fetch(url);
    return await res.blob();
  };

  const handleSubmitToBackend = async () => {
    if (!images.front || !images.address || !images.selfie) {
      alert("Missing required documents");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("id_front", await toBlob(images.front));
      formData.append("address_proof", await toBlob(images.address));
      formData.append("selfie", await toBlob(images.selfie));

      if (images.video) {
        formData.append("video", await toBlob(images.video));
      }

      const res = await fetch("http://127.0.0.1:8000/kyc/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      const data = await res.json();

      alert("KYC submitted successfully");

      navigate("/user/kyc/detail", {
        state: {
          kycResult: data,
          images,
        },
      });
    } catch (err) {
      console.error(err);
      alert("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {submitting && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40" />
      )}

      <div className="max-w-4xl mx-auto px-4 py-10 animate-fade-in relative z-50">
        {/* HEADER */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              Preview Uploaded Documents
            </h1>
            <div className="h-1 w-20 mt-3 rounded-full bg-gradient-to-r from-blue-500 to-green-500" />
            <p className="text-sm text-slate-500 mt-4">
              Verify everything looks correct before submitting.
            </p>
          </div>

          <div className="text-right text-sm text-slate-600">
            {createdAt ? (
              <div>Saved: {new Date(createdAt).toLocaleString()}</div>
            ) : (
              <div>Preview (client-side)</div>
            )}
          </div>
        </div>

        {/* PREVIEWS */}
        <div className="space-y-6">
          <PreviewCard title="ID Proof" src={images.front} />
          <PreviewCard title="Address Proof" src={images.address} />
          <PreviewCard title="Selfie" src={images.selfie} />
          {images.video && <PreviewVideo src={images.video} />}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-4 mt-10">
          <button
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="
              px-5 py-2 rounded-lg font-medium text-white
              bg-gradient-to-r from-blue-500 to-indigo-600
              shadow-md
              transition-all duration-200
              hover:shadow-lg hover:-translate-y-0.5
              active:scale-95
              disabled:opacity-50
            "
          >
            Edit
          </button>

          <button
            onClick={handleSubmitToBackend}
            disabled={submitting}
            className={`
              px-6 py-2 rounded-lg font-semibold text-white
              shadow-md flex items-center gap-2
              transition-all duration-200
              ${
                submitting
                  ? "bg-gradient-to-r from-gray-300 to-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-emerald-600 hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
              }
            `}
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Submitting...
              </>
            ) : (
              "Confirm & Submit"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewCard({ title, src }) {
  if (!src) return null;

  return (
    <div
      className="
        group rounded-xl border bg-white p-4 shadow-sm
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-lg
      "
    >
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-slate-700">{title}</div>
        <span className="text-xs text-slate-400 group-hover:text-slate-600 transition">
          Click to enlarge
        </span>
      </div>

      <a href={src} target="_blank" rel="noreferrer noopener">
        <div className="overflow-hidden rounded-lg border bg-slate-50">
          <img
            src={src}
            alt={title}
            className="
              w-full h-56 object-contain
              transition-transform duration-300
              group-hover:scale-105
            "
          />
        </div>
      </a>
    </div>
  );
}

function PreviewVideo({ src }) {
  if (!src) return null;

  return (
    <div
      className="
        rounded-xl border bg-white p-4 shadow-sm
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-lg
      "
    >
      <div className="font-semibold text-slate-700 mb-3">
        Video KYC
      </div>

      <div className="overflow-hidden rounded-lg border bg-black">
        <video
          src={src}
          controls
          className="w-full h-56 object-contain"
        />
      </div>
    </div>
  );
}