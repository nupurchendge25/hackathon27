# ==========================================================
#                    IMPORTS
# ==========================================================
from dotenv import load_dotenv
load_dotenv()

import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import cv2
import pytesseract
from pyzbar.pyzbar import decode
from PIL import Image
import xml.etree.ElementTree as ET
import re
import subprocess
from difflib import SequenceMatcher
from deepface import DeepFace
from openai import OpenAI

client = OpenAI()

# ==========================================================
#               TESSERACT CONFIG
# ==========================================================
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# ==========================================================
#               NORMALIZATION
# ==========================================================
ABBREVIATIONS = {
    "rd": "road",
    "st": "street",
    "ngr": "nagar",
    "apt": "apartment",
    "fl": "floor",
    "hno": "house",
    "no": "number"
}

def normalize_address(text: str) -> str:
    text = text.lower()
    for k, v in ABBREVIATIONS.items():
        text = re.sub(rf"\b{k}\b", v, text)
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()

# ==========================================================
#               AADHAAR NUMBER EXTRACTION
# ==========================================================
def extract_aadhaar_number(text: str):
    """
    Extract Aadhaar number from OCR text.
    Supports:
    XXXX XXXX XXXX
    XXXX-XXXX-XXXX
    XXXXXXXXXXXX
    """
    cleaned = text.replace(" ", "").replace("-", "")
    match = re.search(r"\b\d{12}\b", cleaned)
    return match.group(0) if match else None

# ==========================================================
#                   QR HELPERS
# ==========================================================
def read_qr(image_path):
    img = Image.open(image_path)
    result = decode(img)
    return result[0].data.decode("utf-8", errors="ignore") if result else None

def is_old_aadhaar(text):
    return "<PrintLetterBarcodeData" in text

def parse_old_aadhaar(xml_data):
    root = ET.fromstring(xml_data)
    d = root.attrib

    raw_address = " ".join([
        d.get("house", ""), d.get("street", ""), d.get("loc", ""),
        d.get("vtc", ""), d.get("dist", ""), d.get("state", ""), d.get("pc", "")
    ])

    return {
        "type": "aadhaar",
        "name": d.get("name"),
        "aadhaar_number": d.get("uid"),  # ✅ Aadhaar from QR
        "address": normalize_address(raw_address),
        "address_raw": raw_address.strip(),
        "raw_text": xml_data
    }

# ==========================================================
#               OCR CORE
# ==========================================================
def extract_aadhaar_name(text):
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    for i, line in enumerate(lines):
        if re.search(r"\bDOB\b|\d{2}/\d{2}/\d{4}", line) and i > 0:
            return lines[i - 1]
    return None

def extract_address_from_text(raw_text):
    lines = [l.strip() for l in raw_text.splitlines() if l.strip()]
    address_lines = []

    for i, line in enumerate(lines):
        if re.search(r"address\s*[:\-]?", line, re.I):
            address_lines = lines[i:i + 4]
            break

    if not address_lines:
        for i, line in enumerate(lines):
            if re.search(r"\b\d{6}\b", line):
                address_lines = lines[max(0, i - 2): i + 2]
                break

    if not address_lines:
        address_lines = lines[-5:]

    raw_address = ", ".join(address_lines).strip()
    normalized = normalize_address(raw_address)

    return {
        "raw": raw_address,
        "normalized": normalized
    }

def image_to_text(img_path):
    qr_text = read_qr(img_path)

    if qr_text and is_old_aadhaar(qr_text):
        return parse_old_aadhaar(qr_text)

    img = cv2.imread(img_path)
    if img is None:
        return None

    text = pytesseract.image_to_string(img)
    address_data = extract_address_from_text(text)

    return {
        "type": "aadhaar",
        "name": extract_aadhaar_name(text),
        "aadhaar_number": extract_aadhaar_number(text),  # ✅ OCR Aadhaar
        "address": address_data["normalized"],
        "address_raw": address_data["raw"],
        "raw_text": text
    }

# ==========================================================
#           DOCUMENT ADDRESS EXTRACTION
# ==========================================================
def preprocess_document(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.bilateralFilter(gray, 9, 75, 75)
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return thresh

def extract_doc_address(img_path):
    img = cv2.imread(img_path)
    if img is None:
        return None

    processed = preprocess_document(img)
    text = pytesseract.image_to_string(processed, config="--psm 6")
    return normalize_address(text)

# ==========================================================
#       ADDRESS MATCHING
# ==========================================================
def address_match_score(a, b):
    a_tokens = set(a.split())
    b_tokens = set(b.split())
    return int(len(a_tokens & b_tokens) / max(len(a_tokens), 1) * 100)

def verify_address(aadhaar_address, doc_address, threshold=30):
    if not aadhaar_address or not doc_address:
        return {"status": "FAILED", "match_score": 0}

    score = address_match_score(aadhaar_address, doc_address)
    return {
        "match_score": score,
        "status": "VERIFIED" if score >= threshold else "NOT_MATCHED"
    }

# ==========================================================
#           FACE VERIFICATION
# ==========================================================
def extract_face(image_path, out="doc_face.jpg"):
    faces = DeepFace.extract_faces(
        img_path=image_path,
        detector_backend="opencv",
        enforce_detection=False
    )
    face = (faces[0]["face"] * 255).astype("uint8")
    cv2.imwrite(out, face)
    return out

def verify_selfie(selfie, document):
    doc_face = extract_face(document)
    result = DeepFace.verify(
        selfie,
        doc_face,
        model_name="Facenet",
        detector_backend="opencv",
        enforce_detection=False
    )
    return {
        "distance": round(result["distance"], 4),
        "status": "VERIFIED" if result["distance"] < 0.75 else "NOT_MATCHED"
    }

# ==========================================================
#               VIDEO VERIFICATION
# ==========================================================
def video_to_text(video):
    subprocess.run(
        ["ffmpeg", "-y", "-i", video, "-ar", "16000", "audio.wav"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )

    with open("audio.wav", "rb") as a:
        return client.audio.transcriptions.create(
            model="whisper-1",
            file=a
        ).text

def verify_video_identity(video_text, name):
    score = int(SequenceMatcher(None, video_text.lower(), name.lower()).ratio() * 100)
    return {
        "match_score": score,
        "status": "VERIFIED" if score >= 70 else "REVIEW_REQUIRED"
    }

# ==========================================================
#               FULL KYC PIPELINE
# ==========================================================
def run_full_kyc(aadhaar_img, doc_img, selfie_img, video=None):
    aadhaar = image_to_text(aadhaar_img)
    if not aadhaar or not aadhaar.get("name"):
        return {"final_status": "REJECTED", "reason": "AADHAAR_FAIL"}

    print("Aadhaar Number:", aadhaar.get("aadhaar_number", "NOT_FOUND"))

    doc_address = extract_doc_address(doc_img)
    address_result = verify_address(aadhaar["address"], doc_address)

    selfie_result = verify_selfie(selfie_img, aadhaar_img)
    if selfie_result["status"] != "VERIFIED":
        return {"final_status": "REJECTED", "reason": "SELFIE_MISMATCH"}

    final_status = "VERIFIED" if address_result["status"] == "VERIFIED" else "REVIEW_REQUIRED"

    video_result = None
    if video:
        vt = video_to_text(video)
        video_result = verify_video_identity(vt, aadhaar["name"])
        if video_result["status"] != "VERIFIED":
            final_status = "REVIEW_REQUIRED"

    return {
        "final_status": final_status,
        "document_data": aadhaar,
        "address_verification": address_result,
        "selfie_verification": selfie_result,
        "video_verification": video_result
    }
