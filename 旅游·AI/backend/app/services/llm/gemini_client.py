import json
import re
from typing import Any

import httpx

from app.core.config import settings
from app.core.secrets import decrypt_secret


def resolve_gemini_api_key() -> str:
    if settings.gemini_api_key:
        return settings.gemini_api_key
    if settings.gemini_api_key_encrypted and settings.app_encryption_key:
        return decrypt_secret(settings.gemini_api_key_encrypted, settings.app_encryption_key)
    return ""


def _extract_json(text: str) -> dict[str, Any] | None:
    text = text.strip()
    try:
        parsed = json.loads(text)
        if isinstance(parsed, dict):
            return parsed
    except Exception:
        pass

    m = re.search(r"\{[\s\S]*\}", text)
    if not m:
        return None
    try:
        parsed = json.loads(m.group(0))
        return parsed if isinstance(parsed, dict) else None
    except Exception:
        return None


def generate_json_with_gemini(prompt: str, temperature: float = 0.35) -> dict[str, Any] | None:
    api_key = resolve_gemini_api_key()
    if not api_key:
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.gemini_model}:generateContent"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": temperature,
            "responseMimeType": "application/json",
        },
    }

    try:
        with httpx.Client(timeout=20) as client:
            resp = client.post(url, params={"key": api_key}, json=payload)
            resp.raise_for_status()
        data = resp.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        return _extract_json(text)
    except Exception:
        return None
