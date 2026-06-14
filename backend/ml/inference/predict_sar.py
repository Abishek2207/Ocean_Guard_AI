import argparse
import sys
from ultralytics import YOLO

def predict_on_sar(model_path, image_path):
    try:
        model = YOLO(model_path)
    except Exception as e:
        print(f"Error loading model from {model_path}: {e}")
        sys.exit(1)
        
    print(f"Running inference on {image_path}...")
    results = model(image_path)
    
    for r in results:
        print(f"Found {len(r.boxes)} detections:")
        for box in r.boxes:
            conf = float(box.conf[0])
            cls = int(box.cls[0])
            name = model.names[cls] if hasattr(model, 'names') else str(cls)
            print(f"  - {name}: {conf*100:.1f}% confidence")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=str, default="../models/best.pt")
    parser.add_argument("--image", type=str, required=True)
    args = parser.parse_args()
    
    predict_on_sar(args.model, args.image)
