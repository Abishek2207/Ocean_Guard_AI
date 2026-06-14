from app.models.data_models import AgentExplanations, EvidenceCard


def generate_agent_analysis(card: EvidenceCard) -> AgentExplanations:
    detection = f"The detector assigned {card.sar_confidence:.1f}% confidence to a vessel-like object. Confidence reflects model fit, not vessel identity; wakes, sea clutter, platforms, and coastline artifacts remain plausible false positives."
    ais = "AIS context was matched in the configured space/time window. This lowers dark-vessel concern but does not establish legal compliance." if card.ais_status == "matched" else "No AIS context was returned for the configured window. Reception gaps, timing, identity resolution, equipment state, and data coverage can cause a mismatch; it is not proof of illegal fishing." if card.ais_status == "no_match" else "AIS context is unknown. Verify token status, coverage, and timestamp quality before drawing conclusions."
    mpa = f"The coordinate intersects {card.mpa_name or 'the nearest MPA'}; verify boundary version and positional uncertainty." if card.mpa_status == "inside" else f"The coordinate is {card.distance_to_mpa_km} km from {card.mpa_name or 'the nearest MPA'}, inside the review buffer but outside the polygon." if card.mpa_status == "near_buffer" else f"The coordinate is outside available MPA boundaries; nearest calculated distance is {card.distance_to_mpa_km} km."
    factor_text = ", ".join(f"{name} +{value}" for name, value in card.risk_factors.items() if value)
    reasoning = f"Transparent scorer result: {card.risk_score}/100 ({card.risk_level}). Contributing weights: {factor_text or 'none above zero'}. No language-model judgment changes this score."
    reviewer = "Priority review checklist: inspect original SAR pixels; verify georeferencing and time; query wider AIS windows; compare repeat passes; confirm the current MPA rule set; document reviewer confidence. Never accuse an operator without independent corroboration." if card.risk_level in ["High", "Critical"] else "Routine review checklist: validate the detection and metadata, record data gaps, and monitor for repeat observations. No enforcement conclusion is supported."
    reasons = "\n".join(f"- {reason}" for reason in card.why_flagged)
    report = f"""# OceanGuard AI Evidence Report

**Detection:** {card.detection_id}  
**Review priority:** {card.risk_level} ({card.risk_score}/100)  
**Generated:** {card.generated_at}

## Evidence
- SAR confidence: {card.sar_confidence:.1f}%
- AIS status: {card.ais_status}
- Protected-area status: {card.mpa_status}
- Nearest MPA: {card.mpa_name or 'Unavailable'}
- Distance to boundary: {card.distance_to_mpa_km if card.distance_to_mpa_km is not None else 'Unknown'} km
- Fishing likelihood contribution: {card.fishing_likelihood}/15

## Why flagged
{reasons}

## Human review
{reviewer}

> Possible dark-fishing risk for human review only. AIS mismatch is not proof of illegal fishing.
"""
    return AgentExplanations(detection_analyst=detection, ais_intelligence=ais, mpa_geospatial=mpa, risk_reasoning=reasoning, human_reviewer=reviewer, report_markdown=report)
