from app.services.ocr_service import ocr_service
from app.services.embedding_service import embedding_service
from app.services.feature_service import feature_service
from app.config import (
    AI_VISUAL_WEIGHT,
    AI_FEATURE_WEIGHT,
    AI_LABEL_WEIGHT,
    AI_VERIFICATION_THRESHOLD,
    AI_REVIEW_THRESHOLD
)

class VerificationService:
    def verify_instrument(
        self,
        current_image_bytes: bytes,
        registered_image_bytes: bytes,
        expected_registration_id: str = None
    ) -> dict:
        """
        Runs Multi-Signal Verification:
        1. OCR Text & Registration ID Matching
        2. DINOv2 Deep Visual Embedding Similarity
        3. SIFT / RANSAC Geometric Keypoint Feature Matching
        4. Multi-Signal Score Weighting & Thresholding
        """
        # Signal 1: OCR & Label
        ocr_id, ocr_conf, raw_text = ocr_service.extract_registration_id(current_image_bytes)

        label_score = 0.0
        if expected_registration_id and ocr_id:
            if ocr_id.strip().upper() == expected_registration_id.strip().upper():
                label_score = 1.0
            elif expected_registration_id.strip().upper() in raw_text.upper():
                label_score = 0.9
            else:
                label_score = 0.4
        elif ocr_id or raw_text:
            label_score = 0.85

        # Signal 2: DINOv2 Deep Visual Similarity
        visual_score = embedding_service.calculate_visual_similarity(
            current_image_bytes, registered_image_bytes
        )

        # Signal 3: SIFT / RANSAC Geometric Feature Match
        feature_score, feature_meta = feature_service.match_features(
            current_image_bytes, registered_image_bytes
        )

        # Calculate Final Weighted Score
        final_score = (
            (AI_VISUAL_WEIGHT * visual_score) +
            (AI_FEATURE_WEIGHT * feature_score) +
            (AI_LABEL_WEIGHT * label_score)
        )
        final_score = round(final_score, 4)

        # Decision Threshold Logic (90% required for automatic VERIFIED)
        if final_score >= AI_VERIFICATION_THRESHOLD:
            decision = "VERIFIED"
        elif final_score >= AI_REVIEW_THRESHOLD:
            decision = "MANUAL_REVIEW"
        else:
            decision = "MISMATCH"

        return {
            "registrationId": ocr_id or expected_registration_id,
            "ocrConfidence": round(ocr_conf, 2),
            "visualScore": round(visual_score, 4),
            "featureScore": round(feature_score, 4),
            "labelScore": round(label_score, 4),
            "finalScore": final_score,
            "threshold": AI_VERIFICATION_THRESHOLD,
            "decision": decision,
            "evidence": {
                "extractedOcrId": ocr_id,
                "rawOcrText": raw_text,
                **feature_meta
            }
        }

verification_service = VerificationService()
