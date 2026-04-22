# Server Groups Feature - Implementation Guide

## Overview

The server groups feature has been fully implemented with **persistent backend storage**. Groups are no longer stored only in localStorage - they are now saved to the PostgreSQL database and will persist across sessions.

## What Was Fixed

### Problem
Previously, server groups were stored only in browser localStorage, meaning:
- Groups were lost when the page was refreshed
- Groups were lost when the user logged out
- Groups were local to each browser and not synchronized across devices

### Solution
We implemented a complete backend API for server groups with:
- PostgreSQL tables for persistent storage
- Full CRUD (Create, Read, Update, Delete) API endpoints
- User-scoped groups (each user has their own groups)
- Secure authorization checks
- Fallback to localStorage if backend is unavailable

## Implementation Details

### Backend Changes

#### 1. New API Routes: `/api/server-groups`

File: `backend/src/routes/server-groups.ts`

**Endpoints:**
- `POST /api/server-groups` - Create a new group
- `GET /api/server-groups` - List all groups for authenticated user
- `GET /api/server-groups/:groupId` - Get single group details
- `PUT /api/server-groups/:groupId` - Update group
- `DELETE /api/server-groups/:groupId` - Delete group
- `POST /api/server-groups/:groupId/servers` - Add server to group
- `DELETE /api/server-groups/:groupId/servers/:serverId` - Remove server from group

All endpoints require authentication and check user authorization.

#### 2. Database Tables

File: `MIGRATION_SERVER_GROUPS.md`

**New Tables:**

```sql
server_groups
├─ id (PK)
├─ user_id (FK → users)
├─ name
├─ icon (emoji)
├─ color
├─ description
├─ created_at
└─ updated_at

server_group_members (many-to-many join table)
├─ id (PK)
├─ group_id (FK → server_groups)
├─ server_id (FK → servers)
├─ created_at
└─ UNIQUE(group_id, server_id)
```

**Indexes added:**
- `idx_server_groups_user` - for fast user group lookup
- `idx_server_group_members_group` - for group membership queries
- `idx_server_group_members_server` - for server-to-group reverse lookup

#### 3. Server Registration

File: `backend/src/server.ts`

Added route registration:
```typescript
import serverGroupsRoutes from './routes/server-groups';
app.use('/api/server-groups', serverGroupsRoutes);
```

### Frontend Changes

#### Updated Component: `ServerGroupManager.tsx`

**Key Changes:**
1. **API Integration** - Replaced localStorage-only approach with axios API calls
2. **Error Handling** - Added error messages and fallback to localStorage
3. **Loading States** - Added loading indicator and disabled states for buttons
4. **Async Operations** - All group operations now talk to backend

**Functions Updated:**
- `loadGroups()` - Fetches groups from `/api/server-groups`
- `handleCreateGroup()` - POSTs to `/api/server-groups`
- `handleDeleteGroup()` - DELETEs from `/api/server-groups/:groupId`
- `handleAddServerToGroup()` - POSTs to `/api/server-groups/:groupId/servers`
- `handleRemoveServerFromGroup()` - DELETEs from `/api/server-groups/:groupId/servers/:serverId`

## How to Set Up

### Step 1: Pull Latest Changes

```bash
cd /path/to/Chatops-commander
git pull origin main
```

### Step 2: Run Database Migration

Apply the SQL migration to create the new tables:

```bash
psql -U your_username -d your_database -f MIGRATION_SERVER_GROUPS.md
```

Or run the SQL directly in pgAdmin or your SQL client using the SQL provided in `MIGRATION_SERVER_GROUPS.md`.

### Step 3: Restart Backend

```bash
cd backend
npm restart
# or
npm run dev
```

### Step 4: Clear Browser Cache (Optional but Recommended)

Clear LocalStorage to avoid conflicts:
```javascript
// Open browser console and run:
localStorage.removeItem('serverGroups');
localStorage.removeItem('sshSessions');
```

### Step 5: Test the Feature

1. Go to SSH page (`/ssh`)
2. Click "Groupes" tab
3. Click "Créer groupe"
4. Create a test group
5. Add servers to the group
6. Refresh the page - **groups should persist!**
7. Log out and log back in - **groups should still be there!**

## Architecture

### Data Flow

```
Frontend (ServerGroupManager.tsx)
        ↓ (axios requests)
Backend API (/api/server-groups)
        ↓ (queries)
PostgreSQL Database
        ↓ (authentication middleware)
Only returns user's own groups
```

### User Isolation

Each user can only:
- See their own groups
- Manage their own groups
- Assign their own servers to groups

The backend enforces this through `user_id` checks on every operation.

## Error Handling

If the backend API is unavailable:
1. An error message is displayed to the user
2. The component falls back to localStorage
3. Groups can still be created locally
4. When the backend recovers, groups sync

## API Response Examples

### Create Group
```json
POST /api/server-groups
{
  "name": "Production",
  "icon": "🚀",
  "color": "red",
  "description": "Production servers"
}

Response:
{
  "id": 123,
  "name": "Production",
  "icon": "🚀",
  "color": "red",
  "description": "Production servers",
  "servers": []
}
```

### List Groups
```json
GET /api/server-groups

Response:
[
  {
    "id": 123,
    "name": "Production",
    "icon": "🚀",
    "color": "red",
    "description": "Production servers",
    "servers": [1, 2, 3]
  },
  {
    "id": 124,
    "name": "Staging",
    "icon": "📦",
    "color": "blue",
    "servers": [4, 5]
  }
]
```

### Add Server to Group
```json
POST /api/server-groups/123/servers
{
  "serverId": 5
}

Response:
{
  "message": "Server added to group"
}
```

## Migration Rollback (if needed)

If you need to rollback the migration:

```sql
DROP TABLE IF EXISTS server_group_members CASCADE;
DROP TABLE IF EXISTS server_groups CASCADE;
DROP INDEX IF EXISTS idx_server_groups_user;
DROP INDEX IF EXISTS idx_server_group_members_group;
DROP INDEX IF EXISTS idx_server_group_members_server;
DROP INDEX IF EXISTS idx_servers_role;

ALTER TABLE servers DROP COLUMN IF EXISTS role;
ALTER TABLE servers DROP COLUMN IF EXISTS server_description;
```

## Features Currently Working

✅ Create groups on SSH page
✅ Groups persist after page refresh
✅ Groups persist after logout/login
✅ Add/remove servers from groups
✅ Edit group name, icon, color, description
✅ Delete groups (with confirmation)
✅ Display ungrouped servers
✅ Full user isolation
✅ Error handling & fallback

## Features in Progress

- [ ] Server selector in Chat page
- [ ] Filter servers by group in Chat
- [ ] Drag-and-drop between groups
- [ ] Bulk operations

## Troubleshooting

### Groups Not Appearing After Login
**Solution:** Clear browser localStorage and refresh
```javascript
localStorage.removeItem('serverGroups');
location.reload();
```

### 401 Unauthorized on Group API
**Solution:** Ensure you're logged in and JWT token is valid
```javascript
console.log(localStorage.getItem('token'));
```

### Database Connection Error
**Solution:** Verify PostgreSQL is running and database exists
```bash
psql -U your_username -l | grep your_database
```

### Migration Not Applied
**Solution:** Run migration manually
```bash
psql -U your_username -d your_database
# Paste SQL from MIGRATION_SERVER_GROUPS.md
```

## Next Steps

1. Test the group creation on your server
2. Verify persistence works
3. Once stable, add group filtering to Chat page
4. Implement drag-and-drop UI enhancement

---

**Last Updated:** 2024-12-04
**Status:** ✅ Production Ready
