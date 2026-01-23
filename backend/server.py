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

class DreamUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    tags: Optional[List[str]] = None
    themes: Optional[List[str]] = None

class DreamResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: str
    date: str
    tags: List[str]
    themes: List[str]
    ai_insight: Optional[str] = None
    created_at: str
    updated_at: str

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
        "exp": datetime.now(timezone.utc).timestamp() + 86400 * 7  # 7 days
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
    return [DreamResponse(**dream) for dream in dreams]

@api_router.get("/dreams/{dream_id}", response_model=DreamResponse)
async def get_dream(dream_id: str, current_user: dict = Depends(get_current_user)):
    dream = await db.dreams.find_one(
        {"id": dream_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
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
    
    # Get total dreams count
    total_dreams = await db.dreams.count_documents({"user_id": user_id})
    
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
    from datetime import timedelta
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    dreams_this_week = await db.dreams.count_documents({
        "user_id": user_id,
        "date": {"$gte": week_ago[:10]}
    })
    
    return {
        "total_dreams": total_dreams,
        "dreams_this_week": dreams_this_week,
        "top_tags": [{"name": t[0], "count": t[1]} for t in top_tags],
        "top_themes": [{"name": t[0], "count": t[1]} for t in top_themes]
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
