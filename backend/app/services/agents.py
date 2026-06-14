from app.models.data_models import EvidenceCard, AgentExplanations
from typing import List

def generate_agent_analysis(card: EvidenceCard) -> AgentExplanations:
    """
    Evidence Narrator agent: strictly based on evidence card data.
    """
    det_analyst = f"Model {card.model_name} detected an object with {card.model_confidence}% confidence at {card.coordinates.latitude}, {card.coordinates.longitude}. False-positive risk remains if the object is sea clutter or a platform. Human verification is required."
    
    ais_src = f"[{card.ais_source_status}]"
    if card.ais_status == "matched":
        ais_intel = f"{ais_src} The detected object matches an active AIS broadcast. This indicates compliant behavior."
    elif card.ais_status == "no_match":
        ais_intel = f"{ais_src} No corresponding AIS signal was found. This represents a potential 'dark vessel'. Note: Mismatch may be due to satellite reception or equipment failure, not inherently illegal."
    else:
        ais_intel = f"{ais_src} AIS data is currently unknown or unavailable for this region/time."
        
    mpa_src = f"[{card.mpa_source_status}]"
    if card.mpa_status == "inside":
        mpa_geo = f"{mpa_src} CRITICAL: The detection is located directly inside the {card.mpa_name} Marine Protected Area boundary."
    elif card.mpa_status == "near_buffer":
        mpa_geo = f"{mpa_src} WARNING: The detection is {card.distance_to_mpa_km}km from {card.mpa_name}, which is within the buffer zone."
    else:
        mpa_geo = f"{mpa_src} The detection is {card.distance_to_mpa_km}km away from any known MPA, well outside protected boundaries."
        
    risk_reason = f"Calculated risk score is {card.risk_score}/100 ({card.risk_level} risk). Contributing factors: {card.score_breakdown}. Flags: {card.why_flagged}"
    
    if card.risk_level in ["High", "Critical"]:
        human_rev = "RECOMMENDATION: \n1. Review SAR tile visually.\n2. Cross-reference historical vessel tracks.\n3. Verify MPA rules.\n4. Do not initiate enforcement action without human corroboration."
    else:
        human_rev = "RECOMMENDATION: No immediate action required. Log detection for routine monitoring."
        
    return AgentExplanations(
        detection_analyst=det_analyst,
        ais_intelligence=ais_intel,
        mpa_geospatial=mpa_geo,
        risk_reasoning=risk_reason,
        human_reviewer=human_rev
    )

def ask_oceanguard(question: str, detections: List[dict]) -> str:
    """
    Ask OceanGuard chat agent without hallucination.
    """
    q = question.lower()
    
    if not detections:
        return "I do not have any detections in my current context to answer that."

    # Using the first detection for simple answers if no ID specified, or if ID matches
    target_det = detections[0].get("evidence_card", {})
    
    if "risk" in q:
        return f"The risk score for this detection is {target_det.get('risk_score', 'unknown')}. Reasoning: {target_det.get('why_flagged', 'none')}."
    if "mpa" in q:
        return f"MPA status: {target_det.get('mpa_status', 'unknown')}. Distance: {target_det.get('distance_to_mpa_km', 'unknown')}km."
    if "ais" in q:
        return f"AIS status: {target_det.get('ais_status', 'unknown')} via {target_det.get('ais_source_status', 'unknown')}."
    if "confidence" in q:
        return f"The SAR model confidence is {target_det.get('model_confidence', 'unknown')}%."
        
    return "I can only answer questions regarding risk scores, AIS status, MPA distance, or SAR confidence based on the current context."

def generate_daily_briefing(detections: List[dict]) -> str:
    """
    Daily Briefing agent.
    """
    total = len(detections)
    high_critical = sum(1 for d in detections if d.get("evidence_card", {}).get("risk_level") in ["High", "Critical"])
    dark_vessels = sum(1 for d in detections if d.get("evidence_card", {}).get("ais_status") == "no_match")
    
    return f"Daily Briefing: {total} total detections processed. {high_critical} require immediate human review. {dark_vessels} potential dark vessels identified."

def generate_patrol_recommendation(detections: List[dict]) -> List[dict]:
    """
    Patrol Recommender agent.
    Returns ranked targets.
    """
    targets = []
    for d in detections:
        card = d.get("evidence_card", {})
        if card.get("risk_level") in ["High", "Critical", "Medium"]:
            targets.append({
                "detection_id": card.get("detection_id"),
                "risk_score": card.get("risk_score"),
                "risk_level": card.get("risk_level"),
                "coordinates": card.get("coordinates")
            })
            
    # Sort descending
    targets.sort(key=lambda x: x["risk_score"], reverse=True)
    return targets
