import cv2
import numpy as np

class FeatureService:
    def __init__(self):
        # Initialize SIFT detector with ORB fallback
        try:
            self.sift = cv2.SIFT_create(nfeatures=1000)
            self.algorithm = "SIFT"
        except Exception:
            self.sift = cv2.ORB_create(nfeatures=1000)
            self.algorithm = "ORB"

    def match_features(self, image_bytes1: bytes, image_bytes2: bytes) -> tuple[float, dict]:
        """
        Uses SIFT + Lowe's ratio test + RANSAC homography to compute local geometric similarity.
        Returns: (feature_score, metadata)
        """
        nparr1 = np.frombuffer(image_bytes1, np.uint8)
        nparr2 = np.frombuffer(image_bytes2, np.uint8)

        img1 = cv2.imdecode(nparr1, cv2.IMREAD_GRAYSCALE)
        img2 = cv2.imdecode(nparr2, cv2.IMREAD_GRAYSCALE)

        if img1 is None or img2 is None:
            return 0.0, {"error": "Invalid image format"}

        # Resize large images for fast processing
        img1 = cv2.resize(img1, (640, 480))
        img2 = cv2.resize(img2, (640, 480))

        kp1, des1 = self.sift.detectAndCompute(img1, None)
        kp2, des2 = self.sift.detectAndCompute(img2, None)

        if des1 is None or des2 is None or len(des1) < 4 or len(des2) < 4:
            return 0.0, {
                "algorithm": self.algorithm,
                "keypoints1": len(kp1) if kp1 else 0,
                "keypoints2": len(kp2) if kp2 else 0,
                "goodMatches": 0,
                "ransacInliers": 0,
            }

        # FLANN Matcher
        FLANN_INDEX_KDTREE = 1
        index_params = dict(algorithm=FLANN_INDEX_KDTREE, trees=5)
        search_params = dict(checks=50)

        try:
            flann = cv2.FlannBasedMatcher(index_params, search_params)
            matches = flann.knnMatch(des1, des2, k=2)
        except Exception:
            bf = cv2.BFMatcher()
            matches = bf.knnMatch(des1, des2, k=2)

        # Apply Lowe's ratio test
        good_matches = []
        for m_n in matches:
            if len(m_n) == 2:
                m, n = m_n
                if m.distance < 0.75 * n.distance:
                    good_matches.append(m)

        ransac_inliers = 0
        inlier_ratio = 0.0

        if len(good_matches) >= 4:
            src_pts = np.float32([kp1[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
            dst_pts = np.float32([kp2[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)

            _, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
            if mask is not None:
                ransac_inliers = int(np.sum(mask))
                inlier_ratio = float(ransac_inliers) / len(good_matches)

        # Calculate normalized feature score [0.0, 1.0]
        # Benchmark: 30+ RANSAC inliers = strong geometric correspondence (100% score)
        feature_score = min(1.0, ransac_inliers / 30.0)

        metadata = {
            "algorithm": self.algorithm,
            "keypoints1": len(kp1),
            "keypoints2": len(kp2),
            "goodMatches": len(good_matches),
            "ransacInliers": ransac_inliers,
            "inlierRatio": round(inlier_ratio, 4),
        }

        return round(feature_score, 4), metadata

feature_service = FeatureService()
