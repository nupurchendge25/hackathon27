# ==========================================================
#                    FastAPI KYC Server
# ==========================================================
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.concurrency import run_in_threadpool
from typing import Optional
import os, uuid, shutil, traceback

from kyc import run_full_kyc

# ==========================================================
#                    APP INIT
# ==========================================================
app = FastAPI(title="KYC Verification API")

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # DEV only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================
#                    STORAGE
# ==========================================================
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm"}


def save_file(file: UploadFile, allowed_types: set) -> str:
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}"
        )

    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    path = os.path.join(UPLOAD_DIR, filename)

    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return path


# ==========================================================
#                    API ENDPOINT
# ==========================================================
@app.post("/kyc/upload")
async def upload_kyc(
    id_front: UploadFile = File(...),
    selfie: UploadFile = File(...),
    address_proof: UploadFile = File(...),
    video: Optional[UploadFile] = File(None),
):
    try:
        # ---------------- Save files ----------------
        front_path = save_file(id_front, ALLOWED_IMAGE_TYPES)
        selfie_path = save_file(selfie, ALLOWED_IMAGE_TYPES)
        address_path = save_file(address_proof, ALLOWED_IMAGE_TYPES)
        video_path = save_file(video, ALLOWED_VIDEO_TYPES) if video else None

        # ---------------- Run ML pipeline ----------------
        try:
            result = await run_in_threadpool(
                run_full_kyc,
                front_path,
                address_path,
                selfie_path,
                video_path
            )
        except Exception as ml_err:
            traceback.print_exc()
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": str(ml_err),
                    "hint": "OCR / Face / ffmpeg dependency issue"
                }
            )

        # ==================================================
        #           REVIEW CAUSE ANALYSIS
        # ==================================================
        review_reasons = []

        address_verification = result.get("address_verification")
        selfie_verification = result.get("selfie_verification")
        video_verification = result.get("video_verification")

        if address_verification and address_verification.get("status") != "VERIFIED":
            review_reasons.append("ADDRESS_MISMATCH")

        if selfie_verification and selfie_verification.get("status") != "VERIFIED":
            review_reasons.append("SELFIE_MISMATCH")

        if video_verification and video_verification.get("status") != "VERIFIED":
            review_reasons.append("VIDEO_IDENTITY_MISMATCH")

        # ==================================================
        #           CLEAN RESPONSE FOR FRONTEND
        # ==================================================
        document = result.get("document_data", {})

        response = {
            "success": True,
            "final_status": result.get("final_status"),

            "aadhaar": {
                "name": document.get("name"),
                "address": document.get("address_raw")
            },

            "address_verification": address_verification,
            "selfie_verification": selfie_verification,
            "video_verification": video_verification,

            # 👇 MAIN ADDITION
            "review_reasons": review_reasons if review_reasons else None
        }

        return response

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )
