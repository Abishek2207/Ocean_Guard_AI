from app.models.data_models import EvidenceCard, SARDetection, AISMatch, MPAStatus, RiskScore

def create_evidence_card(
    detection: SARDetection, 
    sar_model_name: str,
    ais_match: AISMatch, 
    mpa_status: MPAStatus, 
    fishing_likelihood: float, 
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
    if fishing_likelihood > 10:
        reasons.append("High fishing likelihood.")
        
    flag_reason = " | ".join(reasons) if reasons else "Routine detection."
    
    return EvidenceCard(
        detection_id=detection.id,
        sar_model_name=sar_model_name,
        sar_model_confidence=detection.confidence,
        ais_status=ais_match.match_status,
        ais_source_status=ais_match.source_status,
        mpa_status=mpa_status.status,
        mpa_name=mpa_status.mpa_name,
        mpa_source_status=mpa_status.source_status,
        distance_to_mpa_km=mpa_status.distance_km,
        fishing_likelihood=fishing_likelihood,
        risk_score=risk.score,
        risk_level=risk.level,
        why_flagged=flag_reason
    )
