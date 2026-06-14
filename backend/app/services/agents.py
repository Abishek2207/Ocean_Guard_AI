from app.models.data_models import EvidenceCard, AgentExplanations

def generate_agent_analysis(card: EvidenceCard) -> AgentExplanations:
    """
    Agent explanations strictly based on evidence card data.
    """
    
    # Detection Analyst
    det_analyst = f"Model {card.sar_model_name} detected an object with {card.sar_model_confidence}% confidence. False-positive risk remains if the object is sea clutter or a platform. Human verification is required."
    
    # AIS Intelligence
    ais_src = f"[{card.ais_source_status}]"
    if card.ais_status == "matched":
        ais_intel = f"{ais_src} The detected object matches an active AIS broadcast. This indicates compliant behavior."
    elif card.ais_status == "no_match":
        ais_intel = f"{ais_src} No corresponding AIS signal was found. This represents a potential 'dark vessel'. Note: Mismatch may be due to satellite reception or equipment failure, not inherently illegal."
    else:
        ais_intel = f"{ais_src} AIS data is currently unknown or unavailable for this region/time."
        
    # MPA Geospatial
    mpa_src = f"[{card.mpa_source_status}]"
    if card.mpa_status == "inside":
        mpa_geo = f"{mpa_src} CRITICAL: The detection is located directly inside the {card.mpa_name} Marine Protected Area boundary."
    elif card.mpa_status == "near_buffer":
        mpa_geo = f"{mpa_src} WARNING: The detection is {card.distance_to_mpa_km}km from {card.mpa_name}, which is within the buffer zone."
    else:
        mpa_geo = f"{mpa_src} The detection is {card.distance_to_mpa_km}km away from any known MPA, well outside protected boundaries."
        
    # Risk Reasoning
    risk_reason = f"Calculated risk score is {card.risk_score}/100 ({card.risk_level} risk). Contributing factors: {card.why_flagged}"
    
    # Human Reviewer
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
