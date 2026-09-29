import asyncio
import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.db.base import Base
from app.db.session import engine, async_session
from app.db.models.user import User
from app.db.models.models import Exercise, WorkoutSession, LeaderboardScore, Post, PostLike, PostComment, UserFollow, Challenge, Story
from app.core.security import get_password_hash
from app.services.leaderboard_service import LeaderboardService
from app.schemas.leaderboard import WorkoutCompleteRequest

async def seed_data():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        # 1. Seed core MediaPipe exercises if none exist
        res = await db.execute(select(Exercise))
        existing_exercises = res.scalars().all()
        if not existing_exercises:
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
                Exercise(name="Dumbbell Shrug", muscle_group="Trapezius", level="Beginner", supports_pose_coach=True),
                Exercise(name="Barbell Shrug", muscle_group="Trapezius", level="Intermediate", supports_pose_coach=True),
                Exercise(name="Scapular Pull-Up", muscle_group="Trapezius", level="Intermediate", supports_pose_coach=True),
            ]
            for ex in exercises:
                db.add(ex)
            await db.commit()

        # 2. Seed realistic users
        hashed_pw = get_password_hash("password123")
        users_config = [
            {
                "email": "demo@fitsync.ai",
                "name": "Sarah Jenkins",
                "username": "sarah_j",
                "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
                "age": 24,
                "sex": "Female",
                "goal": "stay_active",
                "experience": "intermediate",
                "leaderboard_opt_in": True,
            },
            {
                "email": "marcus@fitsync.ai",
                "name": "Marcus Chen",
                "username": "marcus_c",
                "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                "age": 28,
                "sex": "Male",
                "goal": "build_muscle",
                "experience": "advanced",
                "leaderboard_opt_in": True,
            },
            {
                "email": "priya@fitsync.ai",
                "name": "Priya Sharma",
                "username": "priya_s",
                "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                "age": 26,
                "sex": "Female",
                "goal": "weight_loss",
                "experience": "intermediate",
                "leaderboard_opt_in": True,
            },
            {
                "email": "alex@fitsync.ai",
                "name": "Alex Rivera",
                "username": "alex_r",
                "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
                "age": 30,
                "sex": "Non-binary",
                "goal": "endurance",
                "experience": "beginner",
                "leaderboard_opt_in": True,
            },
        ]

        created_users = {}
        for udata in users_config:
            res = await db.execute(select(User).where(User.email == udata["email"]))
            user = res.scalar_one_or_none()
            if not user:
                user = User(
                    email=udata["email"],
                    password_hash=hashed_pw,
                    name=udata["name"],
                    username=udata["username"],
                    avatar=udata["avatar"],
                    age=udata["age"],
                    sex=udata["sex"],
                    height_cm=170,
                    weight_kg=65,
                    goal=udata["goal"],
                    experience=udata["experience"],
                    diet_pref="omnivore",
                    equipment=["yoga_mat", "dumbbells"],
                    leaderboard_opt_in=udata["leaderboard_opt_in"],
                )
                db.add(user)
                await db.commit()
                await db.refresh(user)
            else:
                user.leaderboard_opt_in = udata["leaderboard_opt_in"]
                user.username = udata["username"]
                user.avatar = udata["avatar"]
                await db.commit()
                await db.refresh(user)
            created_users[udata["email"]] = user

        # 3. Check if workout sessions exist; if not, seed realistic verified sessions via LeaderboardService
        now = datetime.datetime.utcnow()
        workout_plans = [
            # Marcus: high performer, 4 workouts over last 4 days
            (
                created_users["marcus@fitsync.ai"],
                [
                    {"days_ago": 3, "duration": 360, "valid_reps": 45, "total_reps": 48, "acc": 93.0, "diff": 3, "cal": 280, "ex": "Squat"},
                    {"days_ago": 2, "duration": 420, "valid_reps": 50, "total_reps": 52, "acc": 95.0, "diff": 3, "cal": 310, "ex": "Push Up"},
                    {"days_ago": 1, "duration": 300, "valid_reps": 40, "total_reps": 42, "acc": 92.5, "diff": 2, "cal": 240, "ex": "Lunge"},
                    {"days_ago": 0, "duration": 450, "valid_reps": 55, "total_reps": 58, "acc": 96.0, "diff": 3, "cal": 350, "ex": "Squat"},
                ]
            ),
            # Priya: steady intermediate, 3 workouts over last 3 days
            (
                created_users["priya@fitsync.ai"],
                [
                    {"days_ago": 2, "duration": 300, "valid_reps": 30, "total_reps": 32, "acc": 89.0, "diff": 2, "cal": 190, "ex": "Warrior Pose"},
                    {"days_ago": 1, "duration": 360, "valid_reps": 36, "total_reps": 38, "acc": 91.0, "diff": 2, "cal": 220, "ex": "Plank"},
                    {"days_ago": 0, "duration": 320, "valid_reps": 35, "total_reps": 37, "acc": 90.5, "diff": 2, "cal": 210, "ex": "Tree Pose"},
                ]
            ),
            # Sarah (Demo user): 2 workouts, very clean form
            (
                created_users["demo@fitsync.ai"],
                [
                    {"days_ago": 1, "duration": 240, "valid_reps": 25, "total_reps": 26, "acc": 94.0, "diff": 2, "cal": 160, "ex": "Squat"},
                    {"days_ago": 0, "duration": 280, "valid_reps": 30, "total_reps": 31, "acc": 95.5, "diff": 2, "cal": 185, "ex": "Lunge"},
                ]
            ),
            # Alex: beginner starting out, 1 workout today
            (
                created_users["alex@fitsync.ai"],
                [
                    {"days_ago": 0, "duration": 180, "valid_reps": 18, "total_reps": 22, "acc": 84.0, "diff": 1, "cal": 110, "ex": "Jumping Jack"},
                ]
            ),
        ]

        # Check existing sessions count
        res = await db.execute(select(func.count(WorkoutSession.id)))
        session_count = res.scalar() or 0
        if session_count == 0:
            import uuid
            for user, sessions in workout_plans:
                for s in sessions:
                    s_time = now - datetime.timedelta(days=s["days_ago"], minutes=30)
                    start_time = s_time - datetime.timedelta(seconds=s["duration"])
                    req = WorkoutCompleteRequest(
                        client_id=uuid.uuid4(),
                        exercise_name=s["ex"],
                        started_at=start_time,
                        completed_at=s_time,
                        duration_s=s["duration"],
                        reps=s["total_reps"],
                        valid_reps=s["valid_reps"],
                        avg_form_score=s["acc"],
                        calories=s["cal"],
                        difficulty=s["diff"],
                        confidence=0.92,
                    )
                    await LeaderboardService.record_workout_completion(
                        db=db,
                        user=user,
                        data=req,
                    )
            print("Seeded realistic workout sessions and calculated leaderboard scores!")
        # Seed Trending Community Challenges
        res_ch = await db.execute(select(Challenge))
        existing_challenges = res_ch.scalars().all()
        if not existing_challenges:
            challenges_to_seed = [
                Challenge(title="30 Day Fitness Challenge", description="Community Challenge", icon="target", participants_count=1204),
                Challenge(title="5KM Running Challenge", description="Endurance Goal", icon="activity", participants_count=842),
                Challenge(title="7 Day Streak Challenge", description="Consistency Goal", icon="award", participants_count=2341),
            ]
            for c in challenges_to_seed:
                db.add(c)
            await db.commit()
            print("Seeded 3 Trending Community Challenges!")

        # Seed Community Posts, Comments, and Likes
        res_posts = await db.execute(select(Post))
        existing_posts = res_posts.scalars().all()
        if not existing_posts and "marcus@fitsync.ai" in created_users:
            marcus = created_users["marcus@fitsync.ai"]
            priya = created_users["priya@fitsync.ai"]
            alex = created_users["alex@fitsync.ai"]
            demo = created_users["demo@fitsync.ai"]

            post1 = Post(
                user_id=marcus.id,
                content="Fitness Journey • Just crushed my leg day! The new AI posture coach really helped with my squat depth and keeping knees tracking over toes. Keep pushing everyone! 🏋️‍♂️💪",
                image_url="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop",
                likes_count=24,
                created_at=now - datetime.timedelta(hours=6)
            )
            post2 = Post(
                user_id=priya.id,
                content="Consistency is key. 5k morning run complete! AI pacing coach had me maintain 5:12/km steady throughout. Who else is doing the 5KM Challenge this week? 🏃‍♀️🔥 #Endurance #Streak",
                image_url="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=800&auto=format&fit=crop",
                likes_count=18,
                created_at=now - datetime.timedelta(hours=14)
            )
            post3 = Post(
                user_id=alex.id,
                content="Morning mobility and core session complete. 🧘 Desk posture feels 100x better after 15 minutes of scapular work and planks.",
                image_url="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop",
                likes_count=12,
                created_at=now - datetime.timedelta(days=1)
            )
            db.add_all([post1, post2, post3])
            await db.commit()
            await db.refresh(post1)
            await db.refresh(post2)
            await db.refresh(post3)

            # Seed comments
            c1 = PostComment(
                user_id=priya.id,
                post_id=post1.id,
                content="Great depth on those squats! Form looked rock solid. 🔥",
                created_at=now - datetime.timedelta(hours=5)
            )
            c2 = PostComment(
                user_id=alex.id,
                post_id=post1.id,
                content="Love the dedication Marcus! Let's hit traps and back tomorrow.",
                created_at=now - datetime.timedelta(hours=4)
            )
            c3 = PostComment(
                user_id=marcus.id,
                post_id=post2.id,
                content="Pacing on point Priya! Joining you for the 5KM weekend run. 🏃",
                created_at=now - datetime.timedelta(hours=12)
            )
            db.add_all([c1, c2, c3])

            # Seed likes
            like1 = PostLike(user_id=priya.id, post_id=post1.id)
            like2 = PostLike(user_id=alex.id, post_id=post1.id)
            like3 = PostLike(user_id=marcus.id, post_id=post2.id)
            db.add_all([like1, like2, like3])

            # Seed sample follow
            follow1 = UserFollow(follower_id=demo.id, following_id=marcus.id)
            follow2 = UserFollow(follower_id=marcus.id, following_id=priya.id)
            db.add_all([follow1, follow2])

            await db.commit()
            print("Seeded Community Posts, Comments, Likes, and Follows!")

    print("Database seeding & leaderboard setup complete!")

if __name__ == "__main__":
    asyncio.run(seed_data())
