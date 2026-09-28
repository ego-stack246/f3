from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import get_db
from app.api.deps import get_current_user
from app.db.models.user import User
from app.db.models.models import Meal
from app.schemas.nutrition import NutritionScanResult, EstimateRequest, MealCreate, MealInDB
from app.services.gemini import generate_structured_response
from google import genai
import logging
from PIL import Image
import io

logger = logging.getLogger(__name__)
router = APIRouter()

NUTRITION_SYSTEM_PROMPT = """
You are an expert nutritionist. Analyze the food provided and estimate nutritional values.
Prioritize Indian dishes (dal, sabzi, roti, rice, idli, dosa, paneer, biryani, thali).
Return portion estimates in common household units.
Confidence should be 'high', 'medium', or 'low'. If 'low', add notes asking for clarification.
"""

@router.post("/scan", response_model=NutritionScanResult)
async def scan_meal_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Invalid image format")
        
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image exceeds 5MB limit")

    try:
        image = Image.open(io.BytesIO(content))
        
        # We need to use the Gemini SDK's vision capability
        # Simplified for scaffolding
        from app.services.gemini import client, MODEL_NAME
        import json
        
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=[image, "Analyze this food and provide nutritional estimates."],
            config={
                "response_mime_type": "application/json",
                "response_schema": NutritionScanResult,
                "system_instruction": NUTRITION_SYSTEM_PROMPT
            }
        )
        return json.loads(response.text)
    except Exception as e:
        logger.error(f"Image scan failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to process image")

@router.post("/estimate", response_model=NutritionScanResult)
async def estimate_meal_text(
    request: EstimateRequest,
    current_user: User = Depends(get_current_user)
):
    result = await generate_structured_response(
        prompt=f"Estimate nutrition for: {request.text}",
        schema=NutritionScanResult,
        system_instruction=NUTRITION_SYSTEM_PROMPT
    )
    if not result:
        raise HTTPException(status_code=500, detail="Failed to generate estimate")
    return result

@router.post("/meals", response_model=MealInDB)
async def create_meal(
    meal_in: MealCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    db_meal = Meal(**meal_in.model_dump(), user_id=current_user.id)
    db.add(db_meal)
    await db.commit()
    await db.refresh(db_meal)
    return db_meal
