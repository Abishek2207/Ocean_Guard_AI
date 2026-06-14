import os
import json
from app.config import settings
from app.models.data_models import SARDetection, BoundingBox, DataSourceStatus

try:
    from ultralytics import YOLO
    import torch
    HAS_YOLO = True
except ImportError:
    HAS_YOLO = False

_model = None
_model_name = "YOLOv8-SAR"

def load_model():
    global _model
    if not HAS_YOLO:
        return False
    # Navigate from backend/app/services/sar_inference.py to ml/models/best.pt
    model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../ml/models/best.pt"))
    if os.path.exists(model_path):
        try:
            if _model is None:
                _model = YOLO(model_path)
            return True
        except Exception as e:
            print(f"Failed to load YOLO model: {e}")
            return False
    return False

def infer_sar_image(image_path: str = None) -> tuple[list[SARDetection], str, DataSourceStatus, str]:
    """
    Run YOLOv8 inference on SAR image.
    Returns (detections, model_name, source_status, message).
    """
    if load_model():
        try:
            detections = []
            if image_path and os.path.exists(image_path):
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
                                class_name=_model.names[cls] if hasattr(_model, 'names') else "vessel",
                                latitude=15.0,
                                longitude=-60.0
                            )
                        )
                return detections, _model_name, DataSourceStatus.LIVE_API, "Inference successful."
            else:
                # If no image path provided for MVP, we just return empty, no fabricated data
                return [], _model_name, DataSourceStatus.LIVE_API, "No image provided for inference."
        except Exception as e:
            return [], _model_name, DataSourceStatus.API_ERROR, str(e)

    # Strictly missing model handling
    return [], "Unknown", DataSourceStatus.MODEL_MISSING, "Place trained YOLOv8 SAR model at ml/models/best.pt."
