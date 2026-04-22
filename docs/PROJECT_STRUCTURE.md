# Project Structure

## Root Directory

```
aisystant/
├── .agent                          # GitHub Copilot Agent configuration
├── .archive/                       # Archived documentation (cleanup)
│   └── docs/                       # Old markdown files (not used)
├── .git/                          # Git repository
├── .gitignore                     # Git ignore rules
│
├── README.md                      # Main project documentation
├── QUICKSTART.md                  # Quick start guide (5 minutes)
├── Makefile                       # Development commands
├── docker-compose.yml             # Docker services configuration
│
├── setup.sh                       # Initial setup script
├── install.sh                     # Installation script
├── install-debian-12.sh           # Debian 12 specific install
│
├── docs/                          # Documentation (main)
│   ├── ARCHITECTURE.md            # System design & components
│   ├── API.md                     # API endpoints & examples
│   ├── DEPLOYMENT.md              # Production deployment guide
│   ├── CONTRIBUTING.md            # Contribution guidelines
│   └── SECURITY.md                # Security policy & practices
│
├── backend/                       # Node.js/Express API server
│   ├── src/
│   │   ├── server.ts              # Main Express app
│   │   ├── admin-api-server.ts    # Admin dashboard API
│   │   │
│   │   ├── routes/                # API endpoints
│   │   │   ├── chat.ts            # Chat/AI endpoints
│   │   │   ├── ssh-shell.ts       # SSH shell execution
│   │   │   ├── ssh-terminal.ts    # Terminal WebSocket
│   │   │   ├── admin.ts           # Admin panel routes
│   │   │   ├── stats.ts           # Statistics endpoints
│   │   │   └── settings.ts        # Settings endpoints
│   │   │
│   │   ├── controllers/           # Request handlers
│   │   │   ├── ChatController.ts
│   │   │   ├── SSHController.ts
│   │   │   └── StatsController.ts
│   │   │
│   │   ├── services/              # Business logic
│   │   │   ├── AIEngine.ts        # Claude AI integration
│   │   │   ├── AIAgentService.ts  # AI agent coordination
│   │   │   ├── SSHTerminalService.ts  # SSH connections
│   │   │   ├── PersistentShell.ts     # Shell persistence
│   │   │   ├── TerminalSessionManager.ts
│   │   │   └── adminService.ts    # Admin operations
│   │   │
│   │   ├── sockets/               # WebSocket handlers
│   │   │   └── terminal.ts        # Terminal real-time updates
│   │   │
│   │   ├── middleware/            # Express middleware
│   │   │   ├── adminAuth.ts       # Admin authentication
│   │   │   ├── auth.ts            # JWT verification
│   │   │   └── errorHandler.ts    # Error handling
│   │   │
│   │   ├── config/                # Configuration
│   │   │   ├── database.ts        # Database setup
│   │   │   ├── migrate.ts         # Migration runner
│   │   │   └── constants.ts       # Constants & enums
│   │   │
│   │   └── types/                 # TypeScript types
│   │       ├── models.ts          # Data models
│   │       └── interfaces.ts      # Interfaces
│   │
│   ├── migrations/                # Database migrations
│   │   └── 001_initial.sql
│   │
│   ├── test/                      # Tests
│   │   ├── unit/
│   │   └── integration/
│   │
│   ├── Dockerfile                 # Docker image definition
│   ├── .env.example               # Environment template
│   ├── .env                       # Environment (not in git)
│   ├── package.json               # Dependencies
│   ├── tsconfig.json              # TypeScript config
│   ├── jest.config.js             # Test config
│   └── README.md                  # Backend specific docs
│
├── frontend/                      # React + Vite UI
│   ├── src/
│   │   ├── main.tsx               # React entry point
│   │   │
│   │   ├── pages/                 # Page components
│   │   │   ├── Landing.tsx        # Landing page
│   │   │   ├── Login.tsx          # Login page
│   │   │   ├── Chat.tsx           # Main chat interface
│   │   │   ├── SSH.tsx            # Terminal interface
│   │   │   ├── Settings.tsx       # User settings
│   │   │   ├── Pricing.tsx        # Pricing page
│   │   │   ├── BillingPage.tsx    # Billing management
│   │   │   ├── SSHHelp.tsx        # SSH help/docs
│   │   │   │
│   │   │   └── Admin/             # Admin pages
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── AdminUsers.tsx
│   │   │       ├── AdminServers.tsx
│   │   │       └── AdminBilling.tsx
│   │   │
│   │   ├── components/            # Reusable components
│   │   │   ├── Chat/
│   │   │   │   ├── ChatBox.tsx    # Message input
│   │   │   │   ├── ChatMessage.tsx
│   │   │   │   └── ChatHistory.tsx
│   │   │   │
│   │   │   ├── Terminal/
│   │   │   │   ├── TerminalEmulator.tsx
│   │   │   │   ├── MultiTerminal.tsx
│   │   │   │   └── SSHTerminal.tsx
│   │   │   │
│   │   │   ├── Server/
│   │   │   │   ├── ServerSelector.tsx
│   │   │   │   ├── ServerGroupManager.tsx
│   │   │   │   └── SSHShellTab.tsx
│   │   │   │
│   │   │   ├── Common/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── PublicNavbar.tsx
│   │   │   │   ├── ProfileDropdown.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── Loading.tsx
│   │   │   │
│   │   │   ├── Landing/           # Landing page sections
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── FeaturesSection.tsx
│   │   │   │   ├── HowItWorks.tsx
│   │   │   │   ├── CTASection.tsx
│   │   │   │   └── WhatIsSection.tsx
│   │   │   │
│   │   │   ├── Admin/             # Admin components
│   │   │   │   ├── AdminLayout.tsx
│   │   │   │   ├── UserManagement.tsx
│   │   │   │   └── ServerManagement.tsx
│   │   │   │
│   │   │   └── Auth/
│   │   │       ├── ProtectedRoute.tsx
│   │   │       ├── ProtectedAdminRoute.tsx
│   │   │       └── LoginForm.tsx
│   │   │
│   │   ├── context/               # React Context (state)
│   │   │   ├── ChatContext.tsx    # Chat state
│   │   │   ├── SSHContext.tsx     # SSH state
│   │   │   └── AuthContext.tsx    # Auth state
│   │   │
│   │   ├── services/              # API services
│   │   │   ├── api.ts             # Main API client
│   │   │   ├── adminApi.ts        # Admin API calls
│   │   │   ├── socketService.ts   # WebSocket client
│   │   │   └── auth.ts            # Auth utilities
│   │   │
│   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── useChat.ts
│   │   │   ├── useSSH.ts
│   │   │   └── useAuth.ts
│   │   │
│   │   ├── types/                 # TypeScript types
│   │   │   ├── chat.ts
│   │   │   ├── ssh.ts
│   │   │   └── user.ts
│   │   │
│   │   ├── styles/                # CSS modules & globals
│   │   │   ├── index.css          # Global styles
│   │   │   ├── tailwind.css       # Tailwind imports
│   │   │   ├── terminal.css       # Terminal styling
│   │   │   ├── chat.css           # Chat styling
│   │   │   └── multi-terminal.css
│   │   │
│   │   ├── App.tsx                # Root component
│   │   └── index.css              # Global styles
│   │
│   ├── public/                    # Static assets
│   │   ├── favicon.ico
│   │   └── logo.png
│   │
│   ├── Dockerfile                 # Docker image
│   ├── .env.example               # Environment template
│   ├── .env                       # Environment (not in git)
│   ├── package.json               # Dependencies
│   ├── tsconfig.json              # TypeScript config
│   ├── vite.config.ts             # Vite bundler config
│   ├── tailwind.config.js         # TailwindCSS config
│   ├── postcss.config.js          # PostCSS config
│   └── README.md                  # Frontend specific docs
│
├── admin-panel/                   # Admin dashboard (legacy)
│   ├── index.html
│   ├── nginx.conf
│   └── (static assets)
│
└── .env.example                   # Root env template
```

## File Purpose Quick Reference

### Critical Files

| File | Purpose |
|------|---------|
| `backend/src/server.ts` | Express server initialization |
| `backend/src/services/AIEngine.ts` | Claude AI integration |
| `backend/src/services/SSHTerminalService.ts` | SSH command execution |
| `frontend/src/pages/Chat.tsx` | Main chat interface |
| `frontend/src/context/ChatContext.tsx` | Chat state management |
| `docker-compose.yml` | Development environment |

### Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `QUICKSTART.md` | Get started in 5 minutes |
| `docs/ARCHITECTURE.md` | System design |
| `docs/API.md` | API endpoints |
| `docs/DEPLOYMENT.md` | Production deployment |
| `docs/SECURITY.md` | Security practices |
| `docs/CONTRIBUTING.md` | Contribution guidelines |

### Configuration Files

| File | Purpose |
|------|---------|
| `.agent` | GitHub Copilot configuration |
| `.env` | Environment variables (secret) |
| `.env.example` | Environment template |
| `.gitignore` | Git ignore rules |
| `package.json` | NPM dependencies |
| `tsconfig.json` | TypeScript configuration |
| `docker-compose.yml` | Docker services |
| `Makefile` | Development commands |

## Development Workflow

### Adding a New Feature

```
1. Create feature branch: git checkout -b feature/my-feature
2. Update backend:
   - Add API endpoint in backend/src/routes/
   - Add service logic in backend/src/services/
   - Add middleware if needed
   - Add database migration if needed
3. Update frontend:
   - Add React components in frontend/src/components/
   - Add pages if needed in frontend/src/pages/
   - Update context if state needed
   - Add API service call in frontend/src/services/
4. Test locally: make dev
5. Commit and push
6. Create pull request
```

### Database Changes

```
1. Create migration file in backend/migrations/
2. Apply migration: npm run migrate
3. Update TypeORM models
4. Test with: npm test
```

### Deploying to Production

```
1. Ensure all tests pass
2. Build images: docker-compose build
3. Push to registry
4. Deploy with docker-compose or k8s
5. Run migrations: docker-compose exec backend npm run migrate
6. Monitor logs
```

## Key Technology Files

- **Express Setup**: `backend/src/server.ts`
- **Database**: `backend/src/config/database.ts`
- **Authentication**: `backend/src/middleware/auth.ts`
- **React Setup**: `frontend/src/main.tsx`
- **WebSocket**: `backend/src/sockets/terminal.ts`
- **SSL/TLS**: `nginx.conf` in frontend

## Important Directories

```
backend/
├── src/          # Source code (edit here)
├── dist/         # Compiled output (generated)
├── migrations/   # Database migrations
└── node_modules/ # Dependencies (don't edit)

frontend/
├── src/          # Source code (edit here)
├── dist/         # Build output (generated)
└── node_modules/ # Dependencies (don't edit)
```

## Naming Conventions

### Files
- Components: `PascalCase.tsx` → `ChatBox.tsx`
- Services: `camelCase.ts` → `chatService.ts`
- Utilities: `camelCase.ts` → `tokenUtils.ts`
- Styles: `kebab-case.css` → `chat-box.css`

### Functions
- React Components: `PascalCase` → `ChatBox`
- Regular functions: `camelCase` → `getUserById`
- Async functions: `camelCase` → `fetchUserData`
- Event handlers: `camelCase` starting with `handle` → `handleSubmit`

### Variables
- Constants: `UPPER_SNAKE_CASE` → `MAX_RETRIES`
- Regular: `camelCase` → `userName`
- React state: `camelCase` → `chatMessages`

## Related Documentation

- See `README.md` for project overview
- See `QUICKSTART.md` for setup instructions
- See `docs/ARCHITECTURE.md` for detailed system design
- See `docs/CONTRIBUTING.md` for contribution guidelines
