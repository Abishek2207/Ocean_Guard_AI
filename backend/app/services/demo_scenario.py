from app.models.data_models import EvidenceCard, SARDetection, BoundingBox, Coordinates, AISMatch, MPAStatus, RiskScore, DataSourceStatus
from app.services.agents import generate_agent_analysis
import uuid

def generate_demo_scenario():
    """
    Generates 4 pre-configured detections (Low, Medium, High, Critical) near the Galapagos Marine Reserve.
    """
    results = []
    
    # Base location (near Galapagos)
    base_lat = -0.38
    base_lon = -90.3

    # --- 1. Low Risk (Compliant Vessel outside MPA) ---
    det1 = SARDetection(
        id=f"det-{str(uuid.uuid4())[:8]}",
        confidence=95.0,
        bbox=BoundingBox(x_min=0, y_min=0, x_max=50, y_max=50),
        latitude=base_lat + 2.0,
        longitude=base_lon + 2.0
    )
    ais1 = AISMatch(match_status="matched", source_status=DataSourceStatus.CACHED_HISTORICAL, vessel_id="MMSI-123456789", vessel_name="OCEAN STAR")
    mpa1 = MPAStatus(status="outside", source_status=DataSourceStatus.CACHED_HISTORICAL, mpa_name=None, distance_km=250.0)
    risk1 = RiskScore(score=20, level="Low", factors={"SAR Confidence": 20})
    card1 = EvidenceCard(
        detection_id=det1.id,
        model_name="YOLO-Demo",
        model_confidence=det1.confidence,
        coordinates=Coordinates(latitude=det1.latitude, longitude=det1.longitude),
        ais_status=ais1.match_status,
        ais_source_status=ais1.source_status,
        mpa_status=mpa1.status,
        mpa_name=mpa1.mpa_name,
        mpa_source_status=mpa1.source_status,
        distance_to_mpa_km=mpa1.distance_km,
        risk_score=risk1.score,
        risk_level=risk1.level,
        score_breakdown=risk1.factors,
        why_flagged="Routine detection.",
        uncertainty_note="Uncertainty present due to: AIS: CACHED_HISTORICAL, MPA: CACHED_HISTORICAL",
        human_review_required=False
    )
    results.append({
        "detection": det1.model_dump(),
        "ais_match": ais1.model_dump(),
        "mpa_status": mpa1.model_dump(),
        "risk": risk1.model_dump(),
        "evidence_card": card1.model_dump(),
        "agents_analysis": generate_agent_analysis(card1).model_dump()
    })

    # --- 2. Medium Risk (Unknown vessel near buffer) ---
    det2 = SARDetection(
        id=f"det-{str(uuid.uuid4())[:8]}",
        confidence=85.0,
        bbox=BoundingBox(x_min=0, y_min=0, x_max=50, y_max=50),
        latitude=base_lat + 0.5,
        longitude=base_lon + 0.5
    )
    ais2 = AISMatch(match_status="unknown", source_status=DataSourceStatus.CACHED_HISTORICAL)
    mpa2 = MPAStatus(status="near_buffer", source_status=DataSourceStatus.CACHED_HISTORICAL, mpa_name="Galapagos Marine Reserve", distance_km=45.0)
    risk2 = RiskScore(score=45, level="Medium", factors={"SAR Confidence": 20, "AIS Unknown": 10, "Near MPA Buffer": 15})
    card2 = EvidenceCard(
        detection_id=det2.id,
        model_name="YOLO-Demo",
        model_confidence=det2.confidence,
        coordinates=Coordinates(latitude=det2.latitude, longitude=det2.longitude),
        ais_status=ais2.match_status,
        ais_source_status=ais2.source_status,
        mpa_status=mpa2.status,
        mpa_name=mpa2.mpa_name,
        mpa_source_status=mpa2.source_status,
        distance_to_mpa_km=mpa2.distance_km,
        risk_score=risk2.score,
        risk_level=risk2.level,
        score_breakdown=risk2.factors,
        why_flagged="Near MPA buffer.",
        uncertainty_note="Uncertainty present due to: AIS: CACHED_HISTORICAL, MPA: CACHED_HISTORICAL",
        human_review_required=True
    )
    results.append({
        "detection": det2.model_dump(),
        "ais_match": ais2.model_dump(),
        "mpa_status": mpa2.model_dump(),
        "risk": risk2.model_dump(),
        "evidence_card": card2.model_dump(),
        "agents_analysis": generate_agent_analysis(card2).model_dump()
    })

    # --- 3. High Risk (Dark vessel outside MPA, high fishing likelihood) ---
    det3 = SARDetection(
        id=f"det-{str(uuid.uuid4())[:8]}",
        confidence=98.0,
        bbox=BoundingBox(x_min=0, y_min=0, x_max=50, y_max=50),
        latitude=base_lat + 0.8,
        longitude=base_lon - 1.2
    )
    ais3 = AISMatch(match_status="no_match", source_status=DataSourceStatus.CACHED_HISTORICAL)
    mpa3 = MPAStatus(status="outside", source_status=DataSourceStatus.CACHED_HISTORICAL, mpa_name=None, distance_km=120.0)
    risk3 = RiskScore(score=65, level="High", factors={"SAR Confidence": 25, "AIS Mismatch": 25, "Fishing Likelihood": 15})
    card3 = EvidenceCard(
        detection_id=det3.id,
        model_name="YOLO-Demo",
        model_confidence=det3.confidence,
        coordinates=Coordinates(latitude=det3.latitude, longitude=det3.longitude),
        ais_status=ais3.match_status,
        ais_source_status=ais3.source_status,
        mpa_status=mpa3.status,
        mpa_name=mpa3.mpa_name,
        mpa_source_status=mpa3.source_status,
        distance_to_mpa_km=mpa3.distance_km,
        risk_score=risk3.score,
        risk_level=risk3.level,
        score_breakdown=risk3.factors,
        why_flagged="No AIS broadcast detected. | High fishing likelihood.",
        uncertainty_note="Uncertainty present due to: AIS: CACHED_HISTORICAL, MPA: CACHED_HISTORICAL",
        human_review_required=True
    )
    results.append({
        "detection": det3.model_dump(),
        "ais_match": ais3.model_dump(),
        "mpa_status": mpa3.model_dump(),
        "risk": risk3.model_dump(),
        "evidence_card": card3.model_dump(),
        "agents_analysis": generate_agent_analysis(card3).model_dump()
    })

    # --- 4. Critical Risk (Dark vessel inside MPA) ---
    det4 = SARDetection(
        id=f"det-{str(uuid.uuid4())[:8]}",
        confidence=99.9,
        bbox=BoundingBox(x_min=0, y_min=0, x_max=50, y_max=50),
        latitude=base_lat,
        longitude=base_lon
    )
    ais4 = AISMatch(match_status="no_match", source_status=DataSourceStatus.CACHED_HISTORICAL)
    mpa4 = MPAStatus(status="inside", source_status=DataSourceStatus.CACHED_HISTORICAL, mpa_name="Galapagos Marine Reserve", distance_km=0.0)
    risk4 = RiskScore(score=95, level="Critical", factors={"SAR Confidence": 25, "AIS Mismatch": 25, "Inside MPA": 30, "Fishing Likelihood": 15})
    card4 = EvidenceCard(
        detection_id=det4.id,
        model_name="YOLO-Demo",
        model_confidence=det4.confidence,
        coordinates=Coordinates(latitude=det4.latitude, longitude=det4.longitude),
        ais_status=ais4.match_status,
        ais_source_status=ais4.source_status,
        mpa_status=mpa4.status,
        mpa_name=mpa4.mpa_name,
        mpa_source_status=mpa4.source_status,
        distance_to_mpa_km=mpa4.distance_km,
        risk_score=risk4.score,
        risk_level=risk4.level,
        score_breakdown=risk4.factors,
        why_flagged="No AIS broadcast detected. | Inside MPA. | High fishing likelihood.",
        uncertainty_note="Uncertainty present due to: AIS: CACHED_HISTORICAL, MPA: CACHED_HISTORICAL",
        human_review_required=True
    )
    results.append({
        "detection": det4.model_dump(),
        "ais_match": ais4.model_dump(),
        "mpa_status": mpa4.model_dump(),
        "risk": risk4.model_dump(),
        "evidence_card": card4.model_dump(),
        "agents_analysis": generate_agent_analysis(card4).model_dump()
    })

    return results
