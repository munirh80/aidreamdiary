#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Build Dream Vault - a mobile dream journal app with AI-powered insights. Backend API built locally with MongoDB."

backend:
  - task: "Authentication API (Register/Login)"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "JWT auth endpoints /api/auth/register and /api/auth/login working. Tested via curl and web UI."

  - task: "Dreams CRUD API"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Full CRUD - GET/POST/PUT/DELETE /api/dreams. Tested with curl."

  - task: "AI Dream Insights"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "POST /api/dreams/{id}/insight uses Emergent LLM (Claude Sonnet) for dream interpretation. Tested and returns detailed insights."

  - task: "Stats & Achievements API"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "GET /api/stats, GET /api/achievements, GET /api/analysis/patterns all working."

  - task: "Calendar API"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "GET /api/dreams/calendar/{year}/{month} returns dreams grouped by date."

frontend:
  - task: "Authentication Flow (Login/Register)"
    implemented: true
    working: true
    file: "app/auth/login.tsx, app/auth/register.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "JWT auth with email/password. Token validation on app start, auto-logout on invalid token. Tested via web preview."

  - task: "Logout Functionality"
    implemented: true
    working: true
    file: "app/(tabs)/profile.tsx"
    stuck_count: 1
    priority: "high"
    needs_retesting: false
    status_history:
      - working: false
        agent: "user"
        comment: "User reported logout not working on web"
      - working: true
        agent: "main"
        comment: "Fixed - Added Platform.select for web (window.confirm) vs mobile (Alert.alert). Logout now works and redirects to login."

  - task: "Dream Journal CRUD"
    implemented: true
    working: true
    file: "app/(tabs)/create.tsx, app/dream/[id].tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Create dreams with title, description, themes, tags, lucid toggle. View/edit/delete dreams. Tested via API."

  - task: "Dashboard with Stats"
    implemented: true
    working: true
    file: "app/(tabs)/index.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Shows total dreams, streak, lucid dreams count. Lists recent dreams. Screenshot verified."

  - task: "Dream Calendar"
    implemented: true
    working: true
    file: "app/(tabs)/calendar.tsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Monthly view showing days with dreams. Screenshot verified."

  - task: "Insights & Patterns"
    implemented: true
    working: true
    file: "app/(tabs)/insights.tsx"
    stuck_count: 1
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: false
        agent: "user"
        comment: "User reported crash - Cannot read properties of undefined"
      - working: true
        agent: "main"
        comment: "Fixed field name mismatches (common_words→word_frequency, recurring_symbols→recurring_themes). Screenshot verified."

  - task: "Profile & Settings"
    implemented: true
    working: true
    file: "app/(tabs)/profile.tsx, app/settings/*.tsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "User profile with stats, notification settings, streak freeze info, shared dreams management. Screenshot verified."

  - task: "Dark Mystical Theme Design"
    implemented: true
    working: true
    file: "src/components/StarryBackground.tsx, src/components/GlassCard.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Deep navy/black background, purple/cyan accents, twinkling stars animation, glassmorphism cards, Cormorant Garamond + Manrope fonts"

metadata:
  created_by: "main_agent"
  version: "2.0"
  test_sequence: 2
  run_ui: true

test_plan:
  current_focus:
    - "All features tested and working"
  stuck_tasks: []
  test_all: false
  test_priority: "complete"

agent_communication:
  - agent: "main"
    message: "All features implemented and tested. Backend API built from scratch with full Dream Vault functionality. Frontend connected and working. Logout fixed for web. Insights screen fixed. Database cleared for fresh start. Ready for GitHub push."
