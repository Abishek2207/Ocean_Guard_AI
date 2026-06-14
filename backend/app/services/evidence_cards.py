from app.models.data_models import EvidenceCard, SARDetection, AISMatch, MPAStatus, RiskScore, Coordinates

def create_evidence_card(
    detection: SARDetection, 
    model_name: str,
    ais_match: AISMatch, 
    mpa_status: MPAStatus, 
    risk: RiskScore
) -> EvidenceCard:
    """
    Combines data sources into a transparent evidence card.
    """
    
    reasons = []
    if ais_match.match_status == "no_match":
        reasons.append("No AIS broadcast detected.")
    if mpa_status.status == "inside":
        reasons.append("Inside MPA.")
    elif mpa_status.status == "near_buffer":
        reasons.append("Near MPA buffer.")
    if risk.factors.get("Fishing Likelihood", 0) > 10:
        reasons.append("High fishing likelihood.")
        
    flag_reason = " | ".join(reasons) if reasons else "Routine detection."
    
    # Check for caching/model/token issues to add uncertainty note
    uncertainty_notes = []
    if ais_match.source_status != "LIVE_API":
        uncertainty_notes.append(f"AIS: {ais_match.source_status}")
    if mpa_status.source_status != "LIVE_API":
        uncertainty_notes.append(f"MPA: {mpa_status.source_status}")
    
    uncertainty_str = "All sources live." if not uncertainty_notes else "Uncertainty present due to: " + ", ".join(uncertainty_notes)
    
    return EvidenceCard(
        detection_id=detection.id,
        model_name=model_name,
        model_confidence=detection.confidence,
        coordinates=Coordinates(latitude=detection.latitude or 0.0, longitude=detection.longitude or 0.0),
        ais_status=ais_match.match_status,
        ais_source_status=ais_match.source_status,
        mpa_name=mpa_status.mpa_name,
        mpa_source_status=mpa_status.source_status,
        distance_to_mpa_km=mpa_status.distance_km,
        risk_score=risk.score,
        risk_level=risk.level,
        score_breakdown=risk.factors,
        why_flagged=flag_reason,
        uncertainty_note=uncertainty_str,
        human_review_required=True,
        legal_safety_note="This is possible dark-fishing risk for human review, not proof of illegal fishing."
    )
