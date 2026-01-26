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
from datetime import datetime, timedelta
import bcrypt
import jwt
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'dreamvault')]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET', 'dreamvault-secret-key-2024')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

# Create the main app
app = FastAPI(title="Dream Vault API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============== MODELS ==============

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime

class AuthResponse(BaseModel):
    access_token: str
    user: UserResponse

class DreamCreate(BaseModel):
    title: str
    description: str
    date: Optional[str] = None
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
    is_lucid: bool
    is_public: bool
    ai_insight: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class StatsResponse(BaseModel):
    total_dreams: int
    weekly_count: int
    current_streak: int
    longest_streak: int
    lucid_count: int
    this_month_count: int

class Achievement(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    unlocked: bool
    unlocked_at: Optional[datetime] = None
    progress: int
    target: int

class PatternAnalysis(BaseModel):
    recurring_themes: List[dict]
    recurring_tags: List[dict]
    word_frequency: List[dict]
    monthly_activity: List[dict]
    lucid_percentage: float

# ============== HELPERS ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def serialize_user(user: dict) -> UserResponse:
    return UserResponse(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        created_at=user.get("created_at", datetime.utcnow())
    )

def serialize_dream(dream: dict) -> DreamResponse:
    return DreamResponse(
        id=str(dream["_id"]),
        user_id=str(dream["user_id"]),
        title=dream["title"],
        description=dream["description"],
        date=dream["date"],
        tags=dream.get("tags", []),
        themes=dream.get("themes", []),
        is_lucid=dream.get("is_lucid", False),
        is_public=dream.get("is_public", False),
        ai_insight=dream.get("ai_insight"),
        created_at=dream.get("created_at", datetime.utcnow()),
        updated_at=dream.get("updated_at", datetime.utcnow())
    )

# ============== AUTH ROUTES ==============

@api_router.post("/auth/register", response_model=AuthResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_doc = {
        "name": user_data.name,
        "email": user_data.email.lower(),
        "password": hash_password(user_data.password),
        "created_at": datetime.utcnow(),
        "streak_freezes": 3,
        "notification_time": "08:00"
    }
    
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    
    token = create_access_token(str(result.inserted_id))
    
    return AuthResponse(
        access_token=token,
        user=serialize_user(user_doc)
    )

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email.lower()})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token(str(user["_id"]))
    
    return AuthResponse(
        access_token=token,
        user=serialize_user(user)
    )

# ============== DREAMS ROUTES ==============

@api_router.get("/dreams", response_model=List[DreamResponse])
async def get_dreams(user: dict = Depends(get_current_user)):
    dreams = await db.dreams.find({"user_id": ObjectId(user["_id"])}).sort("date", -1).to_list(1000)
    return [serialize_dream(d) for d in dreams]

@api_router.post("/dreams", response_model=DreamResponse)
async def create_dream(dream_data: DreamCreate, user: dict = Depends(get_current_user)):
    now = datetime.utcnow()
    dream_doc = {
        "user_id": ObjectId(user["_id"]),
        "title": dream_data.title,
        "description": dream_data.description,
        "date": dream_data.date or now.strftime("%Y-%m-%d"),
        "tags": dream_data.tags,
        "themes": dream_data.themes,
        "is_lucid": dream_data.is_lucid,
        "is_public": dream_data.is_public,
        "ai_insight": None,
        "created_at": now,
        "updated_at": now
    }
    
    result = await db.dreams.insert_one(dream_doc)
    dream_doc["_id"] = result.inserted_id
    
    return serialize_dream(dream_doc)

@api_router.get("/dreams/{dream_id}", response_model=DreamResponse)
async def get_dream(dream_id: str, user: dict = Depends(get_current_user)):
    try:
        dream = await db.dreams.find_one({
            "_id": ObjectId(dream_id),
            "user_id": ObjectId(user["_id"])
        })
    except:
        raise HTTPException(status_code=404, detail="Dream not found")
    
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
    
    return serialize_dream(dream)

@api_router.put("/dreams/{dream_id}", response_model=DreamResponse)
async def update_dream(dream_id: str, dream_data: DreamUpdate, user: dict = Depends(get_current_user)):
    try:
        dream = await db.dreams.find_one({
            "_id": ObjectId(dream_id),
            "user_id": ObjectId(user["_id"])
        })
    except:
        raise HTTPException(status_code=404, detail="Dream not found")
    
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
    
    update_data = {k: v for k, v in dream_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.dreams.update_one(
        {"_id": ObjectId(dream_id)},
        {"$set": update_data}
    )
    
    updated_dream = await db.dreams.find_one({"_id": ObjectId(dream_id)})
    return serialize_dream(updated_dream)

@api_router.delete("/dreams/{dream_id}")
async def delete_dream(dream_id: str, user: dict = Depends(get_current_user)):
    try:
        result = await db.dreams.delete_one({
            "_id": ObjectId(dream_id),
            "user_id": ObjectId(user["_id"])
        })
    except:
        raise HTTPException(status_code=404, detail="Dream not found")
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Dream not found")
    
    return {"message": "Dream deleted"}

@api_router.post("/dreams/{dream_id}/insight", response_model=DreamResponse)
async def generate_insight(dream_id: str, user: dict = Depends(get_current_user)):
    try:
        dream = await db.dreams.find_one({
            "_id": ObjectId(dream_id),
            "user_id": ObjectId(user["_id"])
        })
    except:
        raise HTTPException(status_code=404, detail="Dream not found")
    
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
    
    # Generate AI insight using Emergent integration
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        import uuid
        
        prompt = f"""Analyze this dream and provide meaningful insights:

Title: {dream['title']}
Description: {dream['description']}
Themes: {', '.join(dream.get('themes', []))}
Tags: {', '.join(dream.get('tags', []))}
Lucid Dream: {'Yes' if dream.get('is_lucid') else 'No'}

Provide a thoughtful interpretation covering:
1. Key symbols and their meanings
2. Possible emotional connections
3. What the dream might be telling the dreamer
Keep your response concise (2-3 paragraphs)."""

        chat = LlmChat(
            api_key=os.environ.get('EMERGENT_LLM_KEY', ''),
            session_id=str(uuid.uuid4()),
            system_message="You are an insightful dream analyst who provides meaningful, personalized dream interpretations."
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        user_message = UserMessage(text=prompt)
        insight = await chat.send_message(user_message)
        
    except Exception as e:
        logger.error(f"AI insight generation failed: {e}")
        # Provide a fallback insight
        themes = dream.get('themes', [])
        insight = f"Your dream featuring {', '.join(themes) if themes else 'these elements'} suggests a journey of self-discovery. "
        insight += "Dreams often reflect our subconscious processing of daily experiences and deeper emotions. "
        insight += "Consider what aspects of your waking life might connect to the imagery in this dream."
    
    await db.dreams.update_one(
        {"_id": ObjectId(dream_id)},
        {"$set": {"ai_insight": insight, "updated_at": datetime.utcnow()}}
    )
    
    updated_dream = await db.dreams.find_one({"_id": ObjectId(dream_id)})
    return serialize_dream(updated_dream)

@api_router.get("/dreams/calendar/{year}/{month}")
async def get_calendar(year: int, month: int, user: dict = Depends(get_current_user)):
    start_date = f"{year}-{month:02d}-01"
    if month == 12:
        end_date = f"{year + 1}-01-01"
    else:
        end_date = f"{year}-{month + 1:02d}-01"
    
    dreams = await db.dreams.find({
        "user_id": ObjectId(user["_id"]),
        "date": {"$gte": start_date, "$lt": end_date}
    }).to_list(100)
    
    # Group by date
    calendar_data = {}
    for dream in dreams:
        date = dream["date"]
        if date not in calendar_data:
            calendar_data[date] = []
        calendar_data[date].append({
            "id": str(dream["_id"]),
            "title": dream["title"],
            "is_lucid": dream.get("is_lucid", False)
        })
    
    return calendar_data

# ============== STATS ROUTES ==============

@api_router.get("/stats", response_model=StatsResponse)
async def get_stats(user: dict = Depends(get_current_user)):
    user_id = ObjectId(user["_id"])
    
    # Total dreams
    total_dreams = await db.dreams.count_documents({"user_id": user_id})
    
    # This week's dreams
    today = datetime.utcnow()
    week_ago = (today - timedelta(days=7)).strftime("%Y-%m-%d")
    weekly_count = await db.dreams.count_documents({
        "user_id": user_id,
        "date": {"$gte": week_ago}
    })
    
    # This month's dreams
    month_start = today.replace(day=1).strftime("%Y-%m-%d")
    this_month_count = await db.dreams.count_documents({
        "user_id": user_id,
        "date": {"$gte": month_start}
    })
    
    # Lucid dreams
    lucid_count = await db.dreams.count_documents({
        "user_id": user_id,
        "is_lucid": True
    })
    
    # Calculate streak
    dreams = await db.dreams.find({"user_id": user_id}).sort("date", -1).to_list(1000)
    dates = sorted(set(d["date"] for d in dreams), reverse=True)
    
    current_streak = 0
    longest_streak = 0
    streak = 0
    
    if dates:
        today_str = today.strftime("%Y-%m-%d")
        yesterday_str = (today - timedelta(days=1)).strftime("%Y-%m-%d")
        
        # Check if streak is active (today or yesterday)
        if dates[0] in [today_str, yesterday_str]:
            for i, date in enumerate(dates):
                expected_date = (today - timedelta(days=i)).strftime("%Y-%m-%d")
                if i == 0 and date == yesterday_str:
                    expected_date = yesterday_str
                
                if date == expected_date or (i == 0 and date in [today_str, yesterday_str]):
                    streak += 1
                else:
                    break
            current_streak = streak
        
        # Calculate longest streak
        streak = 1
        for i in range(1, len(dates)):
            prev = datetime.strptime(dates[i-1], "%Y-%m-%d")
            curr = datetime.strptime(dates[i], "%Y-%m-%d")
            if (prev - curr).days == 1:
                streak += 1
            else:
                longest_streak = max(longest_streak, streak)
                streak = 1
        longest_streak = max(longest_streak, streak, current_streak)
    
    return StatsResponse(
        total_dreams=total_dreams,
        weekly_count=weekly_count,
        current_streak=current_streak,
        longest_streak=longest_streak,
        lucid_count=lucid_count,
        this_month_count=this_month_count
    )

# ============== ACHIEVEMENTS ROUTES ==============

ACHIEVEMENTS_CONFIG = [
    {"id": "first_dream", "name": "First Dream", "description": "Record your first dream", "icon": "moon", "target": 1},
    {"id": "week_warrior", "name": "Week Warrior", "description": "Record dreams for 7 days straight", "icon": "flame", "target": 7},
    {"id": "dream_collector", "name": "Dream Collector", "description": "Record 10 dreams", "icon": "albums", "target": 10},
    {"id": "lucid_explorer", "name": "Lucid Explorer", "description": "Record your first lucid dream", "icon": "eye", "target": 1},
    {"id": "storyteller", "name": "Storyteller", "description": "Record 25 dreams", "icon": "book", "target": 25},
    {"id": "night_owl", "name": "Night Owl", "description": "Record 50 dreams", "icon": "moon-outline", "target": 50},
    {"id": "dream_master", "name": "Dream Master", "description": "Record 100 dreams", "icon": "trophy", "target": 100},
    {"id": "lucid_master", "name": "Lucid Master", "description": "Record 10 lucid dreams", "icon": "sparkles", "target": 10},
    {"id": "month_dedication", "name": "Monthly Dedication", "description": "Record dreams for 30 days", "icon": "calendar", "target": 30},
    {"id": "theme_explorer", "name": "Theme Explorer", "description": "Use 5 different themes", "icon": "color-palette", "target": 5},
    {"id": "tag_master", "name": "Tag Master", "description": "Use 10 different tags", "icon": "pricetags", "target": 10},
    {"id": "insight_seeker", "name": "Insight Seeker", "description": "Generate AI insights for 5 dreams", "icon": "bulb", "target": 5},
    {"id": "social_dreamer", "name": "Social Dreamer", "description": "Share your first dream publicly", "icon": "share-social", "target": 1},
    {"id": "consistent", "name": "Consistent Dreamer", "description": "14 day streak", "icon": "ribbon", "target": 14},
    {"id": "veteran", "name": "Dream Veteran", "description": "Record dreams for 60 days", "icon": "medal", "target": 60},
    {"id": "legend", "name": "Dream Legend", "description": "Record 200 dreams", "icon": "star", "target": 200},
]

@api_router.get("/achievements", response_model=List[Achievement])
async def get_achievements(user: dict = Depends(get_current_user)):
    user_id = ObjectId(user["_id"])
    
    # Get user's dream data for progress calculation
    total_dreams = await db.dreams.count_documents({"user_id": user_id})
    lucid_dreams = await db.dreams.count_documents({"user_id": user_id, "is_lucid": True})
    public_dreams = await db.dreams.count_documents({"user_id": user_id, "is_public": True})
    insight_dreams = await db.dreams.count_documents({"user_id": user_id, "ai_insight": {"$ne": None}})
    
    # Get unique themes and tags
    dreams = await db.dreams.find({"user_id": user_id}).to_list(1000)
    unique_themes = set()
    unique_tags = set()
    dates = set()
    
    for dream in dreams:
        unique_themes.update(dream.get("themes", []))
        unique_tags.update(dream.get("tags", []))
        dates.add(dream["date"])
    
    # Calculate streak for achievements
    sorted_dates = sorted(dates, reverse=True)
    current_streak = 0
    if sorted_dates:
        today = datetime.utcnow()
        for i, date in enumerate(sorted_dates):
            expected = (today - timedelta(days=i)).strftime("%Y-%m-%d")
            if date == expected:
                current_streak += 1
            else:
                break
    
    # Map progress to achievements
    progress_map = {
        "first_dream": total_dreams,
        "week_warrior": current_streak,
        "dream_collector": total_dreams,
        "lucid_explorer": lucid_dreams,
        "storyteller": total_dreams,
        "night_owl": total_dreams,
        "dream_master": total_dreams,
        "lucid_master": lucid_dreams,
        "month_dedication": len(dates),
        "theme_explorer": len(unique_themes),
        "tag_master": len(unique_tags),
        "insight_seeker": insight_dreams,
        "social_dreamer": public_dreams,
        "consistent": current_streak,
        "veteran": len(dates),
        "legend": total_dreams,
    }
    
    achievements = []
    for config in ACHIEVEMENTS_CONFIG:
        progress = progress_map.get(config["id"], 0)
        unlocked = progress >= config["target"]
        achievements.append(Achievement(
            id=config["id"],
            name=config["name"],
            description=config["description"],
            icon=config["icon"],
            unlocked=unlocked,
            unlocked_at=datetime.utcnow() if unlocked else None,
            progress=min(progress, config["target"]),
            target=config["target"]
        ))
    
    return achievements

# ============== PATTERN ANALYSIS ROUTES ==============

@api_router.get("/analysis/patterns", response_model=PatternAnalysis)
async def get_patterns(user: dict = Depends(get_current_user)):
    user_id = ObjectId(user["_id"])
    dreams = await db.dreams.find({"user_id": user_id}).to_list(1000)
    
    if not dreams:
        return PatternAnalysis(
            recurring_themes=[],
            recurring_tags=[],
            word_frequency=[],
            monthly_activity=[],
            lucid_percentage=0
        )
    
    # Count themes
    theme_counts = {}
    tag_counts = {}
    word_counts = {}
    monthly_counts = {}
    lucid_count = 0
    
    for dream in dreams:
        # Themes
        for theme in dream.get("themes", []):
            theme_counts[theme] = theme_counts.get(theme, 0) + 1
        
        # Tags
        for tag in dream.get("tags", []):
            tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        # Words from description
        words = dream.get("description", "").lower().split()
        stop_words = {"the", "a", "an", "is", "was", "were", "i", "my", "me", "and", "or", "but", "in", "on", "at", "to", "of", "it", "this", "that"}
        for word in words:
            word = ''.join(c for c in word if c.isalnum())
            if word and len(word) > 2 and word not in stop_words:
                word_counts[word] = word_counts.get(word, 0) + 1
        
        # Monthly activity
        month = dream["date"][:7]  # YYYY-MM
        monthly_counts[month] = monthly_counts.get(month, 0) + 1
        
        # Lucid
        if dream.get("is_lucid"):
            lucid_count += 1
    
    # Sort and format
    recurring_themes = [{"name": k, "count": v} for k, v in sorted(theme_counts.items(), key=lambda x: -x[1])[:10]]
    recurring_tags = [{"name": k, "count": v} for k, v in sorted(tag_counts.items(), key=lambda x: -x[1])[:10]]
    word_frequency = [{"word": k, "count": v} for k, v in sorted(word_counts.items(), key=lambda x: -x[1])[:20]]
    monthly_activity = [{"month": k, "count": v} for k, v in sorted(monthly_counts.items())]
    
    lucid_percentage = (lucid_count / len(dreams) * 100) if dreams else 0
    
    return PatternAnalysis(
        recurring_themes=recurring_themes,
        recurring_tags=recurring_tags,
        word_frequency=word_frequency,
        monthly_activity=monthly_activity,
        lucid_percentage=round(lucid_percentage, 1)
    )

# ============== HEALTH CHECK ==============

@api_router.get("/")
async def root():
    return {"message": "Dream Vault API is running", "version": "1.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
