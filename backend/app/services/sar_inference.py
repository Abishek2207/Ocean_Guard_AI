import os
import json
from app.config import settings
from app.models.data_models import SARDetection, BoundingBox

try:
    from ultralytics import YOLO
    import torch
    HAS_YOLO = True
except ImportError:
    HAS_YOLO = False

_model = None
_model_name = "YOLOv8-Unknown"

def load_model():
    global _model, _model_name
    if not HAS_YOLO:
        return False
        
    if os.path.exists(settings.MODEL_PATH):
        try:
            if _model is None:
                _model = YOLO(settings.MODEL_PATH)
                _model_name = "YOLOv8-Custom"
            return True
        except Exception as e:
            print(f"Failed to load YOLO model: {e}")
            return False
    return False

def get_cached_sar_data() -> list[SARDetection]:
    cache_path = os.path.join(settings.CACHE_DIR, "sar_cached.json")
    if os.path.exists(cache_path):
        with open(cache_path, "r") as f:
            data = json.load(f)
            return [SARDetection(**d) for d in data.get("detections", [])]
    return []

def infer_sar_image(image_path: str = None) -> tuple[list[SARDetection], str, str]:
    """
    Run YOLOv8 inference on SAR image.
    Returns (detections, model_name, source_status).
    """
    if load_model():
        # Real inference path
        try:
            detections = []
            results = _model(image_path)
            for i, r in enumerate(results):
                boxes = r.boxes
                for j, box in enumerate(boxes):
                    b = box.xyxy[0] 
                    c = box.conf[0]
                    cls = int(box.cls[0])
                    
                    detections.append(
                        SARDetection(
                            id=f"SAR-{i}-{j}",
                            confidence=round(float(c) * 100, 2),
                            bbox=BoundingBox(x_min=float(b[0]), y_min=float(b[1]), x_max=float(b[2]), y_max=float(b[3])),
                            class_name=_model.names[cls] if hasattr(_model, 'names') else "vessel-like",
                            latitude=15.0, # Placeholder coords for the image tile center
                            longitude=-60.0
                        )
                    )
            return detections, _model_name, "LIVE_API"
        except Exception as e:
            print(f"Inference failed: {e}")
            return [], _model_name, "API_ERROR"

    # Fallback
    print("WARNING: Model not found. Returning cached historical demo detections.")
    cached = get_cached_sar_data()
    return cached, "YOLOv8-Cached-Demo", "MODEL_MISSING"
