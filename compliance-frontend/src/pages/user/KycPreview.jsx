import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function KycPreview() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  // support either state.images or state.draft.documents
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

  // Guard: if user opens directly
  if (!images) {
    navigate("/user/kyc/new");
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Preview Uploaded Documents</h1>
          <p className="text-sm text-slate-500 mt-1">Verify everything looks correct before submitting.</p>
        </div>

        <div className="text-right text-sm text-slate-600">
          {createdAt ? (
            <div>Saved: {new Date(createdAt).toLocaleString()}</div>
          ) : (
            <div>Preview (client-side)</div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <PreviewCard title="ID Proof" src={images.front} />
        <PreviewCard title="Address Proof" src={images.address} />
        <PreviewCard title="Selfie" src={images.selfie} />

        {images.video && <PreviewVideo src={images.video} />}
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 border rounded bg-white hover:bg-slate-50"
        >
          Edit
        </button>

        <button
          onClick={() => navigate("/user/dashboard")}
          className="px-4 py-2 bg-emerald-600 text-white rounded shadow"
        >
          Confirm & Submit
        </button>
      </div>
    </div>
  );
}

function PreviewCard({ title, src }) {
  if (!src) return null;

  return (
    <div className="mb-2 rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="font-medium">{title}</div>
        <div className="text-xs text-slate-500">Click image to open full size</div>
      </div>

      <div className="rounded overflow-hidden border">
        <a href={src} target="_blank" rel="noreferrer noopener">
          <img src={src} alt={title} className="w-full h-56 object-contain bg-slate-50" />
        </a>
      </div>
    </div>
  );
}

function PreviewVideo({ src }) {
  if (!src) return null;
  return (
    <div className="mb-2 rounded-lg border bg-white p-4 shadow-sm">
      <div className="font-medium mb-3">Video KYC</div>
      <div className="rounded overflow-hidden border">
        <video src={src} controls className="w-full h-56 bg-black" />
      </div>
    </div>
  );
}
