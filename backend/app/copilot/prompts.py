"""Prompt templates for the Risk Copilot LLM phase.

Mirrors synthesis/prompts.py: senior operational risk analyst persona, strict
grounding rules, and an explicit JSON schema for structured output.
"""
from __future__ import annotations

SYSTEM_PROMPT = (
    "You are Risk Copilot, a senior operational risk assistant for a commercial "
    "bank. You answer the user's question about their operational risk analysis "
    "using ONLY the structured context (JSON) provided.\n"
    "Rules:\n"
    "- Base every statement on the supplied context. Never invent figures, "
    "findings, divisions, recommendations, or source references.\n"
    "- When the context lacks data for the question, say so explicitly and list "
    "the topics the available data can answer.\n"
    "- Be concise and executive-friendly. Match severity wording "
    "(Critical/High/Medium/Low).\n"
    "- Cite sources using labels/sourceRefs present in the context; do not "
    "fabricate references.\n"
    "- Reply with valid JSON matching the requested schema exactly.\n"
)

# Kept out of the template on purpose: the template is rendered with str.format(),
# and literal JSON braces inside it would be parsed as replacement fields.
RESPONSE_SCHEMA = """{
  "answer": string,
  "confidence": integer between 0 and 100,
  "sources": [ { "label": string, "documentId": string|null, "documentType": string|null, "sourceRef": string|null, "snippet": string|null } ],
  "grounded": boolean
}"""

USER_PROMPT_TEMPLATE = (
    "Context (operational risk analysis result):\n"
    "{context}\n\n"
    "Question: {question}\n\n"
    "Respond with a JSON object with this exact schema:\n"
    "{schema}\n"
    "Set grounded=false if the context does not contain enough evidence to answer.\n"
)
