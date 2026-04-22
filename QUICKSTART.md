# Quick Start Guide

Get AiSystant running in 5 minutes!

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git
- An Anthropic API key (get one at https://console.anthropic.com)

## Step 1: Clone & Install

```bash
# Clone repository
git clone https://github.com/your-org/aisystant.git
cd aisystant

# Make setup script executable
chmod +x setup.sh

# Run setup (installs dependencies + creates env files)
bash setup.sh
```

## Step 2: Configure Environment

Edit `backend/.env`:

```bash
# Get your API key from https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-xxx...

# Database (Docker will handle this)
DATABASE_URL=postgresql://aisystant:password@localhost:5432/aisystant

# Generate a secure JWT secret
JWT_SECRET=$(openssl rand -hex 32)
echo $JWT_SECRET

# Add it to .env
# JWT_SECRET=your-secret-here

# SSH settings (optional, for testing)
SSH_KEY_PATH=~/.ssh/id_rsa
```

## Step 3: Start Services

### Option A: Using Make (Recommended)

```bash
# Start all services (API, Frontend, Admin)
make dev

# This runs:
# - Backend API on http://localhost:3001
# - Frontend UI on http://localhost:5173
# - Admin Dashboard on http://localhost:3002
# - PostgreSQL database in Docker
```

### Option B: Individually

```bash
# Terminal 1: Start database
docker-compose up -d postgres

# Terminal 2: Start backend API
cd backend
npm run dev

# Terminal 3: Start frontend UI
cd frontend
npm run dev

# Terminal 4 (optional): Start admin panel
cd backend
npm run admin
```

## Step 4: Access the App

Open in your browser:

- 🌐 **Frontend**: http://localhost:5173
- 🔌 **API**: http://localhost:3001
- 👨‍💼 **Admin**: http://localhost:3002

## Step 5: First Run

### Create Admin User

```bash
# Via API (if signup is enabled)
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123!",
    "name": "Admin User"
  }'
```

### Add SSH Servers

1. Go to http://localhost:3002 (Admin panel)
2. Click "Servers" → "Add Server"
3. Fill in:
   - Hostname: `your-server.com`
   - Username: `deploy` (or your user)
   - Port: `22`
   - SSH Key Path: `/home/you/.ssh/id_rsa`

### Test It!

1. Go to http://localhost:5173 (Frontend)
2. Login with your admin credentials
3. Type in chat: "Show me the uptime on [server-name]"
4. AI will understand and execute the command!

## Common Commands

### Stop Everything

```bash
make stop
# Or: docker-compose down
```

### View Logs

```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs (in its terminal)
# Ctrl+C

# Database logs
docker-compose logs -f postgres
```

### Reset Database

```bash
# Delete and recreate
docker-compose down -v
docker-compose up -d postgres
npm run migrate
```

### Clear Cache

```bash
make clean
# Removes node_modules from frontend and backend
```

## Troubleshooting

### "Port already in use"

```bash
# Change ports in Makefile or .env
BACKEND_PORT=3003 npm run dev
VITE_PORT=5174 npm run dev
```

### "Database connection refused"

```bash
# Check if postgres container is running
docker-compose ps

# If not running, start it
docker-compose up -d postgres

# Wait 10 seconds for startup
sleep 10

# Run migrations
npm run migrate
```

### "Cannot find module"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### "SSH connection failed"

1. Verify SSH key exists: `ls ~/.ssh/id_rsa`
2. Verify permissions: `chmod 600 ~/.ssh/id_rsa`
3. Check SSH_KEY_PATH in `.env`
4. Test SSH manually: `ssh -i ~/.ssh/id_rsa user@server.com`

### "API key error"

1. Go to https://console.anthropic.com
2. Create or copy your API key
3. Update `backend/.env`: `ANTHROPIC_API_KEY=sk-ant-xxx...`
4. Restart backend: `npm run dev`

## Next Steps

### Learn More

- 📖 [Full Documentation](../docs/)
- 🏗️ [Architecture Guide](../docs/ARCHITECTURE.md)
- 🔌 [API Reference](../docs/API.md)
- 🚀 [Deployment Guide](../docs/DEPLOYMENT.md)
- 🔒 [Security Policy](../docs/SECURITY.md)

### Development

- Look at [CONTRIBUTING.md](../docs/CONTRIBUTING.md)
- Check out the [Makefile](../Makefile)
- Explore `backend/src/` for API logic
- Explore `frontend/src/` for UI components

### Deployment

To deploy to production:

1. Follow [Deployment Guide](../docs/DEPLOYMENT.md)
2. Set up PostgreSQL server
3. Configure reverse proxy (Nginx/Apache)
4. Set up SSL certificates
5. Configure backups and monitoring

## Commands Reference

```bash
# Development
make dev              # Start all services
make install          # Install dependencies
make build            # Build for production
make test             # Run tests
make lint             # Run linters

# Docker
make docker           # Build and run with Docker
docker-compose ps     # Show running containers
docker-compose logs   # View logs
docker-compose down   # Stop all services

# Backend
cd backend
npm run dev           # Development mode
npm run build         # Compile TypeScript
npm run start         # Production mode
npm run admin         # Admin API server
npm run migrate       # Database migrations
npm test              # Run tests

# Frontend
cd frontend
npm run dev           # Vite dev server
npm run build         # Build production bundle
npm run preview       # Preview production build
npm run lint          # ESLint
npm test              # Run tests
```

## Getting Help

- 📧 Email: support@aisystant.dev
- 💬 GitHub Discussions: [Link]
- 🐛 Report Issues: [GitHub Issues]
- 📚 Documentation: See `docs/` folder

## What's Next?

Once you have it running:

1. **Explore the UI**: Chat with AI, execute commands
2. **Add more servers**: Build your infrastructure
3. **Create server groups**: Organize by environment
4. **Set up users**: Invite your team
5. **Configure monitoring**: Track command history
6. **Deploy to production**: Follow deployment guide

Happy automating! 🚀
