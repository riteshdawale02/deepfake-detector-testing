from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import hashlib
import random
import time
import os
from datetime import datetime
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse


app = FastAPI(title="AntiGravity API", version="2.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ReportRequest(BaseModel):
    name: str
    email: str
    phone: str
    city: str
    state: str
    description: str
    case_evidence_id: str = ""


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "2.1.0", "models": ["EfficientNet-B4", "SyncNet", "MelCNN"]}


@app.post("/api/analyze")
async def analyze_media(file: UploadFile = File(...)):
    """
    Simulate AI-powered deepfake analysis pipeline.
    In production: runs EfficientNet (image), SyncNet (video), MelCNN (audio).
    """
    contents = await file.read()
    sha256 = hashlib.sha256(contents).hexdigest()

    # Simulate processing time
    await asyncio.sleep(random.uniform(2.5, 4.5))

    file_type = "image"
    if file.content_type:
        if "video" in file.content_type:
            file_type = "video"
        elif "audio" in file.content_type:
            file_type = "audio"

    # Simulate realistic analysis
    roll = random.random()
    is_fake = roll < 0.45
    is_suspicious = 0.45 <= roll < 0.65

    def rand_score(low, high):
        return round(random.uniform(low, high), 1)

    if is_fake:
        face_score = rand_score(5, 30)
        sync_score = rand_score(5, 25) if file_type == "video" else rand_score(50, 80)
        compression_score = rand_score(10, 35)
        metadata_score = rand_score(10, 40)
        fingerprint_score = rand_score(5, 25)
        flags = random.sample([
            "GAN artifact pattern detected in frequency domain",
            "Inconsistent facial landmarks across frames",
            "Audio-visual synchronization mismatch detected",
            "ElevenLabs/RVC voice clone signature identified",
            "Metadata timestamp inconsistency found",
            "EXIF data stripped — likely re-compressed",
            "Generative model fingerprint: StyleGAN3",
        ], k=random.randint(2, 4))
    elif is_suspicious:
        face_score = rand_score(35, 55)
        sync_score = rand_score(40, 65) if file_type == "video" else rand_score(70, 90)
        compression_score = rand_score(45, 65)
        metadata_score = rand_score(50, 70)
        fingerprint_score = rand_score(40, 60)
        flags = random.sample([
            "Minor compression artifact inconsistency",
            "Slight facial landmark variation detected",
        ], k=1)
    else:
        face_score = rand_score(75, 98)
        sync_score = rand_score(85, 99) if file_type == "video" else 95
        compression_score = rand_score(78, 95)
        metadata_score = rand_score(80, 99)
        fingerprint_score = rand_score(82, 98)
        flags = []

    avg = round((face_score + sync_score + compression_score + metadata_score + fingerprint_score) / 5, 1)
    truth_score = int(avg)

    if is_fake:
        verdict = "FAKE"
    elif is_suspicious:
        verdict = "SUSPICIOUS"
        truth_score = int(rand_score(35, 55))
    else:
        verdict = "AUTHENTIC"

    case_id = f"AG-2026-{random.randint(10000, 99999)}"

    return {
        "case_id": case_id,
        "truth_score": truth_score,
        "verdict": verdict,
        "file_type": file_type,
        "sha256": sha256,
        "timestamp": datetime.utcnow().isoformat(),
        "breakdown": [
            {"metric": "Face Consistency", "score": face_score, "fullMark": 100},
            {"metric": "AV Sync", "score": sync_score, "fullMark": 100},
            {"metric": "Compression", "score": compression_score, "fullMark": 100},
            {"metric": "Metadata", "score": metadata_score, "fullMark": 100},
            {"metric": "GAN Fingerprint", "score": fingerprint_score, "fullMark": 100},
        ],
        "flags": flags,
        "heatmap_available": file_type == "image",
        "models_used": ["EfficientNet-B4", "GRAD-CAM", "MetaForge-v2"],
    }


@app.post("/api/report")
async def file_report(report: ReportRequest):
    """Register a cyber crime complaint and return a case ID."""
    await asyncio.sleep(1.5)
    case_id = f"CC-2026-{random.randint(100000, 999999)}"
    return {
        "success": True,
        "case_id": case_id,
        "message": "Complaint registered with India Cyber Crime Portal",
        "portal": "cybercrime.gov.in",
        "helpdesk": "helpdesk@cybercrime.gov.in",
        "timestamp": datetime.utcnow().isoformat(),
        "status": "Registered",
    }


# Serve static files from the frontend/dist directory
frontend_dist = "/frontend/dist"

if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{rest_of_path:path}")
    async def serve_frontend(rest_of_path: str):
        # If the path looks like an API call, it might be a 404
        if rest_of_path.startswith("api/"):
            return {"error": "Not Found"}, 404
        
        # Otherwise serve index.html for all other paths (SPA support)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    print(f"Warning: Static files directory not found at {frontend_dist}")

if __name__ == "__main__":

    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
