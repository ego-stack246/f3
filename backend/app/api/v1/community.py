from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uuid
import datetime

from app.db.session import get_db
from app.db.models.models import Post, Story, Challenge, UserChallenge, PostLike, PostComment, UserFollow
from app.db.models.user import User
from app.api.deps import get_current_user_optional, get_current_user

router = APIRouter()

CHALLENGE_METADATA = {
    "30 Day Fitness Challenge": {
        "days_total": 30,
        "default_progress": 40.0,
        "reward_points": 500,
        "badge": "30-Day Master",
        "tag": "Community Challenge",
    },
    "5KM Running Challenge": {
        "days_total": 5,
        "default_progress": 64.0,
        "reward_points": 350,
        "badge": "Endurance Runner",
        "tag": "Endurance Goal",
    },
    "7 Day Streak Challenge": {
        "days_total": 7,
        "default_progress": 57.0,
        "reward_points": 250,
        "badge": "Streak Pioneer",
        "tag": "Consistency Goal",
    },
}

class CommentCreateRequest(BaseModel):
    content: str

class PostCreateRequest(BaseModel):
    content: str
    image_url: Optional[str] = None


@router.get("/feed")
async def get_community_feed(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    # 1. Fetch Posts
    result_posts = await db.execute(select(Post).order_by(Post.created_at.desc()).limit(20))
    posts = result_posts.scalars().all()

    # 2. Fetch Stories
    result_stories = await db.execute(select(Story).order_by(Story.created_at.desc()).limit(10))
    stories = result_stories.scalars().all()

    # 3. Fetch Challenges
    result_challenges = await db.execute(select(Challenge).order_by(Challenge.participants_count.desc()).limit(10))
    challenges = result_challenges.scalars().all()

    # Fetch user challenge participation, likes, and follows if logged in
    joined_challenge_ids = set()
    user_challenge_progress = {}
    liked_post_ids = set()
    following_user_ids = set()

    if current_user:
        # User Challenges
        res_user_ch = await db.execute(
            select(UserChallenge).where(UserChallenge.user_id == current_user.id)
        )
        for uc in res_user_ch.scalars().all():
            joined_challenge_ids.add(str(uc.challenge_id))
            user_challenge_progress[str(uc.challenge_id)] = uc.progress

        # User Likes
        res_likes = await db.execute(
            select(PostLike.post_id).where(PostLike.user_id == current_user.id)
        )
        for p_id in res_likes.scalars().all():
            liked_post_ids.add(str(p_id))

        # User Follows
        res_follows = await db.execute(
            select(UserFollow.following_id).where(UserFollow.follower_id == current_user.id)
        )
        for f_id in res_follows.scalars().all():
            following_user_ids.add(str(f_id))

    # Process Posts
    if not posts:
        mock_posts = [
            {
                "id": "1",
                "user": {
                    "id": "u-soumya",
                    "name": "Soumyajit Bhowmik",
                    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Soumya",
                    "is_following": False,
                    "is_self": False,
                },
                "content": "Fitness Journey • Just crushed my leg day! The new AI posture coach really helped with my squat depth. Keep pushing everyone! 🏋️‍♂️💪",
                "image_url": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop",
                "likes_count": 24,
                "shares_count": 5,
                "is_liked": False,
                "comments_count": 2,
                "comments": [
                    {
                        "id": "cm-1",
                        "content": "Great depth on those squats! Form looked solid.",
                        "created_at": "2026-09-18T11:20:00Z",
                        "user": {"id": "u-ayan", "name": "Ayan Mondal", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Ayan"}
                    },
                    {
                        "id": "cm-2",
                        "content": "Love the dedication, let's hit back and traps tomorrow!",
                        "created_at": "2026-09-18T12:05:00Z",
                        "user": {"id": "u-priya", "name": "Priya Sharma", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya"}
                    }
                ],
                "created_at": "2026-09-18T10:00:00Z"
            },
            {
                "id": "2",
                "user": {
                    "id": "u-ayan",
                    "name": "Ayan Mondal",
                    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Ayan",
                    "is_following": False,
                    "is_self": False,
                },
                "content": "Consistency is key. 5k morning run complete. AI pacing coach had me maintain 5:12/km steady. 🏃‍♂️🔥 #Endurance #Streak",
                "image_url": "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=800&auto=format&fit=crop",
                "likes_count": 18,
                "shares_count": 3,
                "is_liked": False,
                "comments_count": 1,
                "comments": [
                    {
                        "id": "cm-3",
                        "content": "Pacing on point! Joining you for the weekend 10k.",
                        "created_at": "2026-09-19T09:15:00Z",
                        "user": {"id": "u-marcus", "name": "Marcus Vance", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus"}
                    }
                ],
                "created_at": "2026-09-19T08:30:00Z"
            }
        ]
    else:
        mock_posts = []
        for p in posts:
            user_res = await db.execute(select(User).filter(User.id == p.user_id))
            u = user_res.scalars().first()
            is_self = bool(current_user and u and current_user.id == u.id)
            is_following = bool(u and str(u.id) in following_user_ids)
            is_liked = str(p.id) in liked_post_ids

            # Fetch comments for this post
            c_res = await db.execute(
                select(PostComment).where(PostComment.post_id == p.id).order_by(PostComment.created_at.asc())
            )
            raw_comments = c_res.scalars().all()
            formatted_comments = []
            for c in raw_comments:
                cu_res = await db.execute(select(User).where(User.id == c.user_id))
                cu = cu_res.scalars().first()
                formatted_comments.append({
                    "id": str(c.id),
                    "content": c.content,
                    "created_at": c.created_at.isoformat(),
                    "user": {
                        "id": str(cu.id) if cu else "unknown",
                        "name": cu.name if cu else "Community Member",
                        "avatar": cu.avatar if (cu and cu.avatar) else f"https://api.dicebear.com/7.x/avataaars/svg?seed={cu.name if cu else 'User'}"
                    }
                })

            mock_posts.append({
                "id": str(p.id),
                "user": {
                    "id": str(u.id) if u else "unknown",
                    "name": u.name if u else "Community Member",
                    "avatar": u.avatar if (u and u.avatar) else f"https://api.dicebear.com/7.x/avataaars/svg?seed={u.name if u else 'U'}",
                    "is_following": is_following,
                    "is_self": is_self,
                },
                "content": p.content,
                "image_url": p.image_url,
                "likes_count": p.likes_count or 0,
                "shares_count": getattr(p, "shares_count", 0) or 0,
                "is_liked": is_liked,
                "comments_count": len(formatted_comments),
                "comments": formatted_comments,
                "created_at": p.created_at.isoformat()
            })

    # Process Stories
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
            user_res = await db.execute(select(User).filter(User.id == s.user_id))
            u = user_res.scalars().first()
            if u:
                mock_stories.append({"id": str(s.id), "name": u.name, "avatar": u.avatar or f"https://api.dicebear.com/7.x/avataaars/svg?seed={u.name}"})

    # Prepare formatted challenges
    challenges_data = []
    if not challenges:
        raw_list = [
            {"id": "c1", "title": "30 Day Fitness Challenge", "description": "Community Challenge", "icon": "target", "participants": 1204},
            {"id": "c2", "title": "5KM Running Challenge", "description": "Endurance Goal", "icon": "activity", "participants": 842},
            {"id": "c3", "title": "7 Day Streak Challenge", "description": "Consistency Goal", "icon": "award", "participants": 2341}
        ]
    else:
        raw_list = [
            {"id": str(c.id), "title": c.title, "description": c.description, "icon": c.icon, "participants": c.participants_count}
            for c in challenges
        ]

    for item in raw_list:
        meta = CHALLENGE_METADATA.get(item["title"], {
            "days_total": 30,
            "default_progress": 25.0,
            "reward_points": 300,
            "badge": "Challenger",
            "tag": item["description"],
        })
        is_joined = item["id"] in joined_challenge_ids
        progress = user_challenge_progress.get(item["id"], meta["default_progress"] if is_joined else 0.0)

        challenges_data.append({
            "id": item["id"],
            "title": item["title"],
            "description": item["description"],
            "icon": item["icon"],
            "participants": item["participants"],
            "is_joined": is_joined,
            "progress": progress,
            "days_total": meta["days_total"],
            "reward_points": meta["reward_points"],
            "badge": meta["badge"],
        })

    return {
        "posts": mock_posts,
        "stories": mock_stories,
        "challenges": challenges_data
    }


@router.post("/posts")
async def create_community_post(
    data: PostCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not data.content.strip():
        raise HTTPException(status_code=400, detail="Post content cannot be empty")

    post = Post(
        user_id=current_user.id,
        content=data.content.strip(),
        image_url=data.image_url,
        likes_count=0
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)

    return {
        "id": str(post.id),
        "user": {
            "id": str(current_user.id),
            "name": current_user.name,
            "avatar": current_user.avatar or f"https://api.dicebear.com/7.x/avataaars/svg?seed={current_user.name}",
            "is_following": False,
            "is_self": True,
        },
        "content": post.content,
        "image_url": post.image_url,
        "likes_count": 0,
        "shares_count": 0,
        "is_liked": False,
        "comments_count": 0,
        "comments": [],
        "created_at": post.created_at.isoformat()
    }


@router.post("/posts/{post_id}/share")
async def share_community_post(
    post_id: str,
    db: AsyncSession = Depends(get_db)
):
    post = None
    try:
        p_uuid = uuid.UUID(post_id)
        res = await db.execute(select(Post).where(Post.id == p_uuid))
        post = res.scalars().first()
    except (ValueError, AttributeError):
        pass

    if not post:
        return {"status": "shared", "shares_count": 1, "post_id": post_id}

    post.shares_count = (post.shares_count or 0) + 1
    await db.commit()
    return {"status": "shared", "shares_count": post.shares_count, "post_id": str(post.id)}


@router.post("/posts/{post_id}/like")
async def toggle_like_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    post = None
    try:
        p_uuid = uuid.UUID(post_id)
        res = await db.execute(select(Post).where(Post.id == p_uuid))
        post = res.scalars().first()
    except (ValueError, AttributeError):
        pass

    if not post:
        # Graceful response for client fallback mock posts
        return {
            "status": "liked",
            "is_liked": True,
            "likes_count": 25,
            "post_id": post_id,
            "message": "Liked post"
        }

    # Check existing like
    res_like = await db.execute(
        select(PostLike).where(
            PostLike.user_id == current_user.id,
            PostLike.post_id == post.id
        )
    )
    existing_like = res_like.scalars().first()

    if existing_like:
        await db.delete(existing_like)
        post.likes_count = max(0, (post.likes_count or 1) - 1)
        await db.commit()
        return {
            "status": "unliked",
            "is_liked": False,
            "likes_count": post.likes_count,
            "post_id": str(post.id)
        }
    else:
        new_like = PostLike(user_id=current_user.id, post_id=post.id)
        db.add(new_like)
        post.likes_count = (post.likes_count or 0) + 1
        await db.commit()
        return {
            "status": "liked",
            "is_liked": True,
            "likes_count": post.likes_count,
            "post_id": str(post.id)
        }


@router.post("/posts/{post_id}/comments")
async def add_post_comment(
    post_id: str,
    data: CommentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not data.content.strip():
        raise HTTPException(status_code=400, detail="Comment cannot be empty")

    post = None
    try:
        p_uuid = uuid.UUID(post_id)
        res = await db.execute(select(Post).where(Post.id == p_uuid))
        post = res.scalars().first()
    except (ValueError, AttributeError):
        pass

    if not post:
        # Return graceful payload for mock fallback
        return {
            "id": str(uuid.uuid4()),
            "post_id": post_id,
            "content": data.content.strip(),
            "created_at": datetime.datetime.utcnow().isoformat(),
            "user": {
                "id": str(current_user.id),
                "name": current_user.name,
                "avatar": current_user.avatar or f"https://api.dicebear.com/7.x/avataaars/svg?seed={current_user.name}"
            }
        }

    comment = PostComment(
        user_id=current_user.id,
        post_id=post.id,
        content=data.content.strip()
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)

    return {
        "id": str(comment.id),
        "post_id": str(post.id),
        "content": comment.content,
        "created_at": comment.created_at.isoformat(),
        "user": {
            "id": str(current_user.id),
            "name": current_user.name,
            "avatar": current_user.avatar or f"https://api.dicebear.com/7.x/avataaars/svg?seed={current_user.name}"
        }
    }


@router.get("/posts/{post_id}/comments")
async def get_post_comments(
    post_id: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        p_uuid = uuid.UUID(post_id)
    except (ValueError, AttributeError):
        return []

    res = await db.execute(
        select(PostComment).where(PostComment.post_id == p_uuid).order_by(PostComment.created_at.asc())
    )
    comments = res.scalars().all()
    results = []
    for c in comments:
        u_res = await db.execute(select(User).where(User.id == c.user_id))
        u = u_res.scalars().first()
        results.append({
            "id": str(c.id),
            "post_id": str(c.post_id),
            "content": c.content,
            "created_at": c.created_at.isoformat(),
            "user": {
                "id": str(u.id) if u else "unknown",
                "name": u.name if u else "Community Member",
                "avatar": u.avatar if (u and u.avatar) else f"https://api.dicebear.com/7.x/avataaars/svg?seed={u.name if u else 'User'}"
            }
        })
    return results


@router.post("/users/{target_user_id}/follow")
async def toggle_follow_user(
    target_user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    target_user = None
    try:
        t_uuid = uuid.UUID(target_user_id)
        res = await db.execute(select(User).where(User.id == t_uuid))
        target_user = res.scalars().first()
    except (ValueError, AttributeError):
        # lookup by name or username fallback
        res = await db.execute(select(User).where(User.name.ilike(f"%{target_user_id}%")))
        target_user = res.scalars().first()

    if not target_user:
        # Fallback response for mock users (Soumyajit, Ayan, etc.)
        return {
            "status": "followed",
            "is_following": True,
            "target_user_id": target_user_id,
            "message": "Followed user"
        }

    if target_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")

    res_f = await db.execute(
        select(UserFollow).where(
            UserFollow.follower_id == current_user.id,
            UserFollow.following_id == target_user.id
        )
    )
    existing_follow = res_f.scalars().first()

    if existing_follow:
        await db.delete(existing_follow)
        await db.commit()
        return {
            "status": "unfollowed",
            "is_following": False,
            "target_user_id": str(target_user.id),
            "target_name": target_user.name
        }
    else:
        new_follow = UserFollow(
            follower_id=current_user.id,
            following_id=target_user.id
        )
        db.add(new_follow)
        await db.commit()
        return {
            "status": "followed",
            "is_following": True,
            "target_user_id": str(target_user.id),
            "target_name": target_user.name
        }


@router.post("/challenges/{challenge_id}/join")
async def join_challenge(
    challenge_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch challenge by UUID or title
    challenge = None
    try:
        c_uuid = uuid.UUID(challenge_id)
        res = await db.execute(select(Challenge).where(Challenge.id == c_uuid))
        challenge = res.scalars().first()
    except (ValueError, AttributeError):
        pass

    if not challenge:
        res = await db.execute(select(Challenge).where(Challenge.title.ilike(f"%{challenge_id}%")))
        challenge = res.scalars().first()

    if not challenge:
        # Fallback to first available challenge
        res = await db.execute(select(Challenge).limit(1))
        challenge = res.scalars().first()
        if not challenge:
            raise HTTPException(status_code=404, detail="Challenge not found")

    # Check existing user participation
    res_uc = await db.execute(
        select(UserChallenge).where(
            UserChallenge.user_id == current_user.id,
            UserChallenge.challenge_id == challenge.id
        )
    )
    user_challenge = res_uc.scalars().first()

    meta = CHALLENGE_METADATA.get(challenge.title, {
        "days_total": 30,
        "default_progress": 25.0,
        "reward_points": 300,
        "badge": "Challenger"
    })

    if user_challenge:
        # Toggle leave
        await db.delete(user_challenge)
        challenge.participants_count = max(0, (challenge.participants_count or 1) - 1)
        await db.commit()
        return {
            "status": "left",
            "message": f"Left {challenge.title}",
            "challenge_id": str(challenge.id),
            "is_joined": False,
            "participants": challenge.participants_count,
            "progress": 0.0,
        }
    else:
        # Toggle join
        new_uc = UserChallenge(
            user_id=current_user.id,
            challenge_id=challenge.id,
            progress=meta["default_progress"],
            completed=False
        )
        db.add(new_uc)
        challenge.participants_count = (challenge.participants_count or 0) + 1
        await db.commit()
        return {
            "status": "joined",
            "message": f"Awesome! You joined the {challenge.title}!",
            "challenge_id": str(challenge.id),
            "is_joined": True,
            "participants": challenge.participants_count,
            "progress": meta["default_progress"],
            "reward_points": meta["reward_points"],
            "badge": meta["badge"]
        }
