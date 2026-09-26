"""Thin OpenAI wrapper for the Risk Copilot LLM phase.

Mirrors synthesis/client.py: the API key is read only server-side, and the
wrapper returns None (never raises) so callers fall back to deterministic logic.
"""
from __future__ import annotations

import json

from openai import OpenAI

from app.copilot.models import CopilotOutput
from app.copilot.prompts import (
    RESPONSE_SCHEMA,
    SYSTEM_PROMPT,
    USER_PROMPT_TEMPLATE,
)


def _client() -> OpenAI | None:
    from app.config import OPENAI_API_KEY

    if not OPENAI_API_KEY:
        return None
    return OpenAI(api_key=OPENAI_API_KEY)


def copilot_with_llm(context: dict, question: str) -> CopilotOutput | None:
    """Return an LLM-produced CopilotOutput, or None when the LLM is unavailable
    (no API key) or the response cannot be validated."""
    client = _client()
    if client is None:
        return None

    from app.config import ANALYSIS_AI_TIMEOUT, ANALYSIS_SYNTHESIS_MODEL

    try:
        prompt = USER_PROMPT_TEMPLATE.format(
            context=json.dumps(context, ensure_ascii=False),
            question=question,
            schema=RESPONSE_SCHEMA,
        )
        response = client.chat.completions.create(
            model=ANALYSIS_SYNTHESIS_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            timeout=ANALYSIS_AI_TIMEOUT,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content
        if not content:
            return None
        return CopilotOutput.model_validate_json(content)
    except Exception:
        # Any failure (auth, rate limit, malformed JSON, timeout, prompt build)
        # degrades gracefully to the deterministic fallback.
        return None
