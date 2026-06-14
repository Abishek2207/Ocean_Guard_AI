# OceanGuard AI - Deployment Guide

This guide details exactly how to deploy the OceanGuard AI platform to production using **Vercel** for the Next.js frontend and **Render** for the FastAPI Python backend.

## 1. Local Development (Pre-Deployment Verification)

Before deploying, you can verify the platform locally:

### Start the Backend
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate your virtual environment and install dependencies (if not already done):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *The backend will run on `http://localhost:8000`*

### Start the Frontend
1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:3000`*

---

## 2. Deploying the Backend (Render)

We recommend **Render** for the Python backend because it easily handles FastAPI and provides a free tier.

1. Create a new **Web Service** on [Render.com](https://render.com/).
2. Connect your GitHub repository.
3. Configure the service:
   - **Name**: `oceanguard-ai-backend`
   - **Root Directory**: `backend` (Important!)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add the following **Environment Variables** in the Render dashboard:
   - `GFW_API_TOKEN` = `[Your Global Fishing Watch Token]` (Leave blank to use cached demo data)
   - `PROTECTED_PLANET_TOKEN` = `[Your Protected Planet Token]` (Leave blank to use cached demo data)
5. Click **Create Web Service**. 
6. Once deployed, Render will give you a URL like `https://oceanguard-ai-backend.onrender.com`. Copy this URL.

---

## 3. Deploying the Frontend (Vercel)

We recommend **Vercel** for the Next.js frontend.

1. Go to [Vercel.com](https://vercel.com/) and create a new Project.
2. Import your GitHub repository.
3. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend` (Important!)
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`
4. Add the following **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = `https://oceanguard-ai-backend.onrender.com` (Use the Render URL you copied in the previous step. **Do not include a trailing slash.**)
5. Click **Deploy**.

---

## 4. Final Verification
1. Navigate to your Vercel frontend URL (e.g., `https://oceanguard-ai.vercel.app`).
2. Click **Enter Mission Control**.
3. In the top right corner, the Data Status badge should say **CACHED HISTORICAL** (or **LIVE API** if you provided tokens). It should **NOT** say "OFFLINE" or display the red error overlay.
4. Click **Run Vessel Detector** to verify that the frontend can successfully communicate with the deployed Render backend.
