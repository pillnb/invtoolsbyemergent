#!/usr/bin/env python3
"""
Focused Backend API Tests for Tool Management Application
Tests the specific functionalities mentioned in the review request:
1. Login Flow
2. Tool Data Fetching  
3. Add Tool Functionality
4. Loan Data Fetching
5. Add Loan Functionality
"""

import requests
import sys
import json
from datetime import datetime, timedelta

class FocusedAPITester:
    def __init__(self, base_url="https://tool-inventory-14.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.passed_tests = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            self.passed_tests.append(name)
            print(f"✅ {name} - PASSED")
            if details:
                print(f"   {details}")
        else:
            self.failed_tests.append({"test": name, "details": details})
            print(f"❌ {name} - FAILED")
            if details:
                print(f"   {details}")

    def make_request(self, method, endpoint, data=None, headers=None):
        """Make HTTP request with proper headers"""
        url = f"{self.api_url}/{endpoint}"
        request_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            request_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            request_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=request_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=request_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=request_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=request_headers, timeout=10)
            
            return response
        except Exception as e:
            print(f"Request failed: {str(e)}")
            return None

    def test_1_login_flow(self):
        """Test 1: Login Flow with admin/admin123 credentials"""
        print("\n🔐 TEST 1: LOGIN FLOW")
        print("=" * 50)
        
        # Test login with correct credentials
        response = self.make_request('POST', 'auth/login', {
            "username": "admin",
            "password": "admin123"
        })
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                if 'access_token' in data and 'user' in data:
                    self.token = data['access_token']
                    self.user_data = data['user']
                    self.log_test(
                        "Login with admin/admin123", 
                        True, 
                        f"Token received, User: {self.user_data.get('full_name')} ({self.user_data.get('role')})"
                    )
                    
                    # Test token validation by calling /auth/me
                    me_response = self.make_request('GET', 'auth/me')
                    if me_response and me_response.status_code == 200:
                        me_data = me_response.json()
                        self.log_test(
                            "Token validation (/auth/me)", 
                            True, 
                            f"User ID: {me_data.get('id')}, Role: {me_data.get('role')}"
                        )
                    else:
                        self.log_test("Token validation (/auth/me)", False, "Failed to validate token")
                    
                    return True
                else:
                    self.log_test("Login with admin/admin123", False, "Missing access_token or user in response")
            except Exception as e:
                self.log_test("Login with admin/admin123", False, f"JSON parsing error: {str(e)}")
        else:
            status = response.status_code if response else "No response"
            self.log_test("Login with admin/admin123", False, f"HTTP {status}")
        
        return False

    def test_2_tool_data_fetching(self):
        """Test 2: Tool Data Fetching - Verify Tools page displays tools correctly"""
        print("\n🔧 TEST 2: TOOL DATA FETCHING")
        print("=" * 50)
        
        if not self.token:
            self.log_test("Tool data fetching", False, "No authentication token available")
            return False
        
        response = self.make_request('GET', 'tools')
        
        if response and response.status_code == 200:
            try:
                tools = response.json()
                if isinstance(tools, list):
                    tool_count = len(tools)
                    self.log_test(
                        "GET /api/tools", 
                        True, 
                        f"Retrieved {tool_count} tools"
                    )
                    
                    # Verify tool structure
                    if tool_count > 0:
                        sample_tool = tools[0]
                        required_fields = ['id', 'equipment_name', 'brand_type', 'serial_no', 'inventory_code', 'condition', 'equipment_location']
                        missing_fields = [field for field in required_fields if field not in sample_tool]
                        
                        if not missing_fields:
                            self.log_test(
                                "Tool data structure validation", 
                                True, 
                                f"All required fields present in tool data"
                            )
                        else:
                            self.log_test(
                                "Tool data structure validation", 
                                False, 
                                f"Missing fields: {missing_fields}"
                            )
                    else:
                        self.log_test("Tool data structure validation", True, "No tools to validate (empty database)")
                    
                    return True
                else:
                    self.log_test("GET /api/tools", False, "Response is not a list")
            except Exception as e:
                self.log_test("GET /api/tools", False, f"JSON parsing error: {str(e)}")
        else:
            status = response.status_code if response else "No response"
            self.log_test("GET /api/tools", False, f"HTTP {status}")
        
        return False

    def test_3_add_tool_functionality(self):
        """Test 3: Add Tool Functionality - Test adding a new tool"""
        print("\n➕ TEST 3: ADD TOOL FUNCTIONALITY")
        print("=" * 50)
        
        if not self.token:
            self.log_test("Add tool functionality", False, "No authentication token available")
            return False
        
        # Create realistic test tool data
        test_tool = {
            "equipment_name": "Digital Multimeter DMM-2024",
            "brand_type": "Fluke 87V Industrial",
            "serial_no": f"FL{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "inventory_code": f"INV-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "asset_number": f"AST-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "periodic_inspection_date": "2024-01-15",
            "calibration_date": "2024-01-15",
            "calibration_validity_months": 12,
            "condition": "Good",
            "description": "High-precision digital multimeter for electrical measurements",
            "equipment_location": "Electrical Testing Laboratory"
        }
        
        response = self.make_request('POST', 'tools', test_tool)
        
        if response and response.status_code == 200:
            try:
                created_tool = response.json()
                if 'id' in created_tool:
                    tool_id = created_tool['id']
                    self.log_test(
                        "POST /api/tools (Create Tool)", 
                        True, 
                        f"Tool created with ID: {tool_id}"
                    )
                    
                    # Verify the created tool has all expected fields
                    expected_fields = ['id', 'equipment_name', 'brand_type', 'serial_no', 'status', 'calibration_expiry_date']
                    missing_fields = [field for field in expected_fields if field not in created_tool]
                    
                    if not missing_fields:
                        self.log_test(
                            "Created tool data validation", 
                            True, 
                            f"Status: {created_tool.get('status')}, Expiry: {created_tool.get('calibration_expiry_date')}"
                        )
                    else:
                        self.log_test(
                            "Created tool data validation", 
                            False, 
                            f"Missing fields in response: {missing_fields}"
                        )
                    
                    # Test tool retrieval to confirm it was saved
                    get_response = self.make_request('GET', 'tools')
                    if get_response and get_response.status_code == 200:
                        tools = get_response.json()
                        tool_found = any(tool['id'] == tool_id for tool in tools)
                        self.log_test(
                            "Tool persistence verification", 
                            tool_found, 
                            "Tool found in database" if tool_found else "Tool not found in database"
                        )
                    
                    # Clean up - delete the test tool
                    delete_response = self.make_request('DELETE', f'tools/{tool_id}')
                    if delete_response and delete_response.status_code == 200:
                        self.log_test("Test tool cleanup", True, "Test tool deleted successfully")
                    else:
                        self.log_test("Test tool cleanup", False, "Failed to delete test tool")
                    
                    return True
                else:
                    self.log_test("POST /api/tools (Create Tool)", False, "No ID in response")
            except Exception as e:
                self.log_test("POST /api/tools (Create Tool)", False, f"JSON parsing error: {str(e)}")
        else:
            status = response.status_code if response else "No response"
            error_msg = ""
            if response:
                try:
                    error_data = response.json()
                    error_msg = error_data.get('detail', response.text[:100])
                except:
                    error_msg = response.text[:100]
            self.log_test("POST /api/tools (Create Tool)", False, f"HTTP {status}: {error_msg}")
        
        return False

    def test_4_loan_data_fetching(self):
        """Test 4: Loan Data Fetching - Verify Loans page displays loan records correctly"""
        print("\n📋 TEST 4: LOAN DATA FETCHING")
        print("=" * 50)
        
        if not self.token:
            self.log_test("Loan data fetching", False, "No authentication token available")
            return False
        
        response = self.make_request('GET', 'loans')
        
        if response and response.status_code == 200:
            try:
                loans = response.json()
                if isinstance(loans, list):
                    loan_count = len(loans)
                    self.log_test(
                        "GET /api/loans", 
                        True, 
                        f"Retrieved {loan_count} loan records"
                    )
                    
                    # Verify loan structure
                    if loan_count > 0:
                        sample_loan = loans[0]
                        required_fields = ['id', 'borrower_name', 'loan_date', 'return_date', 'project_name', 'equipments']
                        missing_fields = [field for field in required_fields if field not in sample_loan]
                        
                        if not missing_fields:
                            equipment_count = len(sample_loan.get('equipments', []))
                            self.log_test(
                                "Loan data structure validation", 
                                True, 
                                f"All required fields present, {equipment_count} equipments in sample loan"
                            )
                        else:
                            self.log_test(
                                "Loan data structure validation", 
                                False, 
                                f"Missing fields: {missing_fields}"
                            )
                    else:
                        self.log_test("Loan data structure validation", True, "No loans to validate (empty database)")
                    
                    return True
                else:
                    self.log_test("GET /api/loans", False, "Response is not a list")
            except Exception as e:
                self.log_test("GET /api/loans", False, f"JSON parsing error: {str(e)}")
        else:
            status = response.status_code if response else "No response"
            self.log_test("GET /api/loans", False, f"HTTP {status}")
        
        return False

    def test_5_add_loan_functionality(self):
        """Test 5: Add Loan Functionality - Test creating a new loan"""
        print("\n📝 TEST 5: ADD LOAN FUNCTIONALITY")
        print("=" * 50)
        
        if not self.token:
            self.log_test("Add loan functionality", False, "No authentication token available")
            return False
        
        # Create realistic test loan data
        today = datetime.now()
        return_date = today + timedelta(days=14)
        
        test_loan = {
            "borrower_name": "Engineering Team Lead",
            "loan_date": today.strftime("%Y-%m-%d"),
            "return_date": return_date.strftime("%Y-%m-%d"),
            "project_name": "Electrical System Inspection Project",
            "wbs_project_no": f"WBS-{today.strftime('%Y%m%d')}-001",
            "project_location": "Industrial Complex Building A",
            "equipments": [
                {
                    "equipment_name": "Digital Multimeter",
                    "serial_no": "DMM-TEST-001",
                    "condition": "Good"
                },
                {
                    "equipment_name": "Oscilloscope",
                    "serial_no": "OSC-TEST-002", 
                    "condition": "Good"
                }
            ]
        }
        
        response = self.make_request('POST', 'loans', test_loan)
        
        if response and response.status_code == 200:
            try:
                created_loan = response.json()
                if 'id' in created_loan:
                    loan_id = created_loan['id']
                    self.log_test(
                        "POST /api/loans (Create Loan)", 
                        True, 
                        f"Loan created with ID: {loan_id}"
                    )
                    
                    # Verify the created loan has all expected fields
                    expected_fields = ['id', 'borrower_name', 'loan_date', 'return_date', 'project_name', 'equipments', 'created_by']
                    missing_fields = [field for field in expected_fields if field not in created_loan]
                    
                    if not missing_fields:
                        equipment_count = len(created_loan.get('equipments', []))
                        created_by = created_loan.get('created_by', 'Unknown')
                        self.log_test(
                            "Created loan data validation", 
                            True, 
                            f"Equipment count: {equipment_count}, Created by: {created_by}"
                        )
                    else:
                        self.log_test(
                            "Created loan data validation", 
                            False, 
                            f"Missing fields in response: {missing_fields}"
                        )
                    
                    # Test loan retrieval to confirm it was saved
                    get_response = self.make_request('GET', 'loans')
                    if get_response and get_response.status_code == 200:
                        loans = get_response.json()
                        loan_found = any(loan['id'] == loan_id for loan in loans)
                        self.log_test(
                            "Loan persistence verification", 
                            loan_found, 
                            "Loan found in database" if loan_found else "Loan not found in database"
                        )
                    
                    # Test loan export functionality
                    export_response = self.make_request('GET', f'loans/{loan_id}/export')
                    if export_response and export_response.status_code == 200:
                        self.log_test("Loan export functionality", True, "Loan document export successful")
                    else:
                        export_status = export_response.status_code if export_response else "No response"
                        self.log_test("Loan export functionality", False, f"Export failed with HTTP {export_status}")
                    
                    # Clean up - delete the test loan
                    delete_response = self.make_request('DELETE', f'loans/{loan_id}')
                    if delete_response and delete_response.status_code == 200:
                        self.log_test("Test loan cleanup", True, "Test loan deleted successfully")
                    else:
                        self.log_test("Test loan cleanup", False, "Failed to delete test loan")
                    
                    return True
                else:
                    self.log_test("POST /api/loans (Create Loan)", False, "No ID in response")
            except Exception as e:
                self.log_test("POST /api/loans (Create Loan)", False, f"JSON parsing error: {str(e)}")
        else:
            status = response.status_code if response else "No response"
            error_msg = ""
            if response:
                try:
                    error_data = response.json()
                    error_msg = error_data.get('detail', response.text[:100])
                except:
                    error_msg = response.text[:100]
            self.log_test("POST /api/loans (Create Loan)", False, f"HTTP {status}: {error_msg}")
        
        return False

    def run_all_tests(self):
        """Run all focused tests"""
        print("🚀 FOCUSED BACKEND API TESTING")
        print("Testing Tool Management Application after authentication fix")
        print("=" * 70)
        
        # Run tests in sequence
        test_results = []
        
        test_results.append(self.test_1_login_flow())
        test_results.append(self.test_2_tool_data_fetching())
        test_results.append(self.test_3_add_tool_functionality())
        test_results.append(self.test_4_loan_data_fetching())
        test_results.append(self.test_5_add_loan_functionality())
        
        # Print summary
        print("\n" + "=" * 70)
        print("📊 FOCUSED TEST RESULTS SUMMARY")
        print("=" * 70)
        
        print(f"Total Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS ({len(self.failed_tests)}):")
            for failure in self.failed_tests:
                print(f"   • {failure['test']}: {failure['details']}")
        
        if self.passed_tests:
            print(f"\n✅ PASSED TESTS ({len(self.passed_tests)}):")
            for test in self.passed_tests:
                print(f"   • {test}")
        
        # Overall assessment
        critical_tests_passed = all(test_results)
        if critical_tests_passed:
            print(f"\n🎉 ALL CRITICAL FUNCTIONALITY TESTS PASSED!")
            print("✅ Login Flow: Working")
            print("✅ Tool Data Fetching: Working") 
            print("✅ Add Tool Functionality: Working")
            print("✅ Loan Data Fetching: Working")
            print("✅ Add Loan Functionality: Working")
        else:
            print(f"\n⚠️  SOME CRITICAL TESTS FAILED")
            print(f"❌ Login Flow: {'Working' if test_results[0] else 'Failed'}")
            print(f"❌ Tool Data Fetching: {'Working' if test_results[1] else 'Failed'}")
            print(f"❌ Add Tool Functionality: {'Working' if test_results[2] else 'Failed'}")
            print(f"❌ Loan Data Fetching: {'Working' if test_results[3] else 'Failed'}")
            print(f"❌ Add Loan Functionality: {'Working' if test_results[4] else 'Failed'}")
        
        return critical_tests_passed

def main():
    tester = FocusedAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())