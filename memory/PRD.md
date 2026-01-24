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
   - JWT-based login with 30-day token expiry
   - Protected routes on frontend

2. **Dream Journal Features**
   - Create dreams with title, description, date
   - Add custom tags and select recurring themes
   - **Lucid dream tracking** toggle
   - View all dreams with search/filter
   - Edit and delete dreams
   - View individual dream details

3. **AI Dream Insights**
   - Generate AI interpretations using Claude Sonnet 4.5
   - Insights cover symbols, emotional themes, and reflection prompts
   - Regenerate new interpretations

4. **Dashboard**
   - Total dreams count (with lucid dream count)
   - Dreams this week
   - Top recurring themes
   - Top tags with counts
   - Recent dreams preview
   - **Dream Streak display** (current & longest)
   - **Motivational streak banner**
   - **Streak freeze indicator**

5. **Dream Calendar View**
   - Monthly calendar visualization
   - Dream indicators on dates
   - Click to view dreams for a specific date
   - Navigate between months

6. **Pattern Analysis**
   - Recurring symbols detection (water, flying, chase, etc.)
   - Word cloud from dream descriptions
   - Monthly activity chart
   - Theme evolution over time

7. **PDF Export**
   - Export individual dreams to PDF
   - Export entire journal (all dreams)
   - Styled printable format with insights

8. **Dream Streak Gamification**
   - Track current consecutive days journaling
   - Display longest streak record
   - Motivational banner when on a streak
   - **Streak freeze feature** to skip a day without breaking streak

9. **Social Sharing** (NEW)
   - Share individual dreams publicly with a unique link
   - Privacy controls - make dreams public/private
   - Public dream badges
   - Copy share link functionality

10. **Explore Page** (NEW)
    - Discover public dreams from the community
    - Search public dreams
    - No authentication required
    - Links to full dream view

11. **Settings Page** (NEW)
    - Dream reminder toggle (browser notifications)
    - Customizable reminder time
    - Streak freeze management (view, use, earn)
    - Account information display

12. **Push Notifications** (NEW)
    - Service worker for background notifications
    - Browser notification permission handling
    - Scheduled daily reminders at custom time
    - Click-to-action on notifications

13. **Achievements System** (NEW)
    - 16 badges across 7 categories
    - Categories: Getting Started, Dream Collection, Consistency, Lucid Dreaming, AI Insights, Community, Exploration
    - Progress tracking for each achievement
    - Toast notifications when unlocking new badges
    - Dashboard quick-view with overall progress
    - Milestones: 7/30/100-day streaks, 10/50/100 dreams, lucid dreams, insights, shares, tags, themes

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
- POST /api/dreams/:id/share - Make dream public
- POST /api/dreams/:id/unshare - Make dream private
- GET /api/stats - Get user statistics (includes streak, lucid count)
- GET /api/dreams/calendar/:year/:month - Get dreams for calendar view
- GET /api/analysis/patterns - Get pattern analysis data
- GET /api/settings - Get user settings
- PUT /api/settings - Update user settings
- POST /api/settings/use-freeze - Use a streak freeze
- POST /api/settings/add-freeze - Earn a streak freeze
- GET /api/public/dream/:shareId - Get public dream (no auth)
- GET /api/public/dreams - List public dreams (no auth)
- GET /api/achievements - Get all achievements with progress
- GET /api/achievements/check - Check for newly unlocked achievements

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] User authentication
- [x] Dream CRUD
- [x] AI insights
- [x] Dream calendar view
- [x] PDF export
- [x] Pattern analysis
- [x] Dream streak gamification
- [x] Streak freeze/grace period
- [x] Social sharing with privacy
- [x] Lucid dream tracking
- [x] Dream reminders/settings
- [x] Public explore page

- [x] Push notifications with service worker
- [x] Achievements/badges system

### P1 (Important) - Future
- [ ] Email newsletter (weekly dream insights digest)
- [ ] Dream comparison tool (compare two dreams side-by-side)
- [ ] Sleep quality correlation tracking
- [ ] Multi-language support

### P2 (Nice to Have) - Future
- [ ] Dream symbol dictionary
- [ ] Voice recording for dreams
- [ ] Community dream interpretations
- [ ] Dream mood board/visualization
- [ ] Dream challenges (weekly prompts)
