import requests
import sys
import json
from datetime import datetime, timedelta

class DreamJournalAPITester:
    def __init__(self, base_url="https://dreamjournal-17.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_dream_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_register(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_user_data = {
            "email": f"test_user_{timestamp}@example.com",
            "password": "TestPass123!",
            "name": f"Test User {timestamp}"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_login(self):
        """Test user login with existing credentials"""
        # First register a user
        timestamp = datetime.now().strftime('%H%M%S')
        register_data = {
            "email": f"login_test_{timestamp}@example.com",
            "password": "TestPass123!",
            "name": f"Login Test {timestamp}"
        }
        
        # Register first
        reg_success, _ = self.run_test(
            "Register for Login Test",
            "POST",
            "auth/register",
            200,
            data=register_data
        )
        
        if not reg_success:
            return False
            
        # Now test login
        login_data = {
            "email": register_data["email"],
            "password": register_data["password"]
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        return success and 'access_token' in response

    def test_get_me(self):
        """Test getting current user info"""
        if not self.token:
            print("❌ No token available for auth test")
            return False
            
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        
        return success and 'id' in response

    def test_create_dream(self):
        """Test creating a new dream"""
        if not self.token:
            print("❌ No token available for dream creation")
            return False
            
        dream_data = {
            "title": "Test Dream - Flying Over Mountains",
            "description": "I was soaring through the clouds above snow-capped mountains. The feeling of freedom was incredible, and I could see eagles flying alongside me. The landscape below was breathtaking with deep valleys and crystal clear lakes.",
            "date": datetime.now().strftime('%Y-%m-%d'),
            "tags": ["flying", "mountains", "freedom", "nature"],
            "themes": ["Flying", "Animals", "Travel"],
            "is_lucid": True,
            "is_public": False
        }
        
        success, response = self.run_test(
            "Create Dream",
            "POST",
            "dreams",
            200,
            data=dream_data
        )
        
        if success and 'id' in response:
            self.created_dream_id = response['id']
            print(f"   Created dream ID: {self.created_dream_id}")
            return True
        return False

    def test_get_dreams(self):
        """Test getting all dreams"""
        if not self.token:
            print("❌ No token available for getting dreams")
            return False
            
        success, response = self.run_test(
            "Get All Dreams",
            "GET",
            "dreams",
            200
        )
        
        return success and isinstance(response, list)

    def test_get_dream_by_id(self):
        """Test getting a specific dream by ID"""
        if not self.token or not self.created_dream_id:
            print("❌ No token or dream ID available")
            return False
            
        success, response = self.run_test(
            "Get Dream by ID",
            "GET",
            f"dreams/{self.created_dream_id}",
            200
        )
        
        return success and response.get('id') == self.created_dream_id

    def test_update_dream(self):
        """Test updating a dream"""
        if not self.token or not self.created_dream_id:
            print("❌ No token or dream ID available")
            return False
            
        update_data = {
            "title": "Updated Test Dream - Flying Over Mountains",
            "description": "Updated description: I was soaring through the clouds above snow-capped mountains. The feeling of freedom was incredible, and I could see eagles flying alongside me. The landscape below was breathtaking with deep valleys and crystal clear lakes. I felt completely at peace.",
            "tags": ["flying", "mountains", "freedom", "nature", "peace"],
            "themes": ["Flying", "Animals", "Travel", "Supernatural"]
        }
        
        success, response = self.run_test(
            "Update Dream",
            "PUT",
            f"dreams/{self.created_dream_id}",
            200,
            data=update_data
        )
        
        return success and response.get('title') == update_data['title']

    def test_generate_ai_insight(self):
        """Test generating AI insight for a dream"""
        if not self.token or not self.created_dream_id:
            print("❌ No token or dream ID available")
            return False
            
        print("   Note: AI insight generation may take 10-15 seconds...")
        success, response = self.run_test(
            "Generate AI Insight",
            "POST",
            f"dreams/{self.created_dream_id}/insight",
            200
        )
        
        return success and 'insight' in response

    def test_get_stats(self):
        """Test getting user statistics"""
        if not self.token:
            print("❌ No token available for stats")
            return False
            
        success, response = self.run_test(
            "Get User Stats",
            "GET",
            "stats",
            200
        )
        
        expected_fields = ['total_dreams', 'dreams_this_week', 'top_tags', 'top_themes', 'current_streak', 'longest_streak']
        return success and all(field in response for field in expected_fields)

    def test_calendar_endpoint(self):
        """Test calendar endpoint for specific month"""
        if not self.token:
            print("❌ No token available for calendar")
            return False
            
        # Test current month
        current_date = datetime.now()
        year = current_date.year
        month = current_date.month
        
        success, response = self.run_test(
            "Get Calendar Data",
            "GET",
            f"dreams/calendar/{year}/{month}",
            200
        )
        
        return success and 'dreams_by_date' in response

    def test_pattern_analysis(self):
        """Test pattern analysis endpoint"""
        if not self.token:
            print("❌ No token available for pattern analysis")
            return False
            
        success, response = self.run_test(
            "Get Pattern Analysis",
            "GET",
            "analysis/patterns",
            200
        )
        
        expected_fields = ['total_analyzed', 'recurring_symbols', 'theme_trends', 'common_words', 'monthly_activity']
        return success and all(field in response for field in expected_fields)

    def test_delete_dream(self):
        """Test deleting a dream"""
        if not self.token or not self.created_dream_id:
            print("❌ No token or dream ID available")
            return False
            
        success, response = self.run_test(
            "Delete Dream",
            "DELETE",
            f"dreams/{self.created_dream_id}",
            200
        )
        
        return success

    def test_settings_endpoints(self):
        """Test user settings endpoints"""
        if not self.token:
            print("❌ No token available for settings")
            return False
            
        # Test get settings
        success, response = self.run_test(
            "Get Settings",
            "GET",
            "settings",
            200
        )
        
        if not success:
            return False
            
        # Test update settings
        settings_data = {
            "reminder_enabled": True,
            "reminder_time": "09:30",
            "streak_freeze_count": 1
        }
        
        success, response = self.run_test(
            "Update Settings",
            "PUT",
            "settings",
            200,
            data=settings_data
        )
        
        return success and response.get('reminder_enabled') == True

    def test_streak_freeze_endpoints(self):
        """Test streak freeze functionality"""
        if not self.token:
            print("❌ No token available for streak freeze")
            return False
            
        # First add a freeze
        success, response = self.run_test(
            "Add Streak Freeze",
            "POST",
            "settings/add-freeze",
            200
        )
        
        if not success:
            return False
            
        # Then use a freeze
        success, response = self.run_test(
            "Use Streak Freeze",
            "POST",
            "settings/use-freeze",
            200
        )
        
        return success and 'remaining_freezes' in response

    def test_dream_sharing(self):
        """Test dream sharing functionality"""
        if not self.token or not self.created_dream_id:
            print("❌ No token or dream ID available for sharing")
            return False
            
        # Test share dream
        success, response = self.run_test(
            "Share Dream",
            "POST",
            f"dreams/{self.created_dream_id}/share",
            200
        )
        
        if not success or 'share_id' not in response:
            return False
            
        share_id = response['share_id']
        
        # Test get public dream (no auth required)
        original_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Get Public Dream",
            "GET",
            f"public/dream/{share_id}",
            200
        )
        
        self.token = original_token
        
        if not success:
            return False
            
        # Test unshare dream
        success, response = self.run_test(
            "Unshare Dream",
            "POST",
            f"dreams/{self.created_dream_id}/unshare",
            200
        )
        
        return success

    def test_public_dreams_endpoint(self):
        """Test public dreams explore endpoint"""
        # No auth required for this endpoint
        original_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Get Public Dreams",
            "GET",
            "public/dreams?limit=10",
            200
        )
        
        self.token = original_token
        return success and isinstance(response, list)

    def test_achievements_endpoint(self):
        """Test achievements endpoint"""
        if not self.token:
            print("❌ No token available for achievements")
            return False
            
        success, response = self.run_test(
            "Get Achievements",
            "GET",
            "achievements",
            200
        )
        
        expected_fields = ['achievements', 'total_unlocked', 'total_achievements']
        if not (success and all(field in response for field in expected_fields)):
            return False
            
        # Verify achievements structure
        achievements = response.get('achievements', [])
        if not achievements:
            print("❌ No achievements returned")
            return False
            
        # Check first achievement structure
        first_ach = achievements[0]
        required_ach_fields = ['id', 'name', 'description', 'icon', 'category', 'unlocked', 'progress', 'target']
        if not all(field in first_ach for field in required_ach_fields):
            print(f"❌ Achievement missing required fields: {first_ach}")
            return False
            
        print(f"   Found {len(achievements)} achievements, {response['total_unlocked']} unlocked")
        return True

    def test_achievements_check_endpoint(self):
        """Test achievements check endpoint for newly unlocked"""
        if not self.token:
            print("❌ No token available for achievements check")
            return False
            
        success, response = self.run_test(
            "Check New Achievements",
            "GET",
            "achievements/check",
            200
        )
        
        expected_fields = ['newly_unlocked', 'total_unlocked', 'total_achievements']
        if not (success and all(field in response for field in expected_fields)):
            return False
            
        # Verify newly_unlocked is a list
        newly_unlocked = response.get('newly_unlocked', [])
        if not isinstance(newly_unlocked, list):
            print("❌ newly_unlocked should be a list")
            return False
            
        print(f"   Found {len(newly_unlocked)} newly unlocked achievements")
        return True

    def test_invalid_token(self):
        """Test API with invalid token"""
        original_token = self.token
        self.token = "invalid_token_12345"
        
        success, _ = self.run_test(
            "Invalid Token Test",
            "GET",
            "auth/me",
            401
        )
        
        self.token = original_token
        return success

    def test_unauthorized_access(self):
        """Test API without token"""
        original_token = self.token
        self.token = None
        
        success, _ = self.run_test(
            "Unauthorized Access Test",
            "GET",
            "dreams",
            401
        )
        
        self.token = original_token
        return success

def main():
    print("🚀 Starting Dream Journal API Tests")
    print("=" * 50)
    
    tester = DreamJournalAPITester()
    
    # Test sequence
    tests = [
        ("Root Endpoint", tester.test_root_endpoint),
        ("User Registration", tester.test_register),
        ("User Login", tester.test_login),
        ("Get Current User", tester.test_get_me),
        ("Settings Endpoints", tester.test_settings_endpoints),
        ("Streak Freeze Endpoints", tester.test_streak_freeze_endpoints),
        ("Achievements Endpoint", tester.test_achievements_endpoint),
        ("Achievements Check Endpoint", tester.test_achievements_check_endpoint),
        ("Create Dream", tester.test_create_dream),
        ("Get All Dreams", tester.test_get_dreams),
        ("Get Dream by ID", tester.test_get_dream_by_id),
        ("Update Dream", tester.test_update_dream),
        ("Dream Sharing", tester.test_dream_sharing),
        ("Public Dreams Endpoint", tester.test_public_dreams_endpoint),
        ("Generate AI Insight", tester.test_generate_ai_insight),
        ("Get User Stats", tester.test_get_stats),
        ("Calendar Endpoint", tester.test_calendar_endpoint),
        ("Pattern Analysis", tester.test_pattern_analysis),
        ("Invalid Token", tester.test_invalid_token),
        ("Unauthorized Access", tester.test_unauthorized_access),
        ("Delete Dream", tester.test_delete_dream),
    ]
    
    failed_tests = []
    
    for test_name, test_func in tests:
        try:
            if not test_func():
                failed_tests.append(test_name)
        except Exception as e:
            print(f"❌ {test_name} - Exception: {str(e)}")
            failed_tests.append(test_name)
    
    # Print results
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS")
    print("=" * 50)
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {len(failed_tests)}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if failed_tests:
        print(f"\n❌ Failed tests: {', '.join(failed_tests)}")
        return 1
    else:
        print("\n✅ All tests passed!")
        return 0

if __name__ == "__main__":
    sys.exit(main())