import os

# Base paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_BASE_PATH = os.getenv("MODEL_BASE_PATH", os.path.join(BASE_DIR, "models"))

# Verification Scoring Weights
AI_VISUAL_WEIGHT = float(os.getenv("AI_VISUAL_WEIGHT", "0.50"))
AI_FEATURE_WEIGHT = float(os.getenv("AI_FEATURE_WEIGHT", "0.30"))
AI_LABEL_WEIGHT = float(os.getenv("AI_LABEL_WEIGHT", "0.20"))

# Thresholds
AI_VERIFICATION_THRESHOLD = float(os.getenv("AI_VERIFICATION_THRESHOLD", "0.90")) # 90%
AI_REVIEW_THRESHOLD = float(os.getenv("AI_REVIEW_THRESHOLD", "0.75"))            # 75%

# Device setting: 'cpu' or 'cuda'
AI_DEVICE = os.getenv("AI_DEVICE", "cpu")
