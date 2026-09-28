from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.db.models.user import User
from app.schemas.sync import SyncBatchRequest, SyncBatchResponse, SyncResult
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/batch", response_model=SyncBatchResponse)
async def sync_batch(
    request: SyncBatchRequest,
    current_user: User = Depends(get_current_user)
):
    results = []
    for action in request.actions:
        try:
            # Here we would route the action.type to the correct service
            # e.g., if action.type == 'session', call create_session logic
            # This allows airplane mode users to dump their offline queues when they reconnect
            results.append(SyncResult(client_id=action.client_id, status="success"))
        except Exception as e:
            logger.error(f"Failed to sync action {action.client_id}: {e}")
            results.append(SyncResult(client_id=action.client_id, status="error", error=str(e)))
            
    return SyncBatchResponse(results=results)
