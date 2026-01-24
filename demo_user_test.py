import requests
import json

class DemoUserTester:
    def __init__(self, base_url="https://dreamjournal-17.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None

    def login_demo_user(self):
        """Login with demo user credentials"""
        login_data = {
            "email": "demo@test.com",
            "password": "demo123"
        }
        
        url = f"{self.base_url}/auth/login"
        headers = {'Content-Type': 'application/json'}
        
        try:
            response = requests.post(url, json=login_data, headers=headers, timeout=30)
            if response.status_code == 200:
                data = response.json()
                self.token = data['access_token']
                print(f"✅ Demo user logged in successfully")
                print(f"   User: {data['user']['name']} ({data['user']['email']})")
                return True
            else:
                print(f"❌ Login failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Login error: {str(e)}")
            return False

    def get_achievements(self):
        """Get demo user's achievements"""
        if not self.token:
            print("❌ No token available")
            return False
            
        url = f"{self.base_url}/achievements"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.token}'
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=30)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Achievements retrieved successfully")
                print(f"   Total achievements: {data['total_achievements']}")
                print(f"   Unlocked: {data['total_unlocked']}")
                
                # Show unlocked achievements
                unlocked = [a for a in data['achievements'] if a['unlocked']]
                print(f"\n🏆 Unlocked Achievements ({len(unlocked)}):")
                for ach in unlocked:
                    print(f"   {ach['icon']} {ach['name']} - {ach['description']}")
                    if ach.get('unlocked_at'):
                        print(f"      Unlocked: {ach['unlocked_at']}")
                
                # Show locked achievements with progress
                locked = [a for a in data['achievements'] if not a['unlocked']]
                print(f"\n🔒 Locked Achievements ({len(locked)}):")
                for ach in locked[:5]:  # Show first 5
                    progress_pct = (ach['progress'] / ach['target']) * 100 if ach['target'] > 0 else 0
                    print(f"   {ach['name']} - {ach['progress']}/{ach['target']} ({progress_pct:.0f}%)")
                
                return True
            else:
                print(f"❌ Failed to get achievements: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Error getting achievements: {str(e)}")
            return False

    def check_new_achievements(self):
        """Check for newly unlocked achievements"""
        if not self.token:
            print("❌ No token available")
            return False
            
        url = f"{self.base_url}/achievements/check"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.token}'
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=30)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Achievement check completed")
                
                newly_unlocked = data.get('newly_unlocked', [])
                if newly_unlocked:
                    print(f"🎉 {len(newly_unlocked)} newly unlocked achievements:")
                    for ach in newly_unlocked:
                        print(f"   {ach['icon']} {ach['name']} - {ach['description']}")
                else:
                    print("   No new achievements unlocked")
                
                return True
            else:
                print(f"❌ Failed to check achievements: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Error checking achievements: {str(e)}")
            return False

    def get_user_stats(self):
        """Get demo user's stats"""
        if not self.token:
            print("❌ No token available")
            return False
            
        url = f"{self.base_url}/stats"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.token}'
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=30)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ User stats retrieved")
                print(f"   Total dreams: {data['total_dreams']}")
                print(f"   Lucid dreams: {data['lucid_dreams']}")
                print(f"   Current streak: {data['current_streak']}")
                print(f"   Dreams this week: {data['dreams_this_week']}")
                return True
            else:
                print(f"❌ Failed to get stats: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Error getting stats: {str(e)}")
            return False

def main():
    print("🧪 Testing Demo User Achievements")
    print("=" * 40)
    
    tester = DemoUserTester()
    
    # Login
    if not tester.login_demo_user():
        return 1
    
    print("\n" + "=" * 40)
    
    # Get user stats first
    tester.get_user_stats()
    
    print("\n" + "=" * 40)
    
    # Get achievements
    tester.get_achievements()
    
    print("\n" + "=" * 40)
    
    # Check for new achievements
    tester.check_new_achievements()
    
    return 0

if __name__ == "__main__":
    exit(main())