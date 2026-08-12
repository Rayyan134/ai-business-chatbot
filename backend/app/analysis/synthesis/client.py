"""Thin OpenAI wrapper for the synthesis phase.

The wrapper never logs the API key and returns None instead of raising when
the LLM is unavailable, so callers can fall back to deterministic synthesis.
"""
from __future__ import annotations

import json

from openai import OpenAI

from app.analysis.synthesis.models import SynthesisOutput
from app.analysis.synthesis.prompts import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE


def _client() -> OpenAI | None:
    from app.config import OPENAI_API_KEY

    if not OPENAI_API_KEY:
        return None
    return OpenAI(api_key=OPENAI_API_KEY)


def synthesize_with_llm(context: dict) -> SynthesisOutput | None:
    """Return an LLM-produced SynthesisOutput, or None when the LLM is
    unavailable (no API key) or the response cannot be validated."""
    client = _client()
    if client is None:
        return None

    from app.config import ANALYSIS_AI_TIMEOUT, ANALYSIS_SYNTHESIS_MODEL

    prompt = USER_PROMPT_TEMPLATE.format(
        context=json.dumps(context, ensure_ascii=False)
    )
    try:
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
        return SynthesisOutput.model_validate_json(content)
    except Exception:
        # Any failure (auth, rate limit, malformed JSON, schema mismatch)
        # degrades to deterministic synthesis rather than failing the run.
        return None
