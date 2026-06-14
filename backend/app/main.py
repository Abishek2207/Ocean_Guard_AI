from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from pydantic import BaseModel

from app.services.sar_inference import infer_sar_image
from app.services.gfw_client import match_ais_to_sar, get_fishing_effort
from app.services.protected_planet_client import check_mpa_status
from app.services.risk_scorer import calculate_risk
from app.services.evidence_cards import create_evidence_card
from app.services.agents import generate_agent_analysis, ask_oceanguard, generate_daily_briefing, generate_patrol_recommendation
from app.services.report_generator import generate_markdown_report
from app.models.data_models import EvidenceCard, SARDetection, AISMatch, MPAStatus, RiskScore

app = FastAPI(title="OceanGuard AI API", version="1.0.0")

from app.config import settings

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "name": "OceanGuard AI API",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
        "health": "/health",
        "demo": "/api/demo/run"
    }

@app.get("/system-integrity")
def system_integrity():
    from app.config import settings
    from app.services.sar_inference import HAS_YOLO
    import os
    model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../ml/models/best.pt"))
    has_model = HAS_YOLO and os.path.exists(model_path)
    
    # Check cached data status
    gfw_cache = os.path.join(settings.CACHE_DIR, "gfw")
    wdpa_cache = os.path.join(settings.CACHE_DIR, "wdpa")
    
    gfw_cache_status = os.path.exists(gfw_cache) and len(os.listdir(gfw_cache)) > 0
    wdpa_cache_status = os.path.exists(wdpa_cache) and len(os.listdir(wdpa_cache)) > 0
    
    return {
        "YOLO Model Status": "ACTIVE" if has_model else "MISSING (Fail-safe: MODEL_MISSING)",
        "GFW Status": "LIVE_API_READY" if settings.GFW_API_TOKEN else "CACHED_HISTORICAL",
        "Protected Planet Status": "LIVE_API_READY" if settings.PROTECTED_PLANET_TOKEN else "CACHED_HISTORICAL",
        "Backend Status": "ONLINE",
        "Database Status": "NOT_REQUIRED (Stateless API)",
        "Cached Data Status": "AVAILABLE" if (gfw_cache_status or wdpa_cache_status) else "MISSING",
        "API Status": "HEALTHY"
    }

@app.get("/health")
def health_check():
    from app.config import settings
    from app.services.sar_inference import HAS_YOLO
    import os
    model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../ml/models/best.pt"))
    has_model = HAS_YOLO and os.path.exists(model_path)
    
    return {
        "status": "ok", 
        "message": "OceanGuard AI Backend is running",
        "gfw_token_configured": bool(settings.GFW_API_TOKEN),
        "wdpa_token_configured": bool(settings.PROTECTED_PLANET_TOKEN),
        "model_loaded": has_model
    }

@app.get("/api/demo/scenarios")
def get_scenarios():
    return {"scenarios": ["cached_scenario_1", "cached_scenario_2"]}

@app.get("/api/demo/run")
def run_demo_scenario():
    from app.services.demo_scenario import generate_demo_scenario
    results = generate_demo_scenario()
    return {
        "status": "inference_complete", 
        "sar_source_status": "CACHED_HISTORICAL", 
        "message": "Demo mode: Loaded pre-configured scenarios.", 
        "results": results
    }

@app.post("/api/sar/infer")
def sar_inference(file: UploadFile = File(None)):
    image_path = None
    # For MVP we are not saving the file, just running inference without path triggers CACHED
    detections, model_name, source_status, msg = infer_sar_image(image_path)
    
    results = []
    for det in detections:
        lat = det.latitude or 0.0
        lon = det.longitude or 0.0
        
        ais_match = match_ais_to_sar(lat, lon)
        mpa_status = check_mpa_status(lat, lon)
        fishing_likelihood = get_fishing_effort(lat, lon)
        
        risk = calculate_risk(
            sar_conf=det.confidence,
            ais_status=ais_match.match_status,
            mpa_status=mpa_status.status,
            fishing_likelihood=fishing_likelihood
        )
        
        card = create_evidence_card(det, model_name, ais_match, mpa_status, risk)
        analysis = generate_agent_analysis(card)
        
        results.append({
            "detection": det.model_dump(),
            "ais_match": ais_match.model_dump(),
            "mpa_status": mpa_status.model_dump(),
            "risk": risk.model_dump(),
            "evidence_card": card.model_dump(),
            "agents_analysis": analysis.model_dump()
        })
        
    return {"status": "inference_complete", "sar_source_status": source_status, "message": msg, "results": results}

class LocationRequest(BaseModel):
    latitude: float
    longitude: float

@app.post("/api/ais/match")
def match_ais(loc: LocationRequest):
    return match_ais_to_sar(loc.latitude, loc.longitude)

class RiskRequest(BaseModel):
    sar_conf: float
    ais_status: str
    mpa_status: str
    fishing_likelihood: float
    repeat_score: int = 0

@app.post("/api/risk/score")
def risk_score(req: RiskRequest):
    return calculate_risk(req.sar_conf, req.ais_status, req.mpa_status, req.fishing_likelihood, req.repeat_score)

@app.post("/api/evidence-card")
def evidence_card(req: dict):
    # Pass through dict to schema for validation
    return EvidenceCard(**req)

@app.post("/api/agents/evidence-narrator")
def agent_narrator(card: EvidenceCard):
    return generate_agent_analysis(card)

class AskRequest(BaseModel):
    question: str
    detections: List[dict]

@app.post("/api/agents/ask")
def agent_ask(req: AskRequest):
    return {"response": ask_oceanguard(req.question, req.detections)}

@app.post("/api/agents/daily-briefing")
def agent_briefing(detections: List[dict]):
    return {"briefing": generate_daily_briefing(detections)}

@app.post("/api/agents/patrol-recommendation")
def agent_patrol(detections: List[dict]):
    return {"recommendations": generate_patrol_recommendation(detections)}

@app.post("/api/report/export")
def export_report(data: dict):
    try:
        card = EvidenceCard(**data.get("evidence_card", {}))
        analysis = data.get("agents_analysis", {})
        from app.models.data_models import AgentExplanations
        agent_explanations = AgentExplanations(**analysis)
        
        report_md = generate_markdown_report(card, agent_explanations)
        return {"report_markdown": report_md}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/live/mpa/search")
def search_mpa(query: str):
    from app.services.protected_planet_client import search_mpa_live
    return search_mpa_live(query)

@app.get("/api/live/mpa/{wdpa_id}")
def get_mpa(wdpa_id: int):
    from app.services.protected_planet_client import get_mpa_live
    return get_mpa_live(wdpa_id)

class GFWContextRequest(BaseModel):
    latitude: float
    longitude: float
    start_date: str
    end_date: str
    radius_km: float

@app.post("/api/live/gfw/context")
def gfw_context(req: GFWContextRequest):
    from app.services.gfw_client import fetch_gfw_context
    return fetch_gfw_context(req.latitude, req.longitude, req.start_date, req.end_date, req.radius_km)

