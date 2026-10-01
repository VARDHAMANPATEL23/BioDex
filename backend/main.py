from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import io, requests
import random
import traceback
import hashlib

import auth_routes
import history_routes
from paligemma_service import analyze_specimen

app = FastAPI(title="BioDex API - VLM Edition")

app.add_middleware(CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

app.include_router(auth_routes.router, prefix="/auth", tags=["auth"])
app.include_router(history_routes.router, prefix="/history", tags=["history"])

class URLRequest(BaseModel):
    url: str

@app.get("/health")
def health():
    return {"status": "ok", "engine": "PaliGemma-3B"}

@app.post("/predict/upload")
async def predict_upload(file: UploadFile = File(...)):
    contents = await file.read()
    return _build_response(contents, None)

@app.post("/predict/url")
async def predict_url(req: URLRequest):
    try:
        r = requests.get(req.url, timeout=10, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        r.raise_for_status()
        return _build_response(r.content, req.url)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": f"Failed to download image from URL: {str(e)}"}
    
def string_to_seed(s: str) -> int:
    return int(hashlib.md5(s.encode('utf-8')).hexdigest(), 16) % (10**8)

def _build_response(img_bytes: bytes, image_url: str):
    try:
        result = analyze_specimen(img_bytes)
        
        name = result.get("species", "Unknown").lower()
        is_plant = "plant" in result.get("taxonomy", {}).get("kingdom", "").lower()
        size = "~3.2 Gb" if is_plant else "~2.8 Gb"
        
        # Consistent seed generation based on Taxonomy / Name
        random.seed(string_to_seed(name))
        
        # Hex color generator based on species name
        col_1 = f"#{random.randint(0, 0xFFFFFF):06x}" 
        col_2 = "#c0392b" if not is_plant else "#00ff88"
        
        genome = {
            "size": size,
            "genes": random.randint(18000, 45000),
            "chromosomes": f"{random.randint(20, 60)} (2n)",
            "gc_content": round(random.uniform(0.35, 0.45), 3),
            "structure_3d": {
                "color_a": col_1,
                "color_b": col_2,
                "twist": round(random.uniform(2.0, 5.0), 2),
                "particle_density": random.randint(100, 300)
            }
        }
        
        # Randomize seed back to normal
        random.seed()
        
        traits = []
        if isinstance(result.get("diet"), str) and len(result.get("diet")) > 5: traits.append(result["diet"][:30])
        if isinstance(result.get("behavior"), str) and len(result.get("behavior")) > 5: traits.append(result["behavior"][:30])
        traits.append(result.get("diet_type", "Organism"))

        prediction = {
            "label": result.get("species", "Unknown Specimen").title(),
            "confidence": result.get("paligemma_detection", {}).get("confidence_score", 95.0),
            "scientific_name": result.get("scientific_name", "Unknown Taxonomy"),
            "common_name": result.get("species", "").title(),
            "conservation_status": result.get("conservation_status", "Not Evaluated"),
            "description": result.get("description", "Biological record detected."),
            "image_url": image_url, 
            
            "taxonomy": result.get("taxonomy", {}),
            "ecology": result.get("ecology", ""),
            "habitat": result.get("habitat", ""),
            "diet": result.get("diet", ""),
            "behavior": result.get("behavior", ""),
            "survival": result.get("survival_environment", ""),
            "conservation_level": result.get("conservation_level", "Unknown"),
            
            "traits": traits,
            "distinct_features": result.get("fun_facts", [])[:3] if isinstance(result.get("fun_facts"), list) else [],
            "diseases": [result.get("conservation_level", "Unknown Level")],
            "genome": genome
        }
        
        return {
            "status": "success",
            "prediction": prediction
        }
    except Exception as e:
        traceback.print_exc()
        return {"status": "error", "message": str(e)}
