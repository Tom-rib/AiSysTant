# Quick Start: Running Server Groups on Linux

## On Your Linux Server

### 1. Pull the Latest Changes

```bash
cd /home/serveur1/projet/Chatops-commander
git pull origin main
```

You should see:
```
...
 create mode 100644 MIGRATION_SERVER_GROUPS.md
 create mode 100644 backend/src/routes/server-groups.ts
...
```

### 2. Apply Database Migration

Run the migration to create the server groups tables:

```bash
# Option 1: Using psql (if available)
psql -U chatops_user -d chatops_db << 'EOF'
-- Copy the SQL from MIGRATION_SERVER_GROUPS.md
EOF

# Option 2: Using pgAdmin Web Interface
# 1. Open pgAdmin
# 2. Select your database
# 3. Open Query Tool
# 4. Copy SQL from MIGRATION_SERVER_GROUPS.md
# 5. Click Execute
```

### 3. Restart Backend (if running)

```bash
cd backend
npm run dev
# or if using PM2:
pm2 restart aisystant-backend
```

### 4. Clear Frontend Cache (Recommended)

If the frontend is already running, clear cache:

```bash
# Option 1: In browser DevTools console:
localStorage.removeItem('serverGroups');
location.reload();

# Option 2: Hard refresh
Ctrl+Shift+R (on most browsers)
```

### 5. Test the Feature

1. Open `/ssh` page
2. Click "Groupes" tab
3. Create a test group
4. Add servers
5. Refresh page - groups should persist
6. Logout and login - groups should still be there

## Verify Migration Worked

```bash
# Connect to your database
psql -U chatops_user -d chatops_db

# Run these commands:
\dt server_groups  -- Should show the table
\dt server_group_members  -- Should show the table
SELECT COUNT(*) FROM server_groups;  -- Should return 0 or number of groups
```

## If Migration Fails

### Error: "table already exists"
This is fine - it means the migration ran before. Continue to step 3.

### Error: "permission denied"
Make sure your database user has CREATE TABLE permissions:
```bash
psql -U postgres -d chatops_db
ALTER USER chatops_user CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE chatops_db TO chatops_user;
```

### Error: "database does not exist"
Create it first:
```bash
createdb -U postgres -O chatops_user chatops_db
```

## Logs to Check

### Backend Logs
```bash
# If using npm dev:
# Check console for: "✅ Routes configured successfully"

# If using PM2:
pm2 logs aisystant-backend
```

### Database Logs (if available)
```bash
# PostgreSQL logs location varies by OS
# Common locations:
/var/log/postgresql/postgresql.log
/usr/local/var/postgres/server.log
```

## API Testing

Test the API manually:

```bash
# Get your JWT token from browser localStorage
TOKEN="your_jwt_token_here"

# List groups
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/server-groups

# Create group
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Group",
    "icon": "🚀",
    "color": "blue",
    "description": "Test"
  }' \
  http://localhost:3001/api/server-groups
```

## Debugging

If something isn't working:

1. **Check Browser Console** (F12)
   - Look for errors in console
   - Check network tab for API calls
   - Verify Authorization header is sent

2. **Check Backend Logs**
   ```bash
   pm2 logs  # If using PM2
   # or check terminal running `npm run dev`
   ```

3. **Check Database Connection**
   ```bash
   psql -U chatops_user -d chatops_db -c "SELECT 1;"
   ```

4. **Verify JWT Token**
   ```bash
   # In browser console:
   console.log(localStorage.getItem('token'));
   ```

## Performance Notes

- First load of groups: ~50-100ms (API call)
- Subsequent loads: Cached in component state
- Group creation: ~200-300ms
- Server assignment: ~150-200ms

This is normal and expected.

## Security

- All endpoints require JWT authentication
- Each user can only access their own groups
- Server assignment is validated (must own both group and server)
- Database queries are parameterized (no SQL injection risk)

---

**Need Help?**
- Check `IMPLEMENTATION_GUIDE_SERVER_GROUPS.md` for detailed architecture
- Check `MIGRATION_SERVER_GROUPS.md` for SQL details
- Check GitHub issues or create a new one
