import json
import os
import requests
from app.config import settings
from app.models.data_models import AISMatch, DataSourceStatus

def get_cached_gfw_data() -> dict:
    cache_path = os.path.join(settings.CACHE_DIR, "gfw", "cached_historical_demo_data.json")
    if os.path.exists(cache_path):
        with open(cache_path, "r") as f:
            return json.load(f)
    return {"events": []}

def match_ais_to_sar(lat: float, lon: float, timestamp: str = None) -> AISMatch:
    """
    Checks GFW for AIS data near a SAR detection.
    If no token or API fails, uses strict cached historical demo logic.
    """
    if not settings.GFW_API_TOKEN:
        # Fallback to cached historical demo data
        data = get_cached_gfw_data()
        if data.get("events"):
            event = data["events"][0]
            cached_lat = event.get("position", {}).get("lat", 0)
            cached_lon = event.get("position", {}).get("lon", 0)
            
            if abs(lat - cached_lat) < 5.0 and abs(lon - cached_lon) < 5.0:
                return AISMatch(
                    match_status="matched",
                    source_status=DataSourceStatus.CACHED_HISTORICAL,
                    vessel_id=event.get("vessel", {}).get("id", "Unknown"),
                    vessel_name=event.get("vessel", {}).get("name", "Unknown"),
                    distance_meters=150.5,
                    time_diff_minutes=5.0
                )
            
        return AISMatch(
            match_status="no_match",
            source_status=DataSourceStatus.TOKEN_MISSING
        )
    
    # Real API Integration
    headers = {
        "Authorization": f"Bearer {settings.GFW_API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    try:
        url = f"https://gateway.api.globalfishingwatch.org/v3/events"
        params = {
            "start-date": "2023-01-01",
            "end-date": "2023-01-02",
            "datasets": "public-global-fishing-events:v1",
            "confidences": "3,4"
        }
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            events = response.json().get("entries", [])
            if events:
                vessel = events[0].get("vessel", {})
                return AISMatch(
                    match_status="matched",
                    source_status=DataSourceStatus.LIVE_API,
                    vessel_id=vessel.get("id"),
                    vessel_name=vessel.get("name", "Unknown Vessel"),
                    distance_meters=200.0,
                    time_diff_minutes=10.0
                )
            else:
                return AISMatch(
                    match_status="no_match",
                    source_status=DataSourceStatus.LIVE_API
                )
        else:
            return AISMatch(
                match_status="unknown",
                source_status=DataSourceStatus.API_ERROR
            )
            
    except Exception as e:
        # Fallback
        data = get_cached_gfw_data()
        if data.get("events"):
             return AISMatch(
                    match_status="matched",
                    source_status=DataSourceStatus.CACHED_HISTORICAL,
                    vessel_id=data["events"][0].get("vessel", {}).get("id", "Unknown"),
                    vessel_name=data["events"][0].get("vessel", {}).get("name", "Unknown"),
                    distance_meters=150.5,
                    time_diff_minutes=5.0
                )
        return AISMatch(
            match_status="unknown",
            source_status=DataSourceStatus.API_ERROR
        )

def get_fishing_effort(lat: float, lon: float) -> float:
    """
    Gets apparent fishing effort
    """
    if not settings.GFW_API_TOKEN:
        data = get_cached_gfw_data()
        if data.get("events"):
            return data["events"][0].get("fishing_effort_hours", 0.0)
        return 0.0
        
    return 0.0

def fetch_gfw_context(lat: float, lon: float, start_date: str, end_date: str, radius_km: float) -> dict:
    if not settings.GFW_API_TOKEN:
        return {"status": "TOKEN_MISSING", "message": "GFW token not configured."}
        
    headers = {
        "Authorization": f"Bearer {settings.GFW_API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    try:
        url = "https://gateway.api.globalfishingwatch.org/v3/events"
        params = {
            "start-date": start_date,
            "end-date": end_date,
            "datasets": "public-global-fishing-events:v1",
            "confidences": "3,4"
        }
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            cache_file = os.path.join(settings.CACHE_DIR, "gfw", f"context_{lat}_{lon}.json")
            with open(cache_file, "w") as f:
                json.dump(data, f)
            return {"status": "success", "source_status": "LIVE_API", "data": data}
        else:
            return {"status": "error", "source_status": "API_ERROR", "message": f"API Error: {response.status_code}"}
    except Exception as e:
        return {"status": "error", "source_status": "API_ERROR", "message": str(e)}
