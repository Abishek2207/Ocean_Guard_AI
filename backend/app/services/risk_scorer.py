from app.models.data_models import RiskScore

def calculate_risk(sar_conf: float, ais_status: str, mpa_status: str, fishing_likelihood: float, is_repeat: bool = False) -> RiskScore:
    """
    Risk Scoring Engine:
    - SAR confidence: 0-25
    - No AIS match: +25
    - Inside MPA: +30
    - Within MPA buffer: +15
    - Fishing likelihood: 0-15
    - Repeated detection: +5
    """
    score = 0
    factors = {}
    
    # SAR confidence factor
    sar_factor = int((sar_conf / 100) * 25)
    score += sar_factor
    factors["SAR Confidence"] = sar_factor
    
    # AIS mismatch factor
    if ais_status == "no_match":
        score += 25
        factors["AIS Mismatch"] = 25
    elif ais_status == "unknown":
        score += 10
        factors["AIS Unknown"] = 10
        
    # MPA factor
    if mpa_status == "inside":
        score += 30
        factors["Inside MPA"] = 30
    elif mpa_status == "near_buffer":
        score += 15
        factors["Near MPA Buffer"] = 15
        
    # Fishing likelihood
    fish_factor = int(min(15, fishing_likelihood))
    score += fish_factor
    factors["Fishing Likelihood"] = fish_factor
    
    # Repeat detection
    if is_repeat:
        score += 5
        factors["Repeated Detection"] = 5
        
    # Cap score at 100
    score = min(100, score)
    
    # Determine risk level
    if score <= 30:
        level = "Low"
    elif score <= 55:
        level = "Medium"
    elif score <= 75:
        level = "High"
    else:
        level = "Critical"
        
    return RiskScore(
        score=score,
        level=level,
        factors=factors
    )
