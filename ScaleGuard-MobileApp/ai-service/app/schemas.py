from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class ExtractIdResponse(BaseModel):
    registrationId: Optional[str] = None
    ocrConfidence: float
    rawText: str
    bbox: Optional[list] = None

class VerificationResponse(BaseModel):
    registrationId: Optional[str] = None
    ocrConfidence: float
    visualScore: float
    featureScore: float
    labelScore: float
    finalScore: float
    decision: str  # VERIFIED, MANUAL_REVIEW, MISMATCH
    threshold: float = 0.90
    evidence: Dict[str, Any]

class HealthResponse(BaseModel):
    status: str
    modelsLoaded: Dict[str, bool]
    device: str

class LLMSummaryRequest(BaseModel):
    inspectionId: str
    applicationId: Optional[str] = "SC-1024"
    businessName: Optional[str] = "Establishment"
    instrumentName: Optional[str] = "Weighing Scale"
    instrumentModel: Optional[str] = "Standard Model"
    checklist: Optional[List[Dict[str, Any]]] = []
    measurements: Optional[List[Dict[str, Any]]] = []
    aiScore: Optional[float] = 94.5
    aiDecision: Optional[str] = "VERIFIED"

class LLMSummaryResponse(BaseModel):
    summary: str
    modelUsed: str
    source: str

class OfficerContext(BaseModel):
    officerName: Optional[str] = "Jane Doe"
    officerId: Optional[str] = "OFFICER001"
    circle: Optional[str] = "Andhra Pradesh Circle"
    assigned: Optional[int] = 4
    pending: Optional[int] = 2
    inProgress: Optional[int] = 1
    completed: Optional[int] = 1
    todayCases: Optional[List[Dict[str, Any]]] = []

class LLMQueryRequest(BaseModel):
    query: str
    officerContext: Optional[OfficerContext] = None

class LLMQueryResponse(BaseModel):
    query: str
    answer: str
    modelUsed: str
    source: str
