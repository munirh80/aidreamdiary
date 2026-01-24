from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import bcrypt
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'default_secret')
JWT_ALGORITHM = "HS256"

# Create the main app
app = FastAPI()

# Create router with /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============== MODELS ==============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class DreamCreate(BaseModel):
    title: str
    description: str
    date: str
    tags: List[str] = []
    themes: List[str] = []
    is_lucid: bool = False
    is_public: bool = False

class DreamUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    tags: Optional[List[str]] = None
    themes: Optional[List[str]] = None
    is_lucid: Optional[bool] = None
    is_public: Optional[bool] = None

class DreamResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: str
    date: str
    tags: List[str]
    themes: List[str]
    is_lucid: bool = False
    is_public: bool = False
    ai_insight: Optional[str] = None
    created_at: str
    updated_at: str

class UserSettingsUpdate(BaseModel):
    reminder_enabled: Optional[bool] = None
    reminder_time: Optional[str] = None  # HH:MM format
    streak_freeze_count: Optional[int] = None

class UserSettingsResponse(BaseModel):
    reminder_enabled: bool = False
    reminder_time: str = "08:00"
    streak_freeze_count: int = 0
    streak_freezes_used: int = 0

class ShareDreamRequest(BaseModel):
    dream_id: str

class PublicDreamResponse(BaseModel):
    id: str
    title: str
    description: str
    date: str
    tags: List[str]
    themes: List[str]
    is_lucid: bool
    ai_insight: Optional[str] = None
    author_name: str
    created_at: str

class InsightRequest(BaseModel):
    dream_id: str

class InsightResponse(BaseModel):
    dream_id: str
    insight: str

# ============== HELPER FUNCTIONS ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc).timestamp() + 86400 * 30  # 30 days
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============== AUTH ROUTES ==============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "name": user_data.name,
        "created_at": now
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id)
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user_id, email=user_data.email, name=user_data.name, created_at=now)
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_token(user["id"])
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user["id"], email=user["email"], name=user["name"], created_at=user["created_at"])
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        created_at=current_user["created_at"]
    )

# ============== USER SETTINGS ROUTES ==============

@api_router.get("/settings", response_model=UserSettingsResponse)
async def get_settings(current_user: dict = Depends(get_current_user)):
    settings = await db.user_settings.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not settings:
        return UserSettingsResponse()
    return UserSettingsResponse(
        reminder_enabled=settings.get("reminder_enabled", False),
        reminder_time=settings.get("reminder_time", "08:00"),
        streak_freeze_count=settings.get("streak_freeze_count", 0),
        streak_freezes_used=settings.get("streak_freezes_used", 0)
    )

@api_router.put("/settings", response_model=UserSettingsResponse)
async def update_settings(settings_data: UserSettingsUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in settings_data.model_dump().items() if v is not None}
    
    if update_data:
        await db.user_settings.update_one(
            {"user_id": current_user["id"]},
            {"$set": update_data},
            upsert=True
        )
    
    settings = await db.user_settings.find_one({"user_id": current_user["id"]}, {"_id": 0})
    return UserSettingsResponse(
        reminder_enabled=settings.get("reminder_enabled", False),
        reminder_time=settings.get("reminder_time", "08:00"),
        streak_freeze_count=settings.get("streak_freeze_count", 0),
        streak_freezes_used=settings.get("streak_freezes_used", 0)
    )

@api_router.post("/settings/use-freeze")
async def use_streak_freeze(current_user: dict = Depends(get_current_user)):
    """Use a streak freeze to protect the current streak"""
    settings = await db.user_settings.find_one({"user_id": current_user["id"]}, {"_id": 0})
    freeze_count = settings.get("streak_freeze_count", 0) if settings else 0
    
    if freeze_count <= 0:
        raise HTTPException(status_code=400, detail="No streak freezes available")
    
    await db.user_settings.update_one(
        {"user_id": current_user["id"]},
        {
            "$inc": {"streak_freeze_count": -1, "streak_freezes_used": 1},
            "$set": {"last_freeze_date": datetime.now(timezone.utc).strftime("%Y-%m-%d")}
        },
        upsert=True
    )
    
    return {"message": "Streak freeze activated!", "remaining_freezes": freeze_count - 1}

@api_router.post("/settings/add-freeze")
async def add_streak_freeze(current_user: dict = Depends(get_current_user)):
    """Add a streak freeze (earned by reaching milestones or purchased)"""
    await db.user_settings.update_one(
        {"user_id": current_user["id"]},
        {"$inc": {"streak_freeze_count": 1}},
        upsert=True
    )
    
    settings = await db.user_settings.find_one({"user_id": current_user["id"]}, {"_id": 0})
    return {"message": "Streak freeze added!", "total_freezes": settings.get("streak_freeze_count", 1)}

# ============== DREAM ROUTES ==============

@api_router.post("/dreams", response_model=DreamResponse)
async def create_dream(dream_data: DreamCreate, current_user: dict = Depends(get_current_user)):
    dream_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    dream_doc = {
        "id": dream_id,
        "user_id": current_user["id"],
        "title": dream_data.title,
        "description": dream_data.description,
        "date": dream_data.date,
        "tags": dream_data.tags,
        "themes": dream_data.themes,
        "is_lucid": dream_data.is_lucid,
        "is_public": dream_data.is_public,
        "ai_insight": None,
        "created_at": now,
        "updated_at": now
    }
    
    await db.dreams.insert_one(dream_doc)
    
    return DreamResponse(**{k: v for k, v in dream_doc.items() if k != "_id"})

@api_router.get("/dreams", response_model=List[DreamResponse])
async def get_dreams(current_user: dict = Depends(get_current_user)):
    dreams = await db.dreams.find(
        {"user_id": current_user["id"]}, 
        {"_id": 0}
    ).sort("date", -1).to_list(1000)
    # Ensure defaults for new fields
    for dream in dreams:
        dream.setdefault("is_lucid", False)
        dream.setdefault("is_public", False)
    return [DreamResponse(**dream) for dream in dreams]

@api_router.get("/dreams/{dream_id}", response_model=DreamResponse)
async def get_dream(dream_id: str, current_user: dict = Depends(get_current_user)):
    dream = await db.dreams.find_one(
        {"id": dream_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
    # Ensure defaults for new fields
    dream.setdefault("is_lucid", False)
    dream.setdefault("is_public", False)
    return DreamResponse(**dream)

@api_router.put("/dreams/{dream_id}", response_model=DreamResponse)
async def update_dream(dream_id: str, dream_data: DreamUpdate, current_user: dict = Depends(get_current_user)):
    dream = await db.dreams.find_one({"id": dream_id, "user_id": current_user["id"]})
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
    
    update_data = {k: v for k, v in dream_data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.dreams.update_one({"id": dream_id}, {"$set": update_data})
    
    updated_dream = await db.dreams.find_one({"id": dream_id}, {"_id": 0})
    return DreamResponse(**updated_dream)

@api_router.delete("/dreams/{dream_id}")
async def delete_dream(dream_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.dreams.delete_one({"id": dream_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Dream not found")
    return {"message": "Dream deleted successfully"}

# ============== PUBLIC SHARING ROUTES ==============

@api_router.post("/dreams/{dream_id}/share")
async def share_dream(dream_id: str, current_user: dict = Depends(get_current_user)):
    """Make a dream public and generate a share link"""
    dream = await db.dreams.find_one({"id": dream_id, "user_id": current_user["id"]})
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
    
    share_id = str(uuid.uuid4())[:8]  # Short shareable ID
    
    await db.dreams.update_one(
        {"id": dream_id},
        {"$set": {"is_public": True, "share_id": share_id, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"share_id": share_id, "message": "Dream is now public"}

@api_router.post("/dreams/{dream_id}/unshare")
async def unshare_dream(dream_id: str, current_user: dict = Depends(get_current_user)):
    """Make a dream private again"""
    result = await db.dreams.update_one(
        {"id": dream_id, "user_id": current_user["id"]},
        {"$set": {"is_public": False, "updated_at": datetime.now(timezone.utc).isoformat()}, "$unset": {"share_id": ""}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Dream not found")
    
    return {"message": "Dream is now private"}

@api_router.get("/public/dream/{share_id}")
async def get_public_dream(share_id: str):
    """Get a publicly shared dream (no auth required)"""
    dream = await db.dreams.find_one({"share_id": share_id, "is_public": True}, {"_id": 0})
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found or not public")
    
    # Get author name
    user = await db.users.find_one({"id": dream["user_id"]}, {"_id": 0, "name": 1})
    author_name = user.get("name", "Anonymous") if user else "Anonymous"
    
    return PublicDreamResponse(
        id=dream["id"],
        title=dream["title"],
        description=dream["description"],
        date=dream["date"],
        tags=dream.get("tags", []),
        themes=dream.get("themes", []),
        is_lucid=dream.get("is_lucid", False),
        ai_insight=dream.get("ai_insight"),
        author_name=author_name,
        created_at=dream["created_at"]
    )

@api_router.get("/public/dreams")
async def get_public_dreams(limit: int = 20, skip: int = 0):
    """Get recent public dreams (explore/discover feature)"""
    dreams = await db.dreams.find(
        {"is_public": True},
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    results = []
    for dream in dreams:
        user = await db.users.find_one({"id": dream["user_id"]}, {"_id": 0, "name": 1})
        author_name = user.get("name", "Anonymous") if user else "Anonymous"
        results.append(PublicDreamResponse(
            id=dream["id"],
            title=dream["title"],
            description=dream["description"],
            date=dream["date"],
            tags=dream.get("tags", []),
            themes=dream.get("themes", []),
            is_lucid=dream.get("is_lucid", False),
            ai_insight=dream.get("ai_insight"),
            author_name=author_name,
            created_at=dream["created_at"]
        ))
    
    return results

# ============== AI INSIGHT ROUTE ==============

@api_router.post("/dreams/{dream_id}/insight", response_model=InsightResponse)
async def generate_insight(dream_id: str, current_user: dict = Depends(get_current_user)):
    dream = await db.dreams.find_one({"id": dream_id, "user_id": current_user["id"]}, {"_id": 0})
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
    
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"dream-insight-{dream_id}",
            system_message="""You are a mystical dream interpreter with deep knowledge of dream symbolism, psychology, and mythology. 
            Analyze dreams with wisdom and insight, offering interpretations that are:
            - Thoughtful and personalized
            - Drawing from Jungian psychology and universal dream symbols
            - Encouraging self-reflection without being prescriptive
            - Mystical yet grounded
            Keep responses concise but meaningful (2-3 paragraphs max)."""
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        prompt = f"""Please interpret this dream:

Title: {dream['title']}
Description: {dream['description']}
Tags: {', '.join(dream.get('tags', []))}
Themes: {', '.join(dream.get('themes', []))}

Provide a thoughtful interpretation covering:
1. Key symbols and their potential meanings
2. Possible emotional themes or subconscious messages
3. A brief reflection prompt for the dreamer"""

        user_message = UserMessage(text=prompt)
        insight = await chat.send_message(user_message)
        
        # Save insight to dream
        await db.dreams.update_one(
            {"id": dream_id},
            {"$set": {"ai_insight": insight, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        return InsightResponse(dream_id=dream_id, insight=insight)
        
    except Exception as e:
        logger.error(f"Error generating insight: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate insight: {str(e)}")

# ============== STATS ROUTE ==============

@api_router.get("/stats")
async def get_stats(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    from datetime import timedelta
    
    # Get total dreams count
    total_dreams = await db.dreams.count_documents({"user_id": user_id})
    
    # Get lucid dreams count
    lucid_dreams = await db.dreams.count_documents({"user_id": user_id, "is_lucid": True})
    
    # Get all dreams for tag/theme analysis
    dreams = await db.dreams.find({"user_id": user_id}, {"_id": 0, "tags": 1, "themes": 1, "date": 1}).to_list(1000)
    
    # Count tags
    tag_counts = {}
    theme_counts = {}
    for dream in dreams:
        for tag in dream.get("tags", []):
            tag_counts[tag] = tag_counts.get(tag, 0) + 1
        for theme in dream.get("themes", []):
            theme_counts[theme] = theme_counts.get(theme, 0) + 1
    
    # Get top tags and themes
    top_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    top_themes = sorted(theme_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    
    # Dreams this week
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    dreams_this_week = await db.dreams.count_documents({
        "user_id": user_id,
        "date": {"$gte": week_ago[:10]}
    })
    
    # Calculate streak
    streak = await calculate_streak(user_id)
    
    # Get streak freeze info
    settings = await db.user_settings.find_one({"user_id": user_id}, {"_id": 0})
    streak_freezes = settings.get("streak_freeze_count", 0) if settings else 0
    
    return {
        "total_dreams": total_dreams,
        "lucid_dreams": lucid_dreams,
        "dreams_this_week": dreams_this_week,
        "top_tags": [{"name": t[0], "count": t[1]} for t in top_tags],
        "top_themes": [{"name": t[0], "count": t[1]} for t in top_themes],
        "current_streak": streak["current"],
        "longest_streak": streak["longest"],
        "streak_freezes": streak_freezes
    }

async def calculate_streak(user_id: str):
    from datetime import timedelta
    
    # Get all dream dates sorted descending
    dreams = await db.dreams.find(
        {"user_id": user_id}, 
        {"_id": 0, "date": 1}
    ).sort("date", -1).to_list(1000)
    
    if not dreams:
        return {"current": 0, "longest": 0}
    
    # Get unique dates
    dates = sorted(set(d["date"][:10] for d in dreams), reverse=True)
    
    # Check for active freeze
    settings = await db.user_settings.find_one({"user_id": user_id}, {"_id": 0})
    last_freeze_date = settings.get("last_freeze_date") if settings else None
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
    
    # Calculate current streak (with freeze consideration)
    current_streak = 0
    if dates:
        # Check if most recent dream is today, yesterday, or freeze was used yesterday
        can_continue_streak = (
            dates[0] == today or 
            dates[0] == yesterday or 
            last_freeze_date == yesterday
        )
        
        if can_continue_streak:
            check_date = datetime.strptime(dates[0], "%Y-%m-%d")
            for i, date_str in enumerate(dates):
                date = datetime.strptime(date_str, "%Y-%m-%d")
                gap = (check_date - date).days
                
                # Allow gap of 1 day normally, or 2 if freeze was used
                if gap <= 1 or (gap == 2 and last_freeze_date):
                    current_streak += 1
                    check_date = date
                else:
                    break
    
    # Calculate longest streak
    longest_streak = 0
    if dates:
        streak = 1
        for i in range(1, len(dates)):
            prev = datetime.strptime(dates[i-1], "%Y-%m-%d")
            curr = datetime.strptime(dates[i], "%Y-%m-%d")
            if (prev - curr).days == 1:
                streak += 1
            else:
                longest_streak = max(longest_streak, streak)
                streak = 1
        longest_streak = max(longest_streak, streak)
    
    return {"current": current_streak, "longest": longest_streak}

# ============== CALENDAR ROUTE ==============

@api_router.get("/dreams/calendar/{year}/{month}")
async def get_dreams_calendar(year: int, month: int, current_user: dict = Depends(get_current_user)):
    """Get dreams for a specific month for calendar view"""
    user_id = current_user["id"]
    
    # Calculate date range
    start_date = f"{year:04d}-{month:02d}-01"
    if month == 12:
        end_date = f"{year+1:04d}-01-01"
    else:
        end_date = f"{year:04d}-{month+1:02d}-01"
    
    dreams = await db.dreams.find({
        "user_id": user_id,
        "date": {"$gte": start_date, "$lt": end_date}
    }, {"_id": 0}).to_list(100)
    
    # Group by date
    by_date = {}
    for dream in dreams:
        date = dream["date"][:10]
        if date not in by_date:
            by_date[date] = []
        by_date[date].append({
            "id": dream["id"],
            "title": dream["title"],
            "themes": dream.get("themes", [])
        })
    
    return {"dreams_by_date": by_date}

# ============== PATTERN ANALYSIS ROUTE ==============

@api_router.get("/analysis/patterns")
async def get_pattern_analysis(current_user: dict = Depends(get_current_user)):
    """Analyze dream patterns - recurring symbols, themes over time"""
    user_id = current_user["id"]
    
    dreams = await db.dreams.find(
        {"user_id": user_id}, 
        {"_id": 0, "description": 1, "tags": 1, "themes": 1, "date": 1, "title": 1}
    ).sort("date", -1).to_list(1000)
    
    if not dreams:
        return {
            "total_analyzed": 0,
            "recurring_symbols": [],
            "theme_trends": [],
            "common_words": [],
            "monthly_activity": []
        }
    
    # Common dream symbols to detect
    symbols = {
        "water": ["water", "ocean", "sea", "river", "lake", "swimming", "drowning", "rain", "flood"],
        "flying": ["flying", "fly", "floating", "soaring", "wings", "air"],
        "falling": ["falling", "fall", "dropping", "cliff", "height"],
        "chase": ["chase", "chasing", "running", "escape", "pursued", "following"],
        "death": ["death", "dead", "dying", "funeral", "grave"],
        "teeth": ["teeth", "tooth", "falling out", "broken teeth"],
        "animals": ["animal", "dog", "cat", "snake", "bird", "spider", "wolf", "lion"],
        "house": ["house", "home", "room", "door", "window", "building"],
        "vehicle": ["car", "driving", "bus", "train", "plane", "crash"],
        "people": ["stranger", "family", "friend", "crowd", "person", "people"]
    }
    
    # Count symbol occurrences
    symbol_counts = {s: 0 for s in symbols}
    for dream in dreams:
        text = (dream.get("description", "") + " " + dream.get("title", "")).lower()
        for symbol, keywords in symbols.items():
            if any(kw in text for kw in keywords):
                symbol_counts[symbol] += 1
    
    recurring_symbols = [
        {"symbol": s, "count": c, "percentage": round(c/len(dreams)*100, 1)}
        for s, c in sorted(symbol_counts.items(), key=lambda x: x[1], reverse=True)
        if c > 0
    ][:8]
    
    # Theme trends over time
    theme_by_month = {}
    for dream in dreams:
        month = dream["date"][:7]  # YYYY-MM
        if month not in theme_by_month:
            theme_by_month[month] = {}
        for theme in dream.get("themes", []):
            theme_by_month[month][theme] = theme_by_month[month].get(theme, 0) + 1
    
    theme_trends = [
        {"month": m, "themes": [{"name": t, "count": c} for t, c in themes.items()]}
        for m, themes in sorted(theme_by_month.items())
    ][-6:]  # Last 6 months
    
    # Monthly activity
    monthly_counts = {}
    for dream in dreams:
        month = dream["date"][:7]
        monthly_counts[month] = monthly_counts.get(month, 0) + 1
    
    monthly_activity = [
        {"month": m, "count": c}
        for m, c in sorted(monthly_counts.items())
    ][-12:]  # Last 12 months
    
    # Word frequency (simple)
    import re
    stop_words = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "from", "i", "me", "my", "was", "were", "is", "it", "that", "this", "had", "have", "be", "been"}
    word_counts = {}
    for dream in dreams:
        text = dream.get("description", "").lower()
        words = re.findall(r'\b[a-z]{4,}\b', text)
        for word in words:
            if word not in stop_words:
                word_counts[word] = word_counts.get(word, 0) + 1
    
    common_words = [
        {"word": w, "count": c}
        for w, c in sorted(word_counts.items(), key=lambda x: x[1], reverse=True)
    ][:15]
    
    return {
        "total_analyzed": len(dreams),
        "recurring_symbols": recurring_symbols,
        "theme_trends": theme_trends,
        "common_words": common_words,
        "monthly_activity": monthly_activity
    }

# ============== ROOT ==============

@api_router.get("/")
async def root():
    return {"message": "Dream Journal API"}

# Include router and add middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
