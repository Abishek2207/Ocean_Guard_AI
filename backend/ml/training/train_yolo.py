from ultralytics import YOLO

def train_sar_model():
    print("Loading base YOLOv8n model...")
    model = YOLO("yolov8n.pt") # load a pretrained model
    
    print("Starting training on SAR dataset...")
    # This requires a data.yaml file pointing to the prepared dataset
    # model.train(data="data.yaml", epochs=100, imgsz=640, device="cpu")
    print("Training logic defined. Create data.yaml and run with valid dataset.")

if __name__ == "__main__":
    train_sar_model()
