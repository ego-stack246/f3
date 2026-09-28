from pydantic import BaseModel
from typing import Optional

class ChatMessageRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
