#!/usr/bin/env python3
"""
Copy data to the database name that production actually uses
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent / "backend"
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ['MONGO_URL']
SOURCE_DB = "invtools-1-test_database"  # Underscore - has data
TARGET_DB = "invtools-1-test-database"  # Hyphen - production uses this

async def copy_data():
    print("=" * 70)
    print("COPYING DATA TO PRODUCTION DATABASE")
    print("=" * 70)
    
    client = AsyncIOMotorClient(MONGO_URL)
    
    source_db = client[SOURCE_DB]
    target_db = client[TARGET_DB]
    
    print(f"\n[1/4] Source: {SOURCE_DB} (with underscores)")
    print(f"       Target: {TARGET_DB} (with hyphens - production)")
    
    # Get counts
    print(f"\n[2/4] Checking data...")
    source_tools = await source_db.tools.count_documents({})
    source_loans = await source_db.loans.count_documents({})
    source_stock = await source_db.stock_items.count_documents({})
    source_users = await source_db.users.count_documents({})
    
    print(f"\n   SOURCE ({SOURCE_DB}):")
    print(f"      Tools: {source_tools}")
    print(f"      Loans: {source_loans}")
    print(f"      Stock: {source_stock}")
    print(f"      Users: {source_users}")
    
    target_tools = await target_db.tools.count_documents({})
    target_loans = await target_db.loans.count_documents({})
    
    print(f"\n   TARGET ({TARGET_DB}) - BEFORE:")
    print(f"      Tools: {target_tools}")
    print(f"      Loans: {target_loans}")
    
    # Fetch data
    print(f"\n[3/4] Fetching data from source...")
    tools = await source_db.tools.find({}, {"_id": 0}).to_list(10000)
    loans = await source_db.loans.find({}, {"_id": 0}).to_list(10000)
    stock = await source_db.stock_items.find({}, {"_id": 0}).to_list(10000)
    calibrations = await source_db.calibrations.find({}, {"_id": 0}).to_list(10000)
    users = await source_db.users.find({}, {"_id": 0}).to_list(10000)
    
    print(f"   ✅ Fetched all data")
    
    # Clear target and copy
    print(f"\n[4/4] Copying to target database...")
    await target_db.tools.delete_many({})
    await target_db.loans.delete_many({})
    await target_db.stock_items.delete_many({})
    await target_db.calibrations.delete_many({})
    await target_db.users.delete_many({})
    
    inserted = {}
    
    if tools:
        result = await target_db.tools.insert_many(tools)
        inserted['tools'] = len(result.inserted_ids)
        print(f"   ✅ Copied {inserted['tools']} tools")
    
    if loans:
        result = await target_db.loans.insert_many(loans)
        inserted['loans'] = len(result.inserted_ids)
        print(f"   ✅ Copied {inserted['loans']} loans")
    
    if stock:
        result = await target_db.stock_items.insert_many(stock)
        inserted['stock'] = len(result.inserted_ids)
        print(f"   ✅ Copied {inserted['stock']} stock items")
    
    if calibrations:
        result = await target_db.calibrations.insert_many(calibrations)
        inserted['calibrations'] = len(result.inserted_ids)
        print(f"   ✅ Copied {inserted['calibrations']} calibrations")
    
    if users:
        result = await target_db.users.insert_many(users)
        inserted['users'] = len(result.inserted_ids)
        print(f"   ✅ Copied {inserted['users']} users")
    
    # Verify
    print("\n" + "=" * 70)
    print("COPY COMPLETE!")
    print("=" * 70)
    
    final_tools = await target_db.tools.count_documents({})
    final_loans = await target_db.loans.count_documents({})
    final_stock = await target_db.stock_items.count_documents({})
    
    print(f"\n   TARGET ({TARGET_DB}) - AFTER:")
    print(f"      Tools: {final_tools} ✅")
    print(f"      Loans: {final_loans} ✅")
    print(f"      Stock: {final_stock} ✅")
    
    print(f"\n✅ Production database '{TARGET_DB}' is now populated!")
    print(f"   Your production deployment should now show all {final_tools} tools!")
    
    client.close()
    return True

if __name__ == "__main__":
    asyncio.run(copy_data())
