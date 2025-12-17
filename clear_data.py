import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

async def clear_data():
    # Load from .env file
    env_vars = {}
    with open('/app/backend/.env', 'r') as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                # Remove quotes if present
                value = value.strip('"\'')
                env_vars[key] = value
    
    mongo_url = env_vars.get('MONGO_URL')
    db_name = env_vars.get('DB_NAME', 'invtools-1-test_database')
    
    if not mongo_url:
        print("ERROR: MONGO_URL not found")
        return
    
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
