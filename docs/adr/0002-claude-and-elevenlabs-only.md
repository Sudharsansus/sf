# 0002. Claude for all text AI, ElevenLabs for voice

Status: Accepted · Date: 2026-10-21

## Context
The stack used Claude, OpenAI, Groq and Replicate with a fallback chain.

## Decision
Use Claude (via `@isaii/ai-gateway`) for every text task with structured outputs, and ElevenLabs for TTS/STT. Thumbnails are designed by Claude and rendered in code.

## Consequences
One vendor relationship per modality, schema-validated outputs, simpler ops. The gateway and voice interfaces keep the door open for other providers (e.g. Sarvam for Indic voice).
