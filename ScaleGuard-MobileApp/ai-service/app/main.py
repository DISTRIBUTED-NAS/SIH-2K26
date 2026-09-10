from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import (
    ExtractIdResponse,
    VerificationResponse,
    HealthResponse,
    LLMSummaryRequest,
    LLMSummaryResponse,
    LLMQueryRequest,
    LLMQueryResponse
)
from app.services.ocr_service import ocr_service
from app.services.verification_service import verification_service
from app.services.llm_service import llm_service
from app.config import AI_DEVICE

app = FastAPI(
    title="Offline AI & Local LLM Metrology Service",
    description="Offline OCR (Paddle/EasyOCR) + DINOv2 Visual Embeddings + SIFT/RANSAC Feature Matching + Local LLM Legal Assistant",
    version="2.0.0"
)

# Enable CORS for local client apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ai/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="ONLINE",
        modelsLoaded={
            "ocr": ocr_service.easy_ocr_reader is not None,
            "embedding": True,
            "featureMatcher": True,
            "llm": llm_service.is_ollama_available()
        },
        device=AI_DEVICE
    )

@app.post("/ai/extract-id", response_model=ExtractIdResponse)
async def extract_registration_id(image: UploadFile = File(...)):
    try:
        contents = await image.read()
        reg_id, conf, raw_text = ocr_service.extract_registration_id(contents)
        return ExtractIdResponse(
            registrationId=reg_id,
            ocrConfidence=round(conf, 2),
            rawText=raw_text
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR Processing Error: {str(e)}")

@app.post("/ai/verify", response_model=VerificationResponse)
async def verify_instrument(
    current_image: UploadFile = File(...),
    registered_image: UploadFile = File(...),
    expected_registration_id: str = Form(None)
):
    try:
        current_bytes = await current_image.read()
        registered_bytes = await registered_image.read()

        result = verification_service.verify_instrument(
            current_image_bytes=current_bytes,
            registered_image_bytes=registered_bytes,
            expected_registration_id=expected_registration_id
        )
        return VerificationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Verification Error: {str(e)}")

@app.post("/llm/summarize-inspection", response_model=LLMSummaryResponse)
async def summarize_inspection(req: LLMSummaryRequest):
    try:
        result = llm_service.generate_inspection_summary(req.dict())
        return LLMSummaryResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Summarization Error: {str(e)}")

@app.post("/llm/assistant-query", response_model=LLMQueryResponse)
async def assistant_query(req: LLMQueryRequest):
    try:
        context_dict = req.officerContext.dict() if req.officerContext else None
        result = llm_service.query_metrology_assistant(req.query, context_dict)
        return LLMQueryResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Assistant Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
