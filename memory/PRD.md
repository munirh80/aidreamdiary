# Dream Journal App - PRD

## Original Problem Statement
Create a dream application that can give insight to your dream, record and track journal

## User Choices
- AI Dream Insights: Claude Sonnet 4.5 (via Emergent LLM Key)
- Tracking: Basic (date, title, description) + recurring themes and tags  
- Authentication: JWT-based custom auth (email/password)

## Core Requirements
- User registration and authentication
- Dream CRUD operations (create, read, update, delete)
- AI-powered dream interpretation using Claude Sonnet 4.5
- Tag and theme tracking for dreams
- Dashboard with statistics and recent dreams
- Search and filter dreams

## Tech Stack
- **Backend**: FastAPI (Python)
- **Frontend**: React with Shadcn UI components
- **Database**: MongoDB
- **AI**: Claude Sonnet 4.5 via emergentintegrations library
- **Auth**: JWT tokens with bcrypt password hashing

## What's Been Implemented (January 2025)
1. **Authentication System**
   - User registration with email/password
   - JWT-based login with 7-day token expiry
   - Protected routes on frontend

2. **Dream Journal Features**
   - Create dreams with title, description, date
   - Add custom tags and select recurring themes
   - View all dreams with search/filter
   - Edit and delete dreams
   - View individual dream details

3. **AI Dream Insights**
   - Generate AI interpretations using Claude Sonnet 4.5
   - Insights cover symbols, emotional themes, and reflection prompts
   - Regenerate new interpretations

4. **Dashboard**
   - Total dreams count
   - Dreams this week
   - Top recurring themes
   - Top tags with counts
   - Recent dreams preview

5. **UI/UX**
   - Dark mystical theme with glassmorphism effects
   - Responsive design (desktop sidebar + mobile bottom nav)
   - Cormorant Garamond + Manrope typography
   - Smooth animations and transitions

## API Endpoints
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user
- GET /api/dreams - List all dreams
- POST /api/dreams - Create dream
- GET /api/dreams/:id - Get dream details
- PUT /api/dreams/:id - Update dream
- DELETE /api/dreams/:id - Delete dream
- POST /api/dreams/:id/insight - Generate AI insight
- GET /api/stats - Get user statistics

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] User authentication
- [x] Dream CRUD
- [x] AI insights

### P1 (Important) - Future
- [ ] Dream pattern analysis over time
- [ ] Export dreams to PDF
- [ ] Dream calendar view
- [ ] Social sharing of dreams

### P2 (Nice to Have) - Future
- [ ] Dream symbol dictionary
- [ ] Sleep quality tracking
- [ ] Mood correlation charts
- [ ] Voice recording for dreams
