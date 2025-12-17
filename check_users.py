import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_users():
    # Load from .env file
    env_vars = {}
    with open('/app/backend/.env', 'r') as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                value = value.strip('"\'')
                env_vars[key] = value
    
    mongo_url = env_vars.get('MONGO_URL')
    db_name = env_vars.get('DB_NAME', 'invtools-1-test_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Check users
    users = await db.users.find({}, {"_id": 0}).to_list(100)
    print(f"Found {len(users)} users:")
    for user in users:
        print(f"  - username: {user.get('username')}, role: {user.get('role')}, id: {user.get('id')}")
    
    client.close()

asyncio.run(check_users())
