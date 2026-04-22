# API Reference

## Authentication

All API requests (except `/auth/login` and `/auth/register`) require a JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Login

**POST** `/api/auth/login`

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "operator"
  }
}
```

### Register

**POST** `/api/auth/register`

Request body:
```json
{
  "email": "newuser@example.com",
  "password": "secure_password",
  "name": "Jane Doe"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

---

## Chat Endpoints

### Send Message

**POST** `/api/chat`

Request body:
```json
{
  "message": "What's the status of nginx on web-01?",
  "conversationId": "conv_abc123"
}
```

Response:
```json
{
  "id": "msg_xyz789",
  "role": "assistant",
  "content": "I'll check the nginx status on web-01...",
  "suggestedCommands": [
    "systemctl status nginx"
  ],
  "riskLevel": "low",
  "requiresConfirmation": false
}
```

### Get Conversation History

**GET** `/api/chat/conversations/:conversationId`

Response:
```json
{
  "id": "conv_abc123",
  "messages": [
    {
      "id": "msg_1",
      "role": "user",
      "content": "Restart nginx"
    },
    {
      "id": "msg_2",
      "role": "assistant",
      "content": "I'll restart nginx for you"
    }
  ]
}
```

### List Conversations

**GET** `/api/chat/conversations?limit=10&offset=0`

Response:
```json
{
  "total": 42,
  "conversations": [
    {
      "id": "conv_abc123",
      "title": "Nginx troubleshooting",
      "lastMessage": "nginx is running",
      "timestamp": "2025-04-22T10:30:00Z"
    }
  ]
}
```

---

## SSH Endpoints

### Execute Command

**POST** `/api/ssh/command`

Request body:
```json
{
  "serverId": "srv_web01",
  "command": "systemctl status nginx",
  "confirm": true
}
```

Response:
```json
{
  "id": "cmd_123",
  "serverId": "srv_web01",
  "command": "systemctl status nginx",
  "status": "executing",
  "startTime": "2025-04-22T10:30:00Z"
}
```

### Get Command Output (WebSocket)

**WS** `/socket.io/?transport=websocket`

Emit:
```javascript
socket.emit('terminal:connect', {
  serverId: 'srv_web01',
  commandId: 'cmd_123'
});

// Listen for output
socket.on('terminal:output', (data) => {
  console.log(data.output); // stdout/stderr
});

socket.on('terminal:close', (data) => {
  console.log('Exit code:', data.exitCode);
});
```

### Get Command History

**GET** `/api/ssh/commands?serverId=srv_web01&limit=20`

Response:
```json
{
  "total": 156,
  "commands": [
    {
      "id": "cmd_123",
      "serverId": "srv_web01",
      "command": "systemctl status nginx",
      "status": "completed",
      "exitCode": 0,
      "duration": 1200,
      "timestamp": "2025-04-22T10:30:00Z"
    }
  ]
}
```

### Get Servers

**GET** `/api/servers`

Response:
```json
{
  "servers": [
    {
      "id": "srv_web01",
      "hostname": "web-01.example.com",
      "ip": "192.168.1.10",
      "username": "deploy",
      "port": 22,
      "groups": ["web", "production"],
      "status": "online",
      "lastCheck": "2025-04-22T11:29:00Z"
    }
  ]
}
```

---

## Admin Endpoints

All admin endpoints require `role === 'admin'`

### User Management

**GET** `/api/admin/users`

Response:
```json
{
  "users": [
    {
      "id": "usr_123",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "operator",
      "status": "active",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

**POST** `/api/admin/users`

Request:
```json
{
  "email": "newadmin@example.com",
  "name": "Admin User",
  "role": "admin"
}
```

**PATCH** `/api/admin/users/:userId`

Request:
```json
{
  "role": "viewer",
  "status": "inactive"
}
```

**DELETE** `/api/admin/users/:userId`

### Audit Logs

**GET** `/api/admin/logs?action=command_execute&limit=100`

Response:
```json
{
  "logs": [
    {
      "id": "log_456",
      "userId": "usr_123",
      "action": "command_execute",
      "resourceId": "cmd_123",
      "resourceType": "command",
      "changes": {
        "status": ["pending", "completed"],
        "exitCode": [null, 0]
      },
      "timestamp": "2025-04-22T10:30:00Z"
    }
  ]
}
```

### System Statistics

**GET** `/api/admin/stats`

Response:
```json
{
  "totalUsers": 15,
  "activeUsers": 12,
  "totalCommands": 1243,
  "commandsToday": 87,
  "avgCommandTime": 3200,
  "errorRate": 0.02,
  "uptime": 864000
}
```

### Server Groups

**GET** `/api/admin/server-groups`

Response:
```json
{
  "groups": [
    {
      "id": "grp_web",
      "name": "Web Servers",
      "description": "Production web servers",
      "servers": ["srv_web01", "srv_web02", "srv_web03"],
      "members": 5
    }
  ]
}
```

**POST** `/api/admin/server-groups`

Request:
```json
{
  "name": "Database Servers",
  "description": "Production databases",
  "serverIds": ["srv_db01", "srv_db02"]
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid input",
  "details": {
    "command": "Command is required"
  }
}
```

### 401 Unauthorized

```json
{
  "error": "UNAUTHORIZED",
  "message": "Missing or invalid token"
}
```

### 403 Forbidden

```json
{
  "error": "FORBIDDEN",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found

```json
{
  "error": "NOT_FOUND",
  "message": "Resource not found"
}
```

### 429 Too Many Requests

```json
{
  "error": "RATE_LIMITED",
  "message": "Too many requests. Try again in 60 seconds.",
  "retryAfter": 60
}
```

### 500 Internal Server Error

```json
{
  "error": "INTERNAL_ERROR",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

API endpoints are rate limited:

- **Anonymous**: 10 requests per minute
- **Authenticated**: 100 requests per minute
- **Admin**: 500 requests per minute

Rate limit headers included in response:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1650641700
```

---

## Pagination

List endpoints support pagination:

```
GET /api/ssh/commands?limit=20&offset=40
```

Response:
```json
{
  "total": 1000,
  "limit": 20,
  "offset": 40,
  "items": [...]
}
```

---

## WebSocket Events

### Connection

```javascript
const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

### Terminal Events

```javascript
// Open terminal connection
socket.emit('terminal:open', { serverId: 'srv_web01' });

// Listen for output
socket.on('terminal:data', (data) => {
  console.log(data.output);
});

// Send input
socket.emit('terminal:input', { input: 'ls -la\n' });

// Close terminal
socket.emit('terminal:close', {});
```

### Chat Events (Real-time)

```javascript
// Receive AI response chunks
socket.on('chat:stream', (chunk) => {
  console.log(chunk.content);
});

socket.on('chat:complete', (msg) => {
  console.log('Message complete');
});
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:3001/api'
});

// Login
const { data: auth } = await client.post('/auth/login', {
  email: 'user@example.com',
  password: 'password'
});

client.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;

// Send message
const { data: response } = await client.post('/chat', {
  message: 'Restart nginx'
});
```

### Python

```python
import requests

client = requests.Session()
client.headers.update({'Authorization': 'Bearer YOUR_TOKEN'})

response = client.post(
    'http://localhost:3001/api/chat',
    json={'message': 'What is nginx status?'}
)

print(response.json())
```

### cURL

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}' \
  | jq -r '.token')

# Send message
curl -X POST http://localhost:3001/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Restart nginx"}'
```

