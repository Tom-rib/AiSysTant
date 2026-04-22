# AiSystant Architecture

## System Design Overview

AiSystant is a modern distributed architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE LAYER                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Frontend   │  │ Admin Panel  │  │  Terminal    │      │
│  │ (React/Vite)│  │ (Dashboard)  │  │  Emulator    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP + WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Express.js API Server (Port 3001)          │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │          Route Handlers & Middleware         │  │    │
│  │  │  ├─ Authentication (JWT)                     │  │    │
│  │  │  ├─ Authorization (RBAC)                     │  │    │
│  │  │  ├─ Request Validation                       │  │    │
│  │  │  └─ Error Handling                           │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
└──────┬──────────────────┬──────────────────────┬────────────┘
       │                  │                      │
       ▼                  ▼                      ▼
┌────────────────┐ ┌──────────────┐ ┌──────────────────────┐
│  AI ENGINE     │ │ SSH SERVICE  │ │  DATABASE SERVICE    │
│  (Claude API)  │ │              │ │  (PostgreSQL)        │
├────────────────┤ ├──────────────┤ ├──────────────────────┤
│ • Prompting    │ │ • Terminal   │ │ • User Accounts      │
│ • Intent Parse │ │ • Commands   │ │ • Chat History       │
│ • Risk Assess  │ │ • Sessions   │ │ • Server Config      │
│ • Formatting   │ │ • Execution  │ │ • Audit Logs         │
└────────────────┘ └──────────────┘ └──────────────────────┘
       │                  │                      │
       ▼                  ▼                      ▼
┌────────────────┐ ┌──────────────┐ ┌──────────────────────┐
│ ANTHROPIC      │ │ SSH SERVERS  │ │ DATABASE             │
│ Claude API     │ │ (Remote Infra)  │ (PostgreSQL 14+)    │
└────────────────┘ └──────────────┘ └──────────────────────┘
```

## Core Components

### 1. Frontend Layer (React + Vite)

**Key Files:**
- `src/pages/Chat.tsx` - Main chat interface
- `src/pages/SSH.tsx` - Terminal view
- `src/components/TerminalEmulator.tsx` - Terminal rendering
- `src/context/ChatContext.tsx` - Chat state management
- `src/context/SSHContext.tsx` - SSH connection state

**Responsibilities:**
- User interface rendering
- State management (React Context)
- Real-time WebSocket communication
- Command history management
- Terminal emulation (xterm.js)

**Key Libraries:**
- React 18 with Hooks
- TailwindCSS for styling
- Socket.io for WebSocket
- xterm.js for terminal
- TypeScript for type safety

### 2. API Gateway (Express.js)

**Key Files:**
- `src/server.ts` - Express initialization
- `src/routes/chat.ts` - Chat endpoints
- `src/routes/ssh-shell.ts` - SSH execution
- `src/routes/admin.ts` - Admin endpoints
- `src/middleware/adminAuth.ts` - Authentication

**Routes:**
```
POST   /api/chat              # Send message to Claude
GET    /api/chat/history      # Get chat history
POST   /api/ssh/command       # Execute SSH command
WS     /socket.io             # WebSocket for real-time updates
GET    /api/stats             # Server statistics
POST   /api/admin/users       # User management (admin only)
GET    /api/admin/logs        # Audit logs (admin only)
```

**Middleware Stack:**
1. CORS handling
2. Request logging
3. JWT authentication
4. Authorization checks
5. Request validation
6. Error handling

### 3. AI Engine Service

**File:** `src/services/AIEngine.ts`

**Workflow:**
```
User Message
    ↓
Parse Intent (Claude)
    ├─ Extract command type
    ├─ Extract parameters
    ├─ Extract target servers
    └─ Assess risk level
    ↓
Generate Response
    ├─ Format for display
    ├─ Suggest confirmations
    └─ Add safety warnings
    ↓
Return to Frontend
```

**Prompt Engineering:**
- System prompt defines AI behavior
- Context includes server list, user permissions
- Few-shot examples for command parsing
- Chain-of-thought for complex operations

**Key Methods:**
```typescript
async processUserMessage(msg: string): Promise<AIResponse>
async parseCommand(input: string): Promise<CommandParsed>
async generateSSHCommand(intent: Intent): Promise<string>
async assessRiskLevel(cmd: string): Promise<RiskLevel>
```

### 4. SSH Terminal Service

**File:** `src/services/SSHTerminalService.ts`

**Features:**
- SSH connection pooling
- Command execution with timeout
- Real-time output streaming
- Error handling & recovery
- Connection lifecycle management

**Key Methods:**
```typescript
async connectToServer(config: SSHConfig): Promise<void>
async executeCommand(cmd: string): Promise<CommandOutput>
async streamTerminal(callback: OutputCallback): void
async disconnectServer(): Promise<void>
```

### 5. Persistent Shell Service

**File:** `src/services/PersistentShell.ts`

**Responsibilities:**
- Maintain persistent SSH session
- Handle multi-command sequences
- Manage environment state
- Buffer output efficiently

**Use Cases:**
- Keep working directory context
- Maintain environment variables
- Support complex workflows
- Enable shell history

### 6. Database Layer

**Technology:** PostgreSQL + TypeORM

**Main Tables:**
```sql
users              -- User accounts & credentials
chat_messages      -- Chat history
ssh_commands       -- Command execution logs
audit_logs         -- Security audit trail
servers            -- SSH server configuration
user_roles         -- Permission mapping
sessions           -- Active sessions
```

**Key Features:**
- Connection pooling
- Prepared statements (SQL injection protection)
- Transaction support
- Migration system
- Entity relationships

## Data Flow

### Chat Message Flow

```
1. User types in frontend ChatBox
2. Frontend POST /api/chat with message
3. Backend receives, validates, authenticates
4. AIEngine processes with Claude API
5. Claude returns structured response
6. Backend parses response (intent, commands, risks)
7. Frontend receives response with options
8. User confirms or modifies
9. SSHTerminalService executes if approved
10. Results stream via WebSocket
11. Frontend updates TerminalEmulator in real-time
12. Results persisted to database
```

### Real-time Updates

```
Terminal Output (SSH)
    ↓
TerminalSessionManager captures
    ↓
Emits via Socket.io
    ↓
Frontend WebSocket listener
    ↓
xterm.js renders update
    ↓
User sees live output
```

## Authentication & Authorization

### JWT Flow

```
1. User logs in with credentials
2. Backend validates, generates JWT
3. Frontend stores JWT in localStorage
4. Every request includes: Authorization: Bearer <JWT>
5. Middleware verifies signature & expiration
6. Request proceeds or returns 401
```

### Role-Based Access Control (RBAC)

```
Roles:
├─ ADMIN
│  ├─ All permissions
│  ├─ User management
│  └─ System configuration
├─ OPERATOR
│  ├─ Execute commands
│  ├─ View logs
│  └─ Limited to allowed servers
└─ VIEWER
   ├─ Read-only access
   └─ View statistics only
```

## Security Architecture

### Threat Model

| Threat | Mitigation |
|--------|-----------|
| Unauthorized command execution | Confirmation dialogs, audit logs |
| Credential theft | JWT tokens, HTTPS only, no credentials in logs |
| SQL injection | Parameterized queries, TypeORM |
| XSS attacks | React escaping, Content Security Policy |
| CSRF attacks | CSRF tokens on POST requests |
| SSH key exposure | Key encryption, restricted file permissions |

### Defense in Depth

1. **Authentication Layer**: JWT token validation
2. **Authorization Layer**: Role-based permission checks
3. **Input Validation**: Schema validation on all inputs
4. **Output Encoding**: HTML escaping for user content
5. **Audit Logging**: All commands logged with user/timestamp
6. **Rate Limiting**: Prevents brute force attacks
7. **Error Handling**: Generic error messages to users

## Deployment Architecture

### Docker Compose Stack

```yaml
services:
  postgres      # Database
  backend       # Express API
  frontend      # React app
  nginx         # Reverse proxy (production)
```

### Kubernetes Ready

- Containerized services
- Environment-based config
- Health checks defined
- Resource limits set
- Volumes for persistence

## Performance Considerations

### Optimization Strategies

1. **Frontend**
   - Code splitting via Vite
   - Image optimization
   - Lazy loading routes
   - Memoization of expensive components

2. **Backend**
   - Connection pooling
   - Query caching
   - Response compression
   - Batch operations where possible

3. **Network**
   - WebSocket for real-time (reduces polling)
   - Gzip compression
   - CDN-ready assets
   - Efficient JSON payloads

4. **Database**
   - Indexes on frequently queried columns
   - Connection pooling
   - Query optimization
   - Partition large tables

## Scalability

### Horizontal Scaling
- Stateless API servers (multiple instances)
- Shared PostgreSQL database
- Sticky sessions for WebSocket (redis session store)
- Load balancer distribution

### Vertical Scaling
- Increase server resources
- Optimize algorithms
- Cache frequently accessed data
- Archive old audit logs

## Monitoring & Logging

### Key Metrics
- API response times
- SSH command execution times
- Database query performance
- WebSocket connection count
- Error rates

### Logging Strategy
- Application logs: `/var/log/aisystant/`
- Audit logs: Dedicated table
- Access logs: Nginx/reverse proxy
- Error logs: Error tracking service

## Future Enhancements

- [ ] GraphQL API layer
- [ ] Multi-region deployment
- [ ] Advanced caching layer (Redis)
- [ ] Message queue system (RabbitMQ)
- [ ] Machine learning for command optimization
- [ ] Custom prompt templates
- [ ] Plugin system for extensions
