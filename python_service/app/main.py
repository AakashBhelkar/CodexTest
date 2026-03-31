from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv

from .openai_service import OpenAIReasonAnalyzer
from .schemas import AnalyzeReasonRequest, AnalyzeReasonResponse

load_dotenv()

app = FastAPI(title="Return Reason Fraud Analyzer", version="1.0.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/analyze-reason", response_model=AnalyzeReasonResponse)
def analyze_reason(payload: AnalyzeReasonRequest) -> AnalyzeReasonResponse:
    try:
        analyzer = OpenAIReasonAnalyzer()
        result = analyzer.analyze(payload.return_reason)
        return AnalyzeReasonResponse(**result)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception:
        raise HTTPException(status_code=500, detail="Unexpected analysis error")
