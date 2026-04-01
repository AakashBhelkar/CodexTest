# FastAPI Fraud Pattern Analyzer Microservice

Microservice to analyze return reason text and produce fraud-risk adjustment using OpenAI API.

## Endpoint

### `POST /analyze-reason`

Input JSON:

```json
{
  "return_reason": "Package arrived empty and seal looked broken"
}
```

Output JSON:

```json
{
  "risk_score_adjustment": 35,
  "explanation": "Reason includes suspicious claims (empty package, broken seal), which are correlated with fraud abuse patterns."
}
```

## Run locally

```bash
cd python_service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```
