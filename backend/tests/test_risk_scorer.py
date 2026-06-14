from app.services.risk_scorer import calculate_risk

def test_calculate_risk_high():
    risk = calculate_risk(
        sar_conf=90.0,
        ais_status="no_match",
        mpa_status="inside",
        fishing_likelihood=12.0
    )
    assert risk.score >= 75
    assert risk.level in ["High", "Critical"]
    assert risk.factors["AIS Mismatch"] == 25
    assert risk.factors["Inside MPA"] == 30

def test_calculate_risk_low():
    risk = calculate_risk(
        sar_conf=40.0,
        ais_status="matched",
        mpa_status="outside",
        fishing_likelihood=0.0
    )
    assert risk.score <= 30
    assert risk.level == "Low"
