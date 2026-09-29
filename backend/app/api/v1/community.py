from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.db.session import get_db
from app.db.models.models import Post, Story, Challenge
from app.db.models.user import User

router = APIRouter()

@router.get("/feed")
def get_community_feed(db: Session = Depends(get_db)):
    # Try fetching from DB
    posts = db.query(Post).order_by(Post.created_at.desc()).limit(10).all()
    stories = db.query(Story).order_by(Story.created_at.desc()).limit(10).all()
    challenges = db.query(Challenge).limit(5).all()

    # If DB is empty, we provide mock fallback data so frontend works immediately
    if not posts:
        mock_posts = [
            {
                "id": "1",
                "user": {"name": "Soumyajit Bhowmik", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Soumya"},
                "content": "Fitness Journey • Just crushed my leg day! The new AI posture coach really helped with my squat depth.",
                "image_url": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop",
                "likes_count": 24,
                "created_at": "2026-09-18T10:00:00Z"
            },
            {
                "id": "2",
                "user": {"name": "Ayan Mondal", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Ayan"},
                "content": "Consistency is key. 5k morning run complete. #Endurance",
                "image_url": "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=800&auto=format&fit=crop",
                "likes_count": 15,
                "created_at": "2026-09-19T08:30:00Z"
            }
        ]
    else:
        mock_posts = []
        for p in posts:
            u = db.query(User).filter(User.id == p.user_id).first()
            mock_posts.append({
                "id": str(p.id),
                "user": {"name": u.name if u else "Unknown", "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={u.name if u else 'U'}"},
                "content": p.content,
                "image_url": p.image_url,
                "likes_count": p.likes_count,
                "created_at": p.created_at.isoformat()
            })

    if not stories:
        mock_stories = [
            {"id": "s1", "name": "Ayan Mondal", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Ayan"},
            {"id": "s2", "name": "Sachin Kumar", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sachin"},
            {"id": "s3", "name": "Saikat Gorai", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Saikat"},
            {"id": "s4", "name": "Soumya", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Soumya"}
        ]
    else:
        mock_stories = []
        for s in stories:
            u = db.query(User).filter(User.id == s.user_id).first()
            if u:
                mock_stories.append({"id": str(s.id), "name": u.name, "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={u.name}"})

    if not challenges:
        mock_challenges = [
            {"id": "c1", "title": "30 Day Fitness Challenge", "description": "Community Challenge", "icon": "target", "participants": 1204},
            {"id": "c2", "title": "5KM Running Challenge", "description": "Endurance Goal", "icon": "activity", "participants": 842},
            {"id": "c3", "title": "7 Day Streak Challenge", "description": "Consistency Goal", "icon": "award", "participants": 2341}
        ]
    else:
        mock_challenges = [{"id": str(c.id), "title": c.title, "description": c.description, "icon": c.icon, "participants": c.participants_count} for c in challenges]

    return {
        "posts": mock_posts,
        "stories": mock_stories,
        "challenges": mock_challenges
    }
