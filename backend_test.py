import requests
import sys
import json
from datetime import datetime, timedelta

class ToolManagementAPITester:
    def __init__(self, base_url="https://tooltracker-7.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.passed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.passed_tests.append(name)
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.content else {}
                except:
                    return success, {}
            else:
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200] if response.text else "No response"
                })
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_login(self):
        """Test login with admin credentials"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"username": "admin", "password": "admin123"}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Token received: {self.token[:20]}...")
            return True, response.get('user', {})
        return False, {}

    def test_get_me(self):
        """Test get current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success, response

    def test_create_tool(self):
        """Test creating a new tool"""
        tool_data = {
            "equipment_name": "Test Multimeter",
            "brand_type": "Fluke 87V",
            "serial_no": "TEST001",
            "inventory_code": "INV001",
            "periodic_inspection_date": "2024-01-15",
            "calibration_date": "2024-01-15",
            "calibration_validity_months": 12,
            "condition": "Good",
            "description": "Digital multimeter for testing",
            "equipment_location": "Lab A"
        }
        success, response = self.run_test(
            "Create Tool",
            "POST",
            "tools",
            200,
            data=tool_data
        )
        return success, response

    def test_get_tools(self):
        """Test getting all tools"""
        success, response = self.run_test(
            "Get All Tools",
            "GET",
            "tools",
            200
        )
        return success, response

    def test_update_tool(self, tool_id):
        """Test updating a tool"""
        update_data = {
            "equipment_name": "Updated Test Multimeter",
            "brand_type": "Fluke 87V Updated",
            "serial_no": "TEST001",
            "inventory_code": "INV001",
            "periodic_inspection_date": "2024-02-15",
            "calibration_date": "2024-02-15",
            "calibration_validity_months": 18,
            "condition": "Good",
            "description": "Updated digital multimeter",
            "equipment_location": "Lab B"
        }
        success, response = self.run_test(
            "Update Tool",
            "PUT",
            f"tools/{tool_id}",
            200,
            data=update_data
        )
        return success, response

    def test_delete_tool(self, tool_id):
        """Test deleting a tool"""
        success, response = self.run_test(
            "Delete Tool",
            "DELETE",
            f"tools/{tool_id}",
            200
        )
        return success, response

    def test_excel_export(self):
        """Test Excel export functionality"""
        success, _ = self.run_test(
            "Excel Export",
            "GET",
            "tools/export/excel",
            200,
            headers={'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
        )
        return success

    def test_create_loan(self):
        """Test creating a loan"""
        loan_data = {
            "borrower_name": "John Doe",
            "loan_date": "2024-08-15",
            "return_date": "2024-08-30",
            "project_name": "Test Project",
            "wbs_project_no": "WBS001",
            "project_location": "Site A",
            "equipments": [
                {
                    "equipment_name": "Test Multimeter",
                    "serial_no": "TEST001",
                    "condition": "Good"
                }
            ]
        }
        success, response = self.run_test(
            "Create Loan",
            "POST",
            "loans",
            200,
            data=loan_data
        )
        return success, response

    def test_get_loans(self):
        """Test getting all loans"""
        success, response = self.run_test(
            "Get All Loans",
            "GET",
            "loans",
            200
        )
        return success, response

    def test_loan_pdf(self, loan_id):
        """Test loan PDF generation"""
        success, _ = self.run_test(
            "Loan PDF Generation",
            "GET",
            f"loans/{loan_id}/pdf",
            200,
            headers={'Accept': 'application/pdf'}
        )
        return success

    def test_create_calibration(self):
        """Test creating a calibration record"""
        cal_data = {
            "device_name": "Test Multimeter",
            "serial_no": "TEST001",
            "calibration_date": "2024-08-15",
            "calibration_expiry_date": "2025-08-15",
            "device_condition": "Good",
            "calibration_agency": "Test Agency",
            "calibration_location": "Calibration Lab",
            "person_name": "Jane Smith"
        }
        success, response = self.run_test(
            "Create Calibration",
            "POST",
            "calibrations",
            200,
            data=cal_data
        )
        return success, response

    def test_get_calibrations(self):
        """Test getting all calibrations"""
        success, response = self.run_test(
            "Get All Calibrations",
            "GET",
            "calibrations",
            200
        )
        return success, response

    def test_viewer_permissions(self):
        """Test viewer role permissions (should fail for POST/PUT/DELETE)"""
        # This would require creating a viewer user first
        # For now, we'll skip this test
        print("\n🔍 Testing Viewer Permissions...")
        print("⚠️  Skipped - Requires viewer user creation")
        return True

def main():
    print("🚀 Starting Tool Management API Tests")
    print("=" * 50)
    
    tester = ToolManagementAPITester()
    
    # Test authentication
    login_success, user_data = tester.test_login()
    if not login_success:
        print("❌ Login failed, stopping tests")
        return 1
    
    print(f"✅ Logged in as: {user_data.get('full_name', 'Unknown')} ({user_data.get('role', 'Unknown')})")
    
    # Test user info
    tester.test_get_me()
    
    # Test tool operations
    tool_success, tool_data = tester.test_create_tool()
    tool_id = tool_data.get('id') if tool_success else None
    
    tester.test_get_tools()
    
    if tool_id:
        tester.test_update_tool(tool_id)
        
        # Test loan operations
        loan_success, loan_data = tester.test_create_loan()
        loan_id = loan_data.get('id') if loan_success else None
        
        tester.test_get_loans()
        
        if loan_id:
            tester.test_loan_pdf(loan_id)
        
        # Test calibration operations
        tester.test_create_calibration()
        tester.test_get_calibrations()
        
        # Test Excel export
        tester.test_excel_export()
        
        # Clean up - delete test tool
        tester.test_delete_tool(tool_id)
    
    # Test viewer permissions
    tester.test_viewer_permissions()
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.failed_tests:
        print("\n❌ Failed Tests:")
        for failure in tester.failed_tests:
            print(f"   - {failure.get('test', 'Unknown')}: {failure.get('error', failure.get('response', 'Unknown error'))}")
    
    if tester.passed_tests:
        print(f"\n✅ Passed Tests: {', '.join(tester.passed_tests)}")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"\n📈 Success Rate: {success_rate:.1f}%")
    
    return 0 if success_rate >= 80 else 1

if __name__ == "__main__":
    sys.exit(main())