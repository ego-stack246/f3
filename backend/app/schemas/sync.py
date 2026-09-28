from pydantic import BaseModel
from typing import List, Any
from datetime import datetime
from uuid import UUID

class SyncAction(BaseModel):
    client_id: UUID
    type: str # 'session', 'meal', 'checkin'
    payload: dict[str, Any]
    created_at: datetime

class SyncBatchRequest(BaseModel):
    actions: List[SyncAction]

class SyncResult(BaseModel):
    client_id: UUID
    status: str
    error: str | None = None

class SyncBatchResponse(BaseModel):
    results: List[SyncResult]
