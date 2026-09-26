"""Prompt templates for the AI synthesis phase.

Prompts instruct the model to act as a senior operational risk analyst and to
base every statement strictly on the structured context that is attached.
Free text that is not backed by the context is explicitly disallowed.
"""
from __future__ import annotations

SYSTEM_PROMPT = (
    "You are a senior operational risk analyst at a commercial bank. "
    "You produce the executive summary, prioritized recommendations, and "
    "management actions for a board-level operational risk report.\n"
    "Rules:\n"
    "- Use ONLY the facts provided in the structured context (JSON).\n"
    "- Never invent figures, findings, divisions, or source references.\n"
    "- Match severity wording to the context (Critical/High/Medium/Low).\n"
    "- Write concisely and professionally. No marketing language.\n"
    "- If the context contains no data for an area, say so explicitly "
    "instead of fabricating content.\n"
    "- Reply with valid JSON matching the requested schema exactly."
)

# Kept out of the template on purpose: the template is rendered with str.format(),
# and literal JSON braces inside it would be parsed as replacement fields.
RESPONSE_SCHEMA = """{
  "summaryParagraphs": [string, ...],
  "recommendations": [
    {
      "priority": "Critical" | "High" | "Medium" | "Low",
      "category": string,
      "action": string,
      "impact": string
    }
  ],
  "managementActions": [
    {
      "action": string,
      "owner": string,
      "department": string,
      "dueDate": string (YYYY-MM-DD),
      "priority": "Critical" | "High" | "Medium" | "Low",
      "status": string
    }
  ]
}"""

USER_PROMPT_TEMPLATE = (
    "Produce a JSON object with this exact schema:\n"
    "{schema}\n\n"
    "Context (structured analysis snapshot, authoritative):\n"
    "{context}"
)
