# Offline AI Visual Verification Microservice

This Python microservice powers the **Offline AI Visual Verification Engine** for the Legal Metrology Department (ScaleGuard).

## 🛠️ Stack & Architecture
- **Framework:** FastAPI + Uvicorn
- **OCR Engine:** PaddleOCR PP-OCRv5 (Offline text & Registration ID extraction)
- **Visual Embedding:** DINOv2 ViT-S/14 (Deep visual feature extraction)
- **Feature Matching:** OpenCV SIFT + FlannMatcher + RANSAC homography inliers
- **Scoring Engine:** Multi-signal weighting (50% DINOv2 + 30% SIFT + 20% OCR)

---

## 📋 Manual Installation Instructions (For User)

Run these steps in your terminal inside the `WebBasedApp/ai-service` folder:

### Step 1: Navigate to the `ai-service` directory
```bash
cd WebBasedApp/ai-service
```

### Step 2: Install Python dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Run the AI Microservice
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The service will start listening on `http://127.0.0.1:8000`! You can verify it by opening `http://127.0.0.1:8000/docs` in your browser.
