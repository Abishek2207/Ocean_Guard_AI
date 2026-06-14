import pytest
from app.services.sar_inference import infer_sar_image
from app.services.gfw_client import match_ais_to_sar
from app.services.protected_planet_client import check_mpa_status

def test_gfw_fallback():
    # Assumes no valid token in test env
    match = match_ais_to_sar(15.0, -60.0)
    # Should use the cached historical data
    assert match.source_status == "TOKEN_MISSING"

def test_wdpa_fallback():
    status = check_mpa_status(15.0, -60.0)
    assert status.source_status == "TOKEN_MISSING"
    
def test_sar_fallback():
    detections, model_name, source = infer_sar_image(None)
    assert source in ["MODEL_MISSING", "API_ERROR", "LIVE_API"]
