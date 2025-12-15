# Production Password Setup Guide

## Overview

For security reasons, the default password (`admin123`) is **blocked in production**. You must set a secure password before deploying to production.

---

## How It Works

### Preview/Sandbox Environment
- **ENVIRONMENT**: `preview`
- **Username**: `admin`
- **Password**: `admin123` ✅ **Works**
- Use this for testing and development

### Production Environment
- **ENVIRONMENT**: `production` (automatically set during deployment)
- **Username**: `admin`
- **Password**: `admin123` ❌ **Blocked**
- **Error Message**: "Default password not allowed in production. Please contact administrator to set a secure password."

---

## Setting a Production Password

### Option 1: Before Deployment (Recommended)

Run this script in your sandbox/preview environment to set a production password:

```bash
cd /app && python3 << 'EOF'
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path("/app/backend")
load_dotenv(ROOT_DIR / '.env')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def set_production_password():
    mongo_url = os.environ['MONGO_URL']
    prod_db = "invtools-1-test_database"  # Production database
    
    # CHANGE THIS TO YOUR SECURE PASSWORD
    new_password = "YourSecurePassword123!"
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[prod_db]
    
    # Hash the new password
    new_hash = pwd_context.hash(new_password)
    
    # Update admin password
    result = await db.users.update_one(
        {"username": "admin"},
        {"$set": {"password_hash": new_hash}}
    )
    
    if result.modified_count > 0:
        print(f"✅ Production password updated successfully!")
        print(f"   New password: {new_password}")
    else:
        print("⚠️  No changes made")
    
    client.close()

asyncio.run(set_production_password())
EOF
```

### Option 2: After Deployment

If you've already deployed, you can update the password through MongoDB Atlas:

1. Go to MongoDB Atlas console
2. Connect to your cluster: `tool-management.xvuesaf.mongodb.net`
3. Select database: `invtools-1-test_database`
4. Find the `users` collection
5. Update the admin user's `password_hash` field

Or run the script from Option 1 in your production environment console.

---

## Testing Your Production Password

After setting a new password, test it:

```bash
# Set ENVIRONMENT to production temporarily
export ENVIRONMENT="production"

# Test login with new password
curl -X POST "http://localhost:8001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YourSecurePassword123!"}'
```

You should receive a valid JWT token.

---

## Password Requirements

For production, use a password that:
- ✅ Is at least 12 characters long
- ✅ Contains uppercase and lowercase letters
- ✅ Contains numbers
- ✅ Contains special characters
- ❌ Is NOT "admin123" or any common password

---

## Environment Variables

The application checks the `ENVIRONMENT` variable:

| Environment | Value | Default Password |
|-------------|-------|-----------------|
| Preview/Sandbox | `preview` | ✅ Allowed |
| Production | `production` | ❌ Blocked |

During deployment, Emergent automatically sets `ENVIRONMENT=production`.

---

## Security Notes

1. **Never commit production passwords to Git**
2. **Store production passwords securely** (use a password manager)
3. **Change passwords regularly**
4. **Use different passwords for different environments**
5. **The default password is intentionally blocked in production**

---

## Troubleshooting

### "Default password not allowed in production"
- **Cause**: Trying to use `admin123` in production
- **Solution**: Follow Option 1 or 2 above to set a secure password

### "Invalid username or password"
- **Cause**: Wrong password or username
- **Solution**: Verify your credentials, check the database

### Password reset needed
- Use Option 1 script with your new password
- Or contact your database administrator

---

## Support

For assistance with password setup or deployment issues, refer to the Emergent documentation or contact support.
