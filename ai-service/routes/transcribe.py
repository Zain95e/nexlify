import whisper
import tempfile
import os
from fastapi import APIRouter, File, UploadFile, Header, HTTPException

router = APIRouter()
model = whisper.load_model("base")  # ~74MB, free, runs on CPU

def verify_secret(x_internal_secret: str):
    if x_internal_secret != os.getenv("INTERNAL_SECRET"):
        raise HTTPException(status_code=403, detail="Forbidden")

@router.post("/ai/transcribe")
async def transcribe(file: UploadFile = File(...), x_internal_secret: str = Header(...)):
    verify_secret(x_internal_secret)
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
        
    result = model.transcribe(tmp_path)
    os.unlink(tmp_path)
    return {"text": result["text"]}
