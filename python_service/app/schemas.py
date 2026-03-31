from pydantic import BaseModel, Field


class AnalyzeReasonRequest(BaseModel):
    return_reason: str = Field(min_length=3, max_length=2000)


class AnalyzeReasonResponse(BaseModel):
    risk_score_adjustment: int = Field(ge=-100, le=100)
    explanation: str
