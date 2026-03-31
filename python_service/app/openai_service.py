import json
import os
from typing import Any

from openai import OpenAI

PROMPT = """
You are a fraud analyst for ecommerce return requests.
Analyze the provided return reason text and detect possible fraud indicators.

Return strict JSON only in this exact format:
{
  "risk_score_adjustment": <integer between -100 and 100>,
  "explanation": "<short explanation>"
}

Guidelines:
- Positive score = increase fraud risk.
- Negative score = decrease fraud risk.
- Be conservative, concise, and explain key signals.
""".strip()


class OpenAIReasonAnalyzer:
    def __init__(self) -> None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY is required")

        self.client = OpenAI(api_key=api_key)
        self.model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")

    def analyze(self, return_reason: str) -> dict[str, Any]:
        response = self.client.responses.create(
            model=self.model,
            input=[
                {"role": "system", "content": PROMPT},
                {
                    "role": "user",
                    "content": f"Return reason: {return_reason}",
                },
            ],
            temperature=0,
        )

        raw_text = response.output_text.strip()

        try:
            parsed = json.loads(raw_text)
        except json.JSONDecodeError as exc:
            raise ValueError("Model did not return valid JSON") from exc

        if "risk_score_adjustment" not in parsed or "explanation" not in parsed:
            raise ValueError("Model response missing required fields")

        return {
            "risk_score_adjustment": int(parsed["risk_score_adjustment"]),
            "explanation": str(parsed["explanation"]),
        }
