# Database Migration for Server Groups

Run the following SQL commands on your PostgreSQL database to create the necessary tables for server groups functionality.

```sql
-- ==========================================
-- SERVER GROUPS TABLES & COLUMNS
-- ==========================================

-- Create server_groups table
CREATE TABLE IF NOT EXISTS server_groups (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(10),
  color VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create server_group_members table (many-to-many)
CREATE TABLE IF NOT EXISTS server_group_members (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES server_groups(id) ON DELETE CASCADE,
  server_id INTEGER NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id, server_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_server_groups_user ON server_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_server_group_members_group ON server_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_server_group_members_server ON server_group_members(server_id);

-- Add role and description columns to servers if they don't exist
ALTER TABLE servers ADD COLUMN IF NOT EXISTS role VARCHAR(100);
ALTER TABLE servers ADD COLUMN IF NOT EXISTS server_description TEXT;

CREATE INDEX IF NOT EXISTS idx_servers_role ON servers(role);
```

## How to apply this migration:

### Option 1: Using psql (recommended)
```bash
psql -U your_user -d your_database -f backend/migrations/2024_add_server_groups.sql
```

### Option 2: Direct SQL execution
```bash
psql -U your_user -d your_database -c "$(cat backend/migrations/2024_add_server_groups.sql)"
```

### Option 3: Using pgAdmin
1. Open pgAdmin
2. Select your database
3. Open Query Tool
4. Copy and paste the SQL above
5. Click "Execute"

## Verification

To verify the migration was applied correctly:

```sql
-- Check if tables exist
SELECT tablename FROM pg_tables WHERE tablename IN ('server_groups', 'server_group_members');

-- Check server_groups table structure
\d server_groups

-- Check server_group_members table structure
\d server_group_members
```

Both should return the table definitions if successful.
