# ==========================================================
#                AADHAAR QR-BASED KYC MODULE
# ==========================================================

import cv2
from pyzbar.pyzbar import decode
from PIL import Image
import xml.etree.ElementTree as ET
import re

# ==========================================================
#               ADDRESS NORMALIZATION
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
#                   QR SCANNING
# ==========================================================
def read_qr(image_path: str):
    """
    Reads QR code from Aadhaar image.
    Returns raw QR data (string) if found.
    """
    img = Image.open(image_path)
    qr_results = decode(img)

    if not qr_results:
        return None

    return qr_results[0].data.decode("utf-8", errors="ignore")

# ==========================================================
#             OLD AADHAAR QR (XML FORMAT)
# ==========================================================
def is_old_aadhaar_qr(qr_text: str):
    return "<PrintLetterBarcodeData" in qr_text

def parse_old_aadhaar_qr(xml_data: str):
    """
    Parses old Aadhaar XML QR
    """
    root = ET.fromstring(xml_data)
    d = root.attrib

    raw_address = " ".join([
        d.get("house", ""),
        d.get("street", ""),
        d.get("loc", ""),
        d.get("vtc", ""),
        d.get("dist", ""),
        d.get("state", ""),
        d.get("pc", "")
    ])

    return {
        "type": "aadhaar_qr",
        "name": d.get("name"),
        "aadhaar_number": d.get("uid"),   # ✅ ALWAYS PRESENT
        "gender": d.get("gender"),
        "dob": d.get("dob") or d.get("yob"),
        "address_raw": raw_address.strip(),
        "address": normalize_address(raw_address)
    }

# ==========================================================
#         NEW AADHAAR SECURE QR (BASE64 / JSON)
# ==========================================================
def parse_secure_qr(qr_text: str):
    """
    Placeholder for Secure QR (encrypted).
    In real systems this requires UIDAI's official SDK.
    """
    return {
        "type": "secure_qr",
        "status": "ENCRYPTED",
        "message": "Secure QR detected. UIDAI SDK required."
    }

# ==========================================================
#               MAIN ENTRY FUNCTION
# ==========================================================
def extract_aadhaar_from_qr(aadhaar_image_path: str):
    """
    Main function used by FastAPI / backend.
    """
    qr_text = read_qr(aadhaar_image_path)

    if not qr_text:
        return {
            "status": "FAILED",
            "reason": "NO_QR_CODE_FOUND"
        }

    # Old Aadhaar QR (XML)
    if is_old_aadhaar_qr(qr_text):
        return {
            "status": "SUCCESS",
            "data": parse_old_aadhaar_qr(qr_text)
        }

    # New Aadhaar Secure QR
    return {
        "status": "SUCCESS",
        "data": parse_secure_qr(qr_text)
    }

# ==========================================================
#               TEST (OPTIONAL)
# ==========================================================
if __name__ == "__main__":
    result = extract_aadhaar_from_qr(r"C:\Users\NUPUR\hackathon\compliace-all-main\backend\aadhar.jpg")
    print(result)
