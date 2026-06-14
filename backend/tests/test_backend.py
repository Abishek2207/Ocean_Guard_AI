import pytest
from app.models.data_models import EvidenceCard, DataSourceStatus, SARDetection, AISMatch, MPAStatus, RiskScore, Coordinates
from app.services.risk_scorer import calculate_risk
from app.services.sar_inference import infer_sar_image
from app.services.agents import generate_agent_analysis

def test_risk_scorer_exact_rules():
    # Test high risk scenario
    risk = calculate_risk(sar_conf=100.0, ais_status="no_match", mpa_status="inside", fishing_likelihood=15.0, repeat_score=5)
    # math: conf(25) + ais(25) + mpa(30) + fish(15) + repeat(5) = 100
    assert risk.score == 100
    assert risk.level == "Critical"
    
    # Test low risk scenario
    risk_low = calculate_risk(sar_conf=0.0, ais_status="matched", mpa_status="outside", fishing_likelihood=0.0, repeat_score=0)
    assert risk_low.score == 0
    assert risk_low.level == "Low"
    
    # Test medium scenario
    risk_med = calculate_risk(sar_conf=50.0, ais_status="matched", mpa_status="near_buffer", fishing_likelihood=10.0, repeat_score=0)
    # conf(12) + ais(0) + mpa(15) + fish(10) + repeat(0) = 37
    assert risk_med.score == 37
    assert risk_med.level == "Medium"

def test_evidence_card_schema():
    card = EvidenceCard(
        detection_id="test_1",
        model_name="YOLO-Test",
        model_confidence=99.9,
        coordinates=Coordinates(latitude=10.0, longitude=-20.0),
        ais_status="no_match",
        ais_source_status=DataSourceStatus.CACHED_HISTORICAL,
        mpa_status="inside",
        mpa_name="Demo",
        mpa_source_status=DataSourceStatus.LIVE_API,
        distance_to_mpa_km=5.0,
        risk_score=75,
        risk_level="High",
        score_breakdown={"SAR Confidence": 25, "AIS Mismatch": 25, "Near MPA Buffer": 15, "Fishing Likelihood": 10},
        why_flagged="No AIS broadcast detected. | Near MPA buffer.",
        uncertainty_note="Uncertainty present due to: AIS: CACHED_HISTORICAL",
        human_review_required=True
    )
    assert card.legal_safety_note == "This is possible dark-fishing risk for human review, not proof of illegal fishing."
    assert card.risk_level == "High"

def test_agent_narrator_no_hallucination():
    card = EvidenceCard(
        detection_id="test_1",
        model_name="YOLO-Test",
        model_confidence=99.9,
        coordinates=Coordinates(latitude=10.0, longitude=-20.0),
        ais_status="matched",
        ais_source_status=DataSourceStatus.LIVE_API,
        mpa_status="outside",
        mpa_name="Demo",
        mpa_source_status=DataSourceStatus.LIVE_API,
        distance_to_mpa_km=150.0,
        risk_score=20,
        risk_level="Low",
        score_breakdown={"SAR Confidence": 20},
        why_flagged="Routine detection.",
        uncertainty_note="All sources live.",
        human_review_required=True
    )
    analysis = generate_agent_analysis(card)
    assert "compliant behavior" in analysis.ais_intelligence
    assert "Low risk" in analysis.risk_reasoning
    assert "No immediate action required" in analysis.human_reviewer

def test_sar_inference_missing_model():
    detections, model_name, status, msg = infer_sar_image()
    # Assuming best.pt isn't present in test environment
    assert status == DataSourceStatus.MODEL_MISSING
    assert detections == []
    assert "Place trained YOLOv8 SAR model" in msg
