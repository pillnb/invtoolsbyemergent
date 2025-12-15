#!/usr/bin/env python3
"""
Incremental Data Migration Script
Migrates data from old system to new system without duplicating existing records
"""

import requests
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment
ROOT_DIR = Path(__file__).parent / "backend"
load_dotenv(ROOT_DIR / '.env')

OLD_SYSTEM_URL = "https://invtools.emergent.host"
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']

# Login credentials
USERNAME = "admin"
PASSWORD = "admin123"

async def migrate_data():
    """Perform incremental data migration"""
    
    print("=" * 60)
    print("INCREMENTAL DATA MIGRATION")
    print("=" * 60)
    
    # Step 1: Login to old system
    print("\n[1/6] Logging into old system...")
    try:
        response = requests.post(
            f"{OLD_SYSTEM_URL}/api/auth/login",
            json={"username": USERNAME, "password": PASSWORD},
            timeout=10
        )
        
        if response.status_code != 200:
            print(f"❌ Login failed: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
        token = response.json().get('access_token')
        print(f"✅ Login successful! Token: {token[:20]}...")
        
    except Exception as e:
        print(f"❌ Error connecting to old system: {e}")
        return False
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Step 2: Fetch data from old system
    print("\n[2/6] Fetching data from old system...")
    
    try:
        tools_response = requests.get(f"{OLD_SYSTEM_URL}/api/tools", headers=headers, timeout=10)
        old_tools = tools_response.json() if tools_response.status_code == 200 else []
        print(f"✅ Fetched {len(old_tools)} tools")
        
        stock_response = requests.get(f"{OLD_SYSTEM_URL}/api/stock", headers=headers, timeout=10)
        old_stock = stock_response.json() if stock_response.status_code == 200 else []
        print(f"✅ Fetched {len(old_stock)} stock items")
        
        loans_response = requests.get(f"{OLD_SYSTEM_URL}/api/loans", headers=headers, timeout=10)
        old_loans = loans_response.json() if loans_response.status_code == 200 else []
        print(f"✅ Fetched {len(old_loans)} loans")
        
    except Exception as e:
        print(f"❌ Error fetching data: {e}")
        return False
    
    # Step 3: Connect to new system database
    print("\n[3/6] Connecting to new database...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    print("✅ Connected to MongoDB")
    
    # Step 4: Get existing data
    print("\n[4/6] Checking existing data in new system...")
    existing_tools = await db.tools.find({}, {"_id": 0}).to_list(10000)
    existing_stock = await db.stock_items.find({}, {"_id": 0}).to_list(10000)
    existing_loans = await db.loans.find({}, {"_id": 0}).to_list(10000)
    
    print(f"   Current tools: {len(existing_tools)}")
    print(f"   Current stock: {len(existing_stock)}")
    print(f"   Current loans: {len(existing_loans)}")
    
    # Create lookup sets for quick duplicate checking
    existing_tool_serials = {tool.get('serial_no') for tool in existing_tools if tool.get('serial_no')}
    existing_tool_inventory = {tool.get('inventory_code') for tool in existing_tools if tool.get('inventory_code')}
    existing_stock_names = {stock.get('item_name') for stock in existing_stock if stock.get('item_name')}
    existing_loan_ids = {loan.get('id') for loan in existing_loans if loan.get('id')}
    
    # Step 5: Filter out duplicates
    print("\n[5/6] Filtering out duplicates...")
    
    new_tools = []
    for tool in old_tools:
        serial_no = tool.get('serial_no')
        inventory_code = tool.get('inventory_code')
        
        # Skip if serial number or inventory code already exists
        if serial_no in existing_tool_serials or inventory_code in existing_tool_inventory:
            continue
        
        new_tools.append(tool)
    
    new_stock = []
    for stock in old_stock:
        item_name = stock.get('item_name')
        
        # Skip if item name already exists
        if item_name in existing_stock_names:
            continue
        
        new_stock.append(stock)
    
    new_loans = []
    for loan in old_loans:
        loan_id = loan.get('id')
        
        # Skip if loan ID already exists
        if loan_id in existing_loan_ids:
            continue
        
        new_loans.append(loan)
    
    print(f"   New tools to add: {len(new_tools)}")
    print(f"   New stock to add: {len(new_stock)}")
    print(f"   New loans to add: {len(new_loans)}")
    
    # Step 6: Insert new records
    print("\n[6/6] Inserting new records...")
    
    inserted_counts = {
        'tools': 0,
        'stock': 0,
        'loans': 0
    }
    
    if new_tools:
        result = await db.tools.insert_many(new_tools)
        inserted_counts['tools'] = len(result.inserted_ids)
        print(f"✅ Inserted {inserted_counts['tools']} new tools")
    else:
        print("ℹ️  No new tools to insert")
    
    if new_stock:
        result = await db.stock_items.insert_many(new_stock)
        inserted_counts['stock'] = len(result.inserted_ids)
        print(f"✅ Inserted {inserted_counts['stock']} new stock items")
    else:
        print("ℹ️  No new stock items to insert")
    
    if new_loans:
        result = await db.loans.insert_many(new_loans)
        inserted_counts['loans'] = len(result.inserted_ids)
        print(f"✅ Inserted {inserted_counts['loans']} new loans")
    else:
        print("ℹ️  No new loans to insert")
    
    # Verify final counts
    print("\n" + "=" * 60)
    print("MIGRATION COMPLETE!")
    print("=" * 60)
    
    final_tools = await db.tools.count_documents({})
    final_stock = await db.stock_items.count_documents({})
    final_loans = await db.loans.count_documents({})
    
    print(f"\nFinal record counts:")
    print(f"   Tools: {len(existing_tools)} → {final_tools} (+{inserted_counts['tools']})")
    print(f"   Stock: {len(existing_stock)} → {final_stock} (+{inserted_counts['stock']})")
    print(f"   Loans: {len(existing_loans)} → {final_loans} (+{inserted_counts['loans']})")
    
    client.close()
    return True

if __name__ == "__main__":
    success = asyncio.run(migrate_data())
    if success:
        print("\n✅ Migration completed successfully!")
    else:
        print("\n❌ Migration failed!")
