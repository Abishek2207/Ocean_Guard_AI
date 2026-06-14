from app.models.data_models import EvidenceCard, AgentExplanations

def generate_markdown_report(card: EvidenceCard, analysis: AgentExplanations) -> str:
    """
    Generates a Markdown report from an evidence card.
    """
    report = f"""# OceanGuard AI Evidence Report
**Detection ID:** {card.detection_id}
**Risk Level:** {card.risk_level} ({card.risk_score}/100)

> [!WARNING]
> {card.legal_safety_note}

## Data Source Disclosures
- **SAR Model:** {card.sar_model_name}
- **AIS Data Status:** {card.ais_source_status}
- **MPA Data Status:** {card.mpa_source_status}

## Detection Details
- **SAR Confidence:** {card.sar_model_confidence}%
- **AIS Match:** {card.ais_status}
- **MPA Status:** {card.mpa_status} (Distance: {card.distance_to_mpa_km}km)
- **Fishing Likelihood:** {card.fishing_likelihood}/15

## Flag Reason
{card.why_flagged}

## Multi-Agent Analysis
### Detection Analyst
{analysis.detection_analyst}

### AIS Intelligence
{analysis.ais_intelligence}

### MPA Geospatial
{analysis.mpa_geospatial}

### Risk Reasoning
{analysis.risk_reasoning}

### Human Reviewer
{analysis.human_reviewer}
"""
    return report
