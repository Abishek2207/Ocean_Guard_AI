from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

from app.services.sar_inference import infer_sar_image
from app.services.gfw_client import match_ais_to_sar, get_fishing_effort
from app.services.protected_planet_client import check_mpa_status
from app.services.risk_scorer import calculate_risk
from app.services.evidence_cards import create_evidence_card
from app.services.agents import generate_agent_analysis
from app.services.report_generator import generate_markdown_report
from app.models.data_models import EvidenceCard

app = FastAPI(title="OceanGuard AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "OceanGuard AI Backend is running"}

@app.post("/api/sar/infer")
def sar_inference(file: UploadFile = File(None)):
    detections, model_name, source_status = infer_sar_image()
    
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
        
        card = create_evidence_card(det, model_name, ais_match, mpa_status, fishing_likelihood, risk)
        analysis = generate_agent_analysis(card)
        
        results.append({
            "detection": det.dict(),
            "ais_match": ais_match.dict(),
            "mpa_status": mpa_status.dict(),
            "risk": risk.dict(),
            "evidence_card": card.dict(),
            "agents_analysis": analysis.dict()
        })
        
    return {"status": "inference_complete", "sar_source_status": source_status, "results": results}

@app.post("/api/report/export")
def export_report(data: dict):
    try:
        card = EvidenceCard(**data.get("evidence_card", {}))
        analysis = data.get("agents_analysis", {})
        # Note: Analysis would usually be reconstructed into a model, doing basic mapping for demo
        from app.models.data_models import AgentExplanations
        agent_explanations = AgentExplanations(**analysis)
        
        report_md = generate_markdown_report(card, agent_explanations)
        return {"report_markdown": report_md}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
