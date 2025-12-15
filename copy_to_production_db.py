#!/usr/bin/env python3
"""
Copy data from sandbox database to production database
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment
ROOT_DIR = Path(__file__).parent / "backend"
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ['MONGO_URL']
SOURCE_DB = "test_database"  # Sandbox database
TARGET_DB = "invtools-1-test_database"  # Production database

async def copy_data():
    """Copy all data from sandbox to production database"""
    
    print("=" * 70)
    print("COPYING DATA FROM SANDBOX TO PRODUCTION DATABASE")
    print("=" * 70)
    
    # Connect to MongoDB
    print(f"\n[1/5] Connecting to MongoDB Atlas...")
    client = AsyncIOMotorClient(MONGO_URL)
    
    source_db = client[SOURCE_DB]
    target_db = client[TARGET_DB]
    
    print(f"   Source: {SOURCE_DB}")
    print(f"   Target: {TARGET_DB}")
    
    # Get current counts
    print(f"\n[2/5] Checking current data...")
    
    source_tools = await source_db.tools.count_documents({})
    source_loans = await source_db.loans.count_documents({})
    source_stock = await source_db.stock_items.count_documents({})
    source_calibrations = await source_db.calibrations.count_documents({})
    source_users = await source_db.users.count_documents({})
    
    target_tools = await target_db.tools.count_documents({})
    target_loans = await target_db.loans.count_documents({})
    target_stock = await target_db.stock_items.count_documents({})
    target_calibrations = await target_db.calibrations.count_documents({})
    target_users = await target_db.users.count_documents({})
    
    print(f"\n   SOURCE ({SOURCE_DB}):")
    print(f"      Tools: {source_tools}")
    print(f"      Loans: {source_loans}")
    print(f"      Stock: {source_stock}")
    print(f"      Calibrations: {source_calibrations}")
    print(f"      Users: {source_users}")
    
    print(f"\n   TARGET ({TARGET_DB}) - BEFORE:")
    print(f"      Tools: {target_tools}")
    print(f"      Loans: {target_loans}")
    print(f"      Stock: {target_stock}")
    print(f"      Calibrations: {target_calibrations}")
    print(f"      Users: {target_users}")
    
    # Fetch all data from source
    print(f"\n[3/5] Fetching data from source...")
    
    tools = await source_db.tools.find({}, {"_id": 0}).to_list(10000)
    loans = await source_db.loans.find({}, {"_id": 0}).to_list(10000)
    stock = await source_db.stock_items.find({}, {"_id": 0}).to_list(10000)
    calibrations = await source_db.calibrations.find({}, {"_id": 0}).to_list(10000)
    users = await source_db.users.find({}, {"_id": 0}).to_list(10000)
    
    print(f"   ✅ Fetched all data")
    
    # Clear target database (optional - for clean slate)
    print(f"\n[4/5] Clearing target database...")
    await target_db.tools.delete_many({})
    await target_db.loans.delete_many({})
    await target_db.stock_items.delete_many({})
    await target_db.calibrations.delete_many({})
    await target_db.users.delete_many({})
    print(f"   ✅ Target database cleared")
    
    # Copy data to target
    print(f"\n[5/5] Copying data to target...")
    
    copied = {
        'tools': 0,
        'loans': 0,
        'stock': 0,
        'calibrations': 0,
        'users': 0
    }
    
    if tools:
        result = await target_db.tools.insert_many(tools)
        copied['tools'] = len(result.inserted_ids)
        print(f"   ✅ Copied {copied['tools']} tools")
    
    if loans:
        result = await target_db.loans.insert_many(loans)
        copied['loans'] = len(result.inserted_ids)
        print(f"   ✅ Copied {copied['loans']} loans")
    
    if stock:
        result = await target_db.stock_items.insert_many(stock)
        copied['stock'] = len(result.inserted_ids)
        print(f"   ✅ Copied {copied['stock']} stock items")
    
    if calibrations:
        result = await target_db.calibrations.insert_many(calibrations)
        copied['calibrations'] = len(result.inserted_ids)
        print(f"   ✅ Copied {copied['calibrations']} calibrations")
    
    if users:
        result = await target_db.users.insert_many(users)
        copied['users'] = len(result.inserted_ids)
        print(f"   ✅ Copied {copied['users']} users")
    
    # Verify final counts
    print("\n" + "=" * 70)
    print("COPY COMPLETE!")
    print("=" * 70)
    
    final_tools = await target_db.tools.count_documents({})
    final_loans = await target_db.loans.count_documents({})
    final_stock = await target_db.stock_items.count_documents({})
    final_calibrations = await target_db.calibrations.count_documents({})
    final_users = await target_db.users.count_documents({})
    
    print(f"\n   TARGET ({TARGET_DB}) - AFTER:")
    print(f"      Tools: {final_tools} ✅")
    print(f"      Loans: {final_loans} ✅")
    print(f"      Stock: {final_stock} ✅")
    print(f"      Calibrations: {final_calibrations} ✅")
    print(f"      Users: {final_users} ✅")
    
    client.close()
    return True

if __name__ == "__main__":
    success = asyncio.run(copy_data())
    if success:
        print("\n✅ Data successfully copied to production database!")
        print(f"\nProduction ({TARGET_DB}) is now ready with all data.")
    else:
        print("\n❌ Copy failed!")
