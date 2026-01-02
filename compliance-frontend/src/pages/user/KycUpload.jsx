import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";


// KycUpload.jsx
export default function KycUpload() {
  const [frontId, setFrontId] = useState(null);
  const [addressProof, setAddressProof] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const fileInputRefs = useRef({});
  const navigate = useNavigate();
  const [videoKyc, setVideoKyc] = useState(null);
  const location = useLocation();

  const { kycResult, images } = location.state || {};



  // helper: read file to dataURL for preview
  const toDataURL = (file) => {
    return new Promise((resolve) => {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e, setter, type = "file") => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  if (type !== "video" &&
  !["image/jpeg", "image/png", "image/webp"].includes(f.type)
) {
  alert("Only JPG, PNG, or WEBP images are allowed");
  e.target.value = null;
  return;
}

  const maxSize =
    type === "video" ? 20 * 1024 * 1024 : 5 * 1024 * 1024;

  if (f.size > maxSize) {
    alert(
      type === "video"
        ? "Video too large. Maximum 20MB allowed."
        : "File too large. Maximum 5MB allowed."
    );
    e.target.value = null;
    return;
  }

  if (type === "video") {
    const url = URL.createObjectURL(f);
    setter({ file: f, preview: url });
    return;
  }

  const url = await toDataURL(f);
  setter({ file: f, preview: url });
};

  const clearFile = (setter, key) => {
    setter(null);
    if (key && fileInputRefs.current[key]) fileInputRefs.current[key].value = null;
  };

  // keyboard accessibility: pressing Enter on the Choose File button triggers input
  const triggerInput = (key) => {
    if (fileInputRefs.current[key]) fileInputRefs.current[key].click();
  };

  useEffect(() => {
    return () => {};
  }, []);

  // ------------------ Continue to Preview (client-side preview) ------------------
  const handleContinue = async () => {
    try {
      console.log("[KycUpload] handleContinue called");

      if (!frontId || !addressProof || !selfie) {
        alert("Please upload all required documents: PAN/Aadhar Photo, Address Proof, and Selfie.");
        return;
      }

      const draft = {
        userName: "", // fill if you collect name
        documents: {
          frontUrl: frontId.preview,
          addressProofUrl: addressProof.preview,
          selfieUrl: selfie.preview,
        },
        meta: { createdAt: new Date().toISOString() },
        status: "Draft",
      };

      // navigate to the client-side preview route we added in App.jsx
      navigate("/user/kyc/preview", {
  state: {
    images: {
      front: frontId.preview,
      address: addressProof.preview,
      selfie: selfie.preview,
      video: videoKyc?.preview || null,
    },
  },
});


      setTimeout(() => {
        console.log("[KycUpload] current path after navigate:", window.location.pathname);
      }, 200);
    } catch (err) {
      console.error("[KycUpload] handleContinue error", err);
      alert("Something went wrong when opening preview. Check console for details.");
    }
  };
  const handleSubmitToBackend = async () => {
  if (!frontId || !addressProof || !selfie) {
    alert("Please upload all required documents");
    return;
  }

  const formData = new FormData();

  formData.append("id_front", frontId.file);
formData.append("selfie", selfie.file);

if (addressProof?.file) {
  formData.append("address_proof", addressProof.file);
}

if (videoKyc?.file) {
  formData.append("video", videoKyc.file);
}


  try {
    const res = await fetch("http://127.0.0.1:8000/kyc/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
  const errText = await res.text();
  console.error("Backend error:", errText);
  throw new Error(errText);
}

    const data = await res.json();
    console.log("Backend response:", data);

    alert("KYC submitted successfully");

// navigate to KYC detail page with backend result
navigate("/user/kyc/detail", {
  state: {
    kycResult: data,
    images: {
      front: frontId.preview,
      address: addressProof.preview,
      selfie: selfie.preview,
      video: videoKyc?.preview || null
    }
  }
});



  } catch (err) {
    console.error(err);
    alert(
  err.message.includes("{")
    ? JSON.parse(err.message).error || "Submission failed"
    : err.message
);

  }
};

  // -------------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold text-slate-800">Upload Your KYC Documents</h1>
          <p className="mt-1 text-slate-500">Please provide the required documents to complete verification.</p>
        </header>

        <div className="grid grid-cols-12 gap-6">
          {/* LEFT: scrollable main column */}
          <main className="col-span-12 lg:col-span-8">
            <div className="h-[calc(100vh-6rem)] overflow-auto pr-4">{/* <-- scrollable area */}

              <section className="rounded-xl shadow-sm p-6 mb-6 border-l-4 border-sky-500 bg-white/95 backdrop-blur-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-medium text-slate-800">PAN/Aadhar Photo</h2>
                    <p className="text-sm text-slate-500 mt-1">Upload a clear photo of your PAN or Aadhar card</p>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full">Required</span>
                </div>

                <div className="mt-6">
                  <label
                    htmlFor="front"
                    className="relative block rounded-lg border-2 border-dashed border-slate-200 bg-gradient-to-tr from-slate-50 to-sky-50 p-8 text-center cursor-pointer hover:border-sky-300"
                    onKeyDown={(e) => { if (e.key === 'Enter') triggerInput('front'); }}
                    tabIndex={0}
                  >
                    {frontId && frontId.preview ? (
                      <div className="flex flex-col items-center gap-3">
                        <img src={frontId.preview} alt="front preview" className="max-h-40 object-contain rounded-md shadow-sm border" />
                        <div className="flex gap-2">
                          <button type="button" onClick={() => triggerInput('front')} className="px-3 py-1 rounded-md border text-sm bg-white hover:bg-sky-50">Replace</button>
                          <button type="button" onClick={() => clearFile(setFrontId, 'front')} className="px-3 py-1 rounded-md border text-sm bg-white hover:bg-red-50 text-red-700">Remove</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                        </svg>
                        <div className="text-sm font-medium text-slate-700">Drag and drop your file here</div>
                        <div className="text-xs mt-1 text-slate-400">or click to browse (JPG, PNG, PDF — Max 5MB)</div>
                        <div className="mt-4">
                          <button type="button" onClick={() => triggerInput('front')} className="px-4 py-2 rounded-md bg-gradient-to-r from-sky-500 to-teal-400 text-white shadow">Choose File</button>
                        </div>
                      </div>
                    )}

                    <input
                      id="front"
                      ref={(el) => (fileInputRefs.current.front = el)}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"

                      className="hidden"
                      onChange={(e) => handleFileChange(e, setFrontId)}
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-xl shadow-sm p-6 mb-6 border-l-4 border-yellow-400 bg-white/95 backdrop-blur-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-medium text-slate-800">Address Proof</h2>
                    <p className="text-sm text-slate-500 mt-1">Upload any recent document proving your address (electricity bill, bank statement, rental agreement)</p>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full">Required</span>
                </div>

                <div className="mt-6">
                  <label className="relative block rounded-lg border-2 border-dashed border-slate-200 bg-gradient-to-tr from-slate-50 to-yellow-50 p-8 text-center cursor-pointer hover:border-yellow-300" onKeyDown={(e) => { if (e.key === 'Enter') triggerInput('address'); }} tabIndex={0}>
                    {addressProof && addressProof.preview ? (
                      <div className="flex flex-col items-center gap-3">
                        <img src={addressProof.preview} alt="address preview" className="max-h-40 object-contain rounded-md shadow-sm border" />
                        <div className="flex gap-2">
                          <button type="button" onClick={() => triggerInput('address')} className="px-3 py-1 rounded-md border text-sm bg-white hover:bg-yellow-50">Replace</button>
                          <button type="button" onClick={() => clearFile(setAddressProof, 'address')} className="px-3 py-1 rounded-md border text-sm bg-white hover:bg-red-50 text-red-700">Remove</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                        </svg>
                        <div className="text-sm font-medium text-slate-700">Drag and drop your file here</div>
                        <div className="text-xs mt-1 text-slate-400">or click to browse (JPG, PNG, PDF — Max 5MB)</div>
                        <div className="mt-4">
                          <button type="button" onClick={() => triggerInput('address')} className="px-4 py-2 rounded-md bg-white border shadow-sm">Choose File</button>
                        </div>
                      </div>
                    )}

                    <input
                      id="address"
                      ref={(el) => (fileInputRefs.current.address = el)}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"

                      className="hidden"
                      onChange={(e) => handleFileChange(e, setAddressProof)}
                    />
                  </label>

                  <div className="mt-4 bg-slate-50 p-3 rounded-md border border-slate-100">
                    <div className="text-sm text-slate-600">Accepted examples:</div>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <span className="text-xs bg-white px-3 py-1 rounded-md border text-slate-700">Electricity Bill</span>
                      <span className="text-xs bg-white px-3 py-1 rounded-md border text-slate-700">Bank Statement</span>
                      <span className="text-xs bg-white px-3 py-1 rounded-md border text-slate-700">Rental Agreement</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-xl shadow-sm p-6 mb-6 border-l-4 border-sky-600 bg-white/95 backdrop-blur-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-medium text-slate-800">Selfie Photo</h2>
                    <p className="text-sm text-slate-500 mt-1">Take a recent selfie or upload one from your device</p>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full">Required</span>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block rounded-lg border-2 border-dashed border-slate-200 bg-gradient-to-tr from-slate-50 to-sky-50 p-6 text-center cursor-pointer hover:border-sky-300" onKeyDown={(e) => { if (e.key === 'Enter') triggerInput('selfie'); }} tabIndex={0}>
                    {selfie && selfie.preview ? (
                      <img src={selfie.preview} alt="selfie" className="mx-auto max-h-36 object-contain rounded-md border" />
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 mx-auto text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                        <div className="text-sm text-slate-500">Upload Selfie</div>
                        <div className="text-xs text-slate-400 mt-1">Click or drag file</div>
                      </>
                    )}
                    <input id="selfie" ref={(el) => (fileInputRefs.current.selfie = el)} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, setSelfie)} />
                  </label>

                  <div className="rounded-lg border p-4 bg-slate-50">
                    <div className="text-sm font-medium mb-2 text-slate-700">Selfie Guidelines</div>
                    <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                      <li>Face clearly visible</li>
                      <li>Well-lit face</li>
                      <li>Looking at camera</li>
                      <li>No sunglasses/hats</li>
                    </ul>
                  </div>
                </div>
              </section>
              <section className="rounded-xl shadow-sm p-6 mb-6 border-l-4 border-purple-500 bg-white/95 backdrop-blur-sm">
  <div className="flex items-start justify-between">
    <div>
      <h2 className="text-xl font-medium text-slate-800">
        Video KYC (Optional)
      </h2>
      <p className="text-sm text-slate-500 mt-1">
        Upload a short video for enhanced verification
      </p>
    </div>
    <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
      Optional
    </span>
  </div>

  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
    <label
      className="block rounded-lg border-2 border-dashed border-slate-200 bg-gradient-to-tr from-slate-50 to-purple-50 p-6 text-center cursor-pointer hover:border-purple-300"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") triggerInput("video"); }}
    >
      {videoKyc ? (
        <div className="space-y-3">
          <video
            src={videoKyc.preview}
            controls
            className="mx-auto max-h-40 rounded-md border"
          />
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => triggerInput("video")}
              className="px-3 py-1 rounded-md border text-sm bg-white"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => clearFile(setVideoKyc, "video")}
              className="px-3 py-1 rounded-md border text-sm bg-white text-red-600"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-sm font-medium text-slate-700">
            Upload short verification video
          </div>
          <div className="text-xs text-slate-400 mt-1">
            MP4 / WebM · 5–10 seconds · Max 20MB
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => triggerInput("video")}
              className="px-4 py-2 rounded-md bg-white border shadow-sm"
            >
              Choose Video
            </button>
          </div>
        </>
      )}

      <input
        ref={(el) => (fileInputRefs.current.video = el)}
        type="file"
        accept="video/mp4,video/webm"
        className="hidden"
        onChange={(e) =>
          handleFileChange(e, setVideoKyc, "video")
        }
      />
    </label>

    <div className="rounded-lg border p-4 bg-slate-50">
      <div className="text-sm font-medium mb-2 text-slate-700">
        Video Guidelines
      </div>
      <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
        <li>Look straight at camera</li>
        <li>Blink or turn head slightly</li>
        <li>Good lighting</li>
        <li>No filters or masks</li>
      </ul>
    </div>
  </div>
</section>


              <div className="flex items-center justify-end gap-3 mt-4 mb-8">
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!frontId || !addressProof || !selfie}
                  className={`px-4 py-2 rounded-md text-white shadow ${
                    !frontId || !addressProof || !selfie
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-sky-600 to-teal-500"
                  }`}
                >
                  Continue to Preview
                </button>

                <button
                  type="button"
                  onClick={handleSubmitToBackend}
                  disabled={!frontId || !addressProof || !selfie}
                  className={`px-4 py-2 rounded-md text-white shadow ${
                    !frontId || !addressProof || !selfie
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-600 to-green-500"
                  }`}
                >
                  Submit KYC
                </button>
              </div>

            </div> {/* end scrollable */}
</main>

          {/* RIGHT: sticky non-scrollable sidebar */}
          <aside className="hidden lg:block col-span-12 lg:col-span-4">
            <div className="sticky top-6 space-y-6">
              <div className="rounded-xl shadow-sm p-6 border border-slate-100 bg-gradient-to-tr from-white to-sky-50">
                <h3 className="font-medium text-lg text-slate-800 mb-3">Tips for Better Photos</h3>
                <div className="text-sm text-slate-600 space-y-4">
                  <div>
                    <div className="font-medium text-slate-700">Lighting</div>
                    <div className="mt-1">Use natural daylight or a well-lit environment. Avoid shadows on your face or documents.</div>
                  </div>

                  <div>
                    <div className="font-medium text-slate-700">Document Clarity</div>
                    <div className="mt-1">Ensure all text is readable. Keep documents flat and fully visible within the frame.</div>
                  </div>

                  <div>
                    <div className="font-medium text-slate-700">Background</div>
                    <div className="mt-1">Use a plain, neutral background. Avoid busy patterns that distract from the document.</div>
                  </div>

                  <div>
                    <div className="font-medium text-slate-700">File Format</div>
                    <div className="mt-1 text-slate-500">JPG, PNG, or PDF formats. Maximum file size is 5MB per document.</div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl shadow-sm p-6 border border-slate-100 bg-gradient-to-tr from-white to-emerald-50">
                <h4 className="font-medium text-lg text-slate-800 mb-3">Document Examples</h4>
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="p-3 bg-white/80 rounded-md border flex items-start gap-3">
                    <div className="text-2xl">💡</div>
                    <div>
                      <div className="font-medium">Electricity Bill</div>
                      <div className="text-xs text-slate-500">Recent utility bill with your name and address</div>
                    </div>
                  </div>

                  <div className="p-3 bg-white/80 rounded-md border flex items-start gap-3">
                    <div className="text-2xl">🏦</div>
                    <div>
                      <div className="font-medium">Bank Statement</div>
                      <div className="text-xs text-slate-500">Recent bank statement showing your address</div>
                    </div>
                  </div>

                  <div className="p-3 bg-white/80 rounded-md border flex items-start gap-3">
                    <div className="text-2xl">🏠</div>
                    <div>
                      <div className="font-medium">Rental Agreement</div>
                      <div className="text-xs text-slate-500">Valid lease or rental agreement document</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}