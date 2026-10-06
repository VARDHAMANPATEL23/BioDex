import os
from datetime import datetime
from typing import Optional

import jwt
from database import history_collection
from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel

router = APIRouter()
SECRET_KEY = os.getenv(
    "SECRET_KEY", "biodex-production-jwt-security-key-2026-v1-supersecret"
)


class ScanRecord(BaseModel):
    image_uri: Optional[str] = None
    prediction: dict


def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload.get("sub")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("")
def save_scan(record: ScanRecord, email: str = Depends(get_current_user)):
    # 1. Clean the payload: If image_uri is a massive base64 string or local file path, delete it.
    # We only want to save small URLs to prevent MongoDB bloat.
    safe_image_uri = record.image_uri
    if safe_image_uri and (
        safe_image_uri.startswith("file://") or safe_image_uri.startswith("data:image")
    ):
        safe_image_uri = None  # Scrap local blobs

    # Also strip base64 from anywhere inside prediction if it accidentally sneaks in
    prediction_data = record.prediction
    if "image_url" in prediction_data and isinstance(prediction_data["image_url"], str):
        if prediction_data["image_url"].startswith("data:image"):
            prediction_data["image_url"] = None

    history_item = {
        "email": email,
        "image_uri": safe_image_uri,
        "prediction": prediction_data,
        "timestamp": datetime.utcnow().isoformat(),
    }
    try:
        result = history_collection.insert_one(history_item)
        return {"status": "success", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("")
def get_history(email: str = Depends(get_current_user)):
    try:
        records = list(history_collection.find({"email": email}).sort("timestamp", -1))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    for r in records:
        r["_id"] = str(r["_id"])
    return {"status": "success", "data": records}
