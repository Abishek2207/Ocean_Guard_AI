from pathlib import Path
import os
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_DIR / ".env")

class Settings:
    app_name = "OceanGuard AI API"
    GFW_API_TOKEN = os.getenv("GFW_API_TOKEN", "")
    PROTECTED_PLANET_TOKEN = os.getenv("PROTECTED_PLANET_TOKEN", "")
    MODEL_PATH = os.getenv("MODEL_PATH", str(BACKEND_DIR / "ml" / "models" / "best.pt"))
    CACHE_DIR = os.getenv("CACHE_DIR", str(BACKEND_DIR / "data" / "cached_api_responses"))
    upload_dir = Path(os.getenv("UPLOAD_DIR", str(BACKEND_DIR / "data" / "uploads")))

settings = Settings()
settings.upload_dir.mkdir(parents=True, exist_ok=True)
