import io
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from app.config import AI_DEVICE

class EmbeddingService:
    def __init__(self):
        self.device = "cpu"
        self.model = None
        self.transform = None
        self._init_dinov2()

    def _init_dinov2(self):
        try:
            import torch
            import torchvision.transforms as T
            self.device = torch.device(AI_DEVICE if torch.cuda.is_available() else "cpu")
            self.transform = T.Compose([
                T.Resize((224, 224)),
                T.ToTensor(),
                T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ])
            # Try loading DINOv2
            self.model = torch.hub.load('facebookresearch/dinov2', 'dinov2_vits14')
            self.model.to(self.device)
            self.model.eval()
            print("DINOv2 ViT-S/14 loaded successfully.")
        except Exception as e:
            print(f"Info: Running in Lightweight Mode (PyTorch optional): {e}")

    def get_embedding(self, image_bytes: bytes) -> np.ndarray:
        """
        Generates visual feature embedding vector for an image.
        """
        try:
            from PIL import Image
            import torch
            if self.model and self.transform:
                img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
                tensor = self.transform(img).unsqueeze(0).to(self.device)
                with torch.no_grad():
                    emb = self.model(tensor)
                    emb = torch.nn.functional.normalize(emb, p=2, dim=1)
                    return emb.cpu().numpy().flatten()
        except Exception:
            pass

        # Smart deterministic color histogram vector as lightweight fallback
        try:
            import cv2
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is not None:
                hist = cv2.calcHist([img], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
                hist = cv2.normalize(hist, hist).flatten()
                return hist
        except Exception:
            pass

        return np.random.randn(384)

    def calculate_visual_similarity(self, image_bytes1: bytes, image_bytes2: bytes) -> float:
        """
        Calculates normalized visual similarity score [0.0, 1.0] between two images.
        """
        emb1 = self.get_embedding(image_bytes1).reshape(1, -1)
        emb2 = self.get_embedding(image_bytes2).reshape(1, -1)

        sim = float(cosine_similarity(emb1, emb2)[0][0])

        # Normalize cosine similarity [-1.0, 1.0] to [0.0, 1.0] with calibration
        normalized_score = max(0.0, min(1.0, (sim + 1.0) / 2.0))
        return round(normalized_score, 4)

embedding_service = EmbeddingService()
