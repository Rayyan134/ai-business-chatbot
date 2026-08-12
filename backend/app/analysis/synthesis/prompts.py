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

USER_PROMPT_TEMPLATE = (
    "Produce a JSON object with this exact schema:\n"
    "{\n"
    '  "summaryParagraphs": [string, ...],\n'
    '  "recommendations": [\n'
    "    {\n"
    '      "priority": "Critical" | "High" | "Medium" | "Low",\n'
    '      "category": string,\n'
    '      "action": string,\n'
    '      "impact": string\n'
    "    }\n"
    "  ],\n"
    '  "managementActions": [\n'
    "    {\n"
    '      "action": string,\n'
    '      "owner": string,\n'
    '      "department": string,\n'
    '      "dueDate": string (YYYY-MM-DD),\n'
    '      "priority": "Critical" | "High" | "Medium" | "Low",\n'
    '      "status": string\n'
    "    }\n"
    "  ]\n"
    "}\n\n"
    "Context (structured analysis snapshot, authoritative):\n"
    "{context}"
)
