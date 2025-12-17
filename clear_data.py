import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

async def clear_data():
    mongo_url = os.environ.get('MONGO_URL')
    if not mongo_url:
        # Try to load from .env
        with open('/app/backend/.env', 'r') as f:
            for line in f:
                if line.startswith('MONGO_URL='):
                    mongo_url = line.strip().split('=', 1)[1]
                    break
    
    if not mongo_url:
        print("ERROR: MONGO_URL not found")
        return
    
    # Get DB name from env or use default
    db_name = os.environ.get('DB_NAME')
    if not db_name:
        with open('/app/backend/.env', 'r') as f:
            for line in f:
                if line.startswith('DB_NAME='):
                    db_name = line.strip().split('=', 1)[1]
                    break
    
    if not db_name:
        db_name = 'invtools-1-test_database'
    
    print(f"Connecting to database: {db_name}")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Clear tools
    result = await db.tools.delete_many({})
    print(f"Deleted {result.deleted_count} tools")
    
    # Clear stock_items
    result = await db.stock_items.delete_many({})
    print(f"Deleted {result.deleted_count} stock items")
    
    # Clear loans
    result = await db.loans.delete_many({})
    print(f"Deleted {result.deleted_count} loans")
    
    # Clear calibrations
    result = await db.calibrations.delete_many({})
    print(f"Deleted {result.deleted_count} calibrations")
    
    # Keep users - don't delete
    users_count = await db.users.count_documents({})
    print(f"Kept {users_count} user(s) (not deleted)")
    
    print("\n✅ All data cleared successfully! Admin user preserved.")
    client.close()

asyncio.run(clear_data())
