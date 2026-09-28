import asyncio
import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import engine, async_session
from app.db.models.user import User
from app.db.models.models import Exercise
from app.core.security import get_password_hash

async def seed_data():
    async with async_session() as db:
        # Create Demo User
        hashed_pw = get_password_hash("password123")
        demo_user = User(
            email="demo@fitsync.ai",
            password_hash=hashed_pw,
            name="Sarah Jenkins",
            age=21,
            sex="Female",
            height_cm=165,
            weight_kg=60,
            goal="stay_active",
            experience="intermediate",
            diet_pref="veg",
            equipment=["yoga_mat", "dumbbells"],
            leaderboard_opt_in=True
        )
        db.add(demo_user)
        
        # Seed core MediaPipe exercises
        exercises = [
            Exercise(name="Squat", muscle_group="Legs", level="Beginner", supports_pose_coach=True),
            Exercise(name="Lunge", muscle_group="Legs", level="Beginner", supports_pose_coach=True),
            Exercise(name="Plank", muscle_group="Core", level="Intermediate", supports_pose_coach=True),
            Exercise(name="Tree Pose", muscle_group="Full Body", level="Beginner", supports_pose_coach=True),
            Exercise(name="Warrior Pose", muscle_group="Full Body", level="Beginner", supports_pose_coach=True),
            Exercise(name="Jumping Jack", muscle_group="Cardio", level="Beginner", supports_pose_coach=True),
            Exercise(name="Mountain Climber", muscle_group="Core", level="Intermediate", supports_pose_coach=True),
            Exercise(name="Crunch", muscle_group="Core", level="Beginner", supports_pose_coach=True),
            Exercise(name="Russian Twist", muscle_group="Core", level="Intermediate", supports_pose_coach=True),
            Exercise(name="Leg Raise", muscle_group="Core", level="Beginner", supports_pose_coach=True),
            Exercise(name="Push Up", muscle_group="Chest", level="Intermediate", supports_pose_coach=True),
            Exercise(name="Desk Posture", muscle_group="Back", level="Beginner", supports_pose_coach=True),
        ]
        
        for ex in exercises:
            db.add(ex)
            
        await db.commit()
        print("Database seeded successfully with Demo User and Posture Exercises!")

if __name__ == "__main__":
    asyncio.run(seed_data())
