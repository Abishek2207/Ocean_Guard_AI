# OceanGuard AI

A human-in-the-loop SDG 14 platform that detects possible dark fishing risk near Marine Protected Areas using SAR satellite vessel detection, AIS data, and explainable AI.

## Ethical Limitation Statement
This system assists human analysts by flagging *possible* dark fishing risk based on aggregated data. It does not provide legal proof of illegal fishing. Human review is strictly required before any enforcement action is taken.

## Project Structure
- `frontend/`: Next.js frontend (Tailwind CSS, MapLibre)
- `backend/`: FastAPI backend (Python, YOLOv8 inference, Geospatial tools)

## Setup Instructions

### Backend
1. `cd backend`
2. Create and activate a virtual environment: `python -m venv venv` and `source venv/bin/activate` (or `.\venv\Scripts\activate` on Windows)
3. Install dependencies: `pip install -r requirements.txt` (or install manually: fastapi, uvicorn, ultralytics, torch, geopandas, shapely, rasterio, pyproj, requests, python-dotenv, pytest)
4. Copy `.env.example` to `.env` and fill in API tokens.
   - **GFW_API_TOKEN**: Register at Global Fishing Watch to get an API token.
   - **PROTECTED_PLANET_TOKEN**: Register at Protected Planet to get an API token.
   - If tokens are omitted, the system will use strict cached historical fallback data.
5. Place your YOLOv8 model at `backend/ml/models/best.pt`. 
   - If omitted, the system will return `MODEL_MISSING` and use cached SAR detections.
6. Run server: `uvicorn app.main:app --reload`

### ML Pipeline
The `ml/` directory contains tools for model training and inference:
- `python ml/training/prepare_yolo_dataset.py --annotations path/to/annotations.json`: Converts SARFish/xView3 annotations to YOLO format.
- `python ml/training/train_yolo.py`: Trains the YOLOv8 model.
- `python ml/inference/predict_sar.py --image path/to/image.png`: Runs CLI inference on a new SAR tile.

### Frontend
1. `cd frontend`
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Open `http://localhost:3000`

## Features
- SAR Vessel Detection (YOLOv8)
- AIS Data Matching (Global Fishing Watch API integration)
- MPA Boundary Overlay (Protected Planet API integration)
- Risk Scoring Engine
- Multi-Agent AI Explanation Panels
- Markdown Evidence Report Export
- Transparent Data Source Tracking (Live API vs Cached Historical Demo Data)
