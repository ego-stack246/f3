try:
    from google import genai
except ImportError:
    genai = None

from pydantic import BaseModel
from typing import Any
from app.core.config import settings
import json
import logging

logger = logging.getLogger(__name__)
client = genai.Client(api_key=settings.GEMINI_API_KEY) if (genai and getattr(settings, "GEMINI_API_KEY", None)) else None
MODEL_NAME = "gemini-2.5-flash"

async def generate_structured_response(prompt: str, schema: BaseModel, system_instruction: str = None) -> Any:
    """Wrapper to call Gemini and get guaranteed JSON output matching a Pydantic schema."""
    if not client:
        return None
    try:
        config = {
            "response_mime_type": "application/json",
            "response_schema": schema
        }
        if system_instruction:
            config["system_instruction"] = system_instruction
            
        # GenAI SDK runs synchronously by default in many contexts, we wrap it
        # Actually in production we should use the async client if available or threadpool
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=config,
        )
        return json.loads(response.text)
    except Exception as e:
        logger.error(f"Gemini API Error: {e}")
        return None
