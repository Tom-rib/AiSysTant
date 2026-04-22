# 🚀 Quick Reference - Chatops-Commander

## Current Status
- ✅ Frontend: Complete landing pages, pricing, authentication UI
- ✅ Design System: Dark theme with white cards, cyan accents
- ⏳ Backend: API endpoints needed
- ⏳ Database: Schema to be created

---

## Project URLs

### Frontend (React + Vite)
```
Local: http://localhost:5173/
Production: (Configure in .env)
```

### Backend (Node.js + Express)
```
Local: http://localhost:3001/
Production: (Configure in .env)
```

### Database (PostgreSQL)
```
Local: postgresql://localhost:5432/chatops
Production: (Configure in .env)
```

---

## Key Files & Directories

```
📁 frontend/
├── src/
│  ├── pages/
│  │  ├── Landing.tsx          ✅ Landing page
│  │  ├── Pricing.tsx          ✅ 4-tier pricing page
│  │  ├── Login.tsx            ✅ Login form
│  │  ├── Register.tsx         ✅ Register form
│  │  ├── Dashboard.tsx        ✅ User dashboard
│  │  ├── Chat.tsx             ✅ Chat interface
│  │  ├── SSH.tsx              ✅ SSH terminal
│  │  ├── Settings.tsx         ✅ Settings
│  │  ├── AccountSettings.tsx  ✅ Account settings
│  │  └── SecuritySettings.tsx ✅ 2FA settings
│  ├── components/
│  │  ├── Navbar.tsx           ✅ Authenticated navbar
│  │  ├── PublicNavbar.tsx     ✅ Public navbar
│  │  ├── ProfileDropdown.tsx  ✅ User menu
│  │  └── PrivateRoute.tsx     ✅ Route protection
│  ├── context/
│  │  ├── AuthContext.tsx      ✅ Auth state
│  │  ├── ChatContext.tsx      ✅ Chat state
│  │  └── SSHContext.tsx       ✅ SSH state
│  ├── index.css               ✅ Global styles
│  └── App.tsx                 ✅ Main app
├── public/
│  ├── logo-192.png            ✅ Project logo
│  └── ...
└── package.json

📁 backend/
├── src/
│  ├── api/
│  │  └── routes/
│  │     ├── auth.ts          ⏳ Authentication
│  │     ├── account.ts       ⏳ Account management
│  │     ├── billing.ts       ⏳ Subscriptions
│  │     ├── chat.ts          ⏳ Chat messages
│  │     └── servers.ts       ⏳ SSH servers
│  ├── middleware/
│  │  ├── auth.ts             ⏳ JWT verification
│  │  └── errorHandler.ts     ⏳ Error handling
│  ├── models/                ⏳ Database models
│  ├── database/              ⏳ Connection & migrations
│  ├── config/                ⏳ Configuration
│  ├── app.ts                 ⏳ Express app setup
│  └── server.ts              ⏳ Server entry point
├── .env.example
└── package.json

📁 Database Migrations/
├── 2024_create_users.sql
├── 2024_create_servers.sql
├── 2024_create_chat_messages.sql
├── 2024_add_subscriptions.sql
└── 2024_add_billing.sql
```

---

## Environment Variables

### Frontend (.env or .env.local)
```env
VITE_API_URL=http://localhost:3001
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/chatops
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRY=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Claude AI
CLAUDE_API_KEY=sk-ant-...

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

---

## API Endpoints Structure

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
```

### Account
```
GET    /api/account/profile
PUT    /api/account/password
PUT    /api/account/email
POST   /api/account/2fa/setup
POST   /api/account/2fa/verify
POST   /api/account/2fa/disable
```

### Billing
```
GET    /api/billing/subscription
GET    /api/billing/plans
POST   /api/billing/checkout
GET    /api/billing/invoices
POST   /api/billing/webhook
```

### Chat
```
POST   /api/chat/messages
GET    /api/chat/history
POST   /api/chat/conversations
```

### SSH Servers
```
POST   /api/servers
GET    /api/servers
PUT    /api/servers/:id
DELETE /api/servers/:id
POST   /api/servers/:id/test
```

---

## Database Schema Overview

### users
```sql
- id (PRIMARY KEY)
- email (UNIQUE)
- username (UNIQUE)
- password_hash
- subscription_plan (DEFAULT: 'free')
- created_at
- updated_at
```

### servers
```sql
- id (PRIMARY KEY)
- user_id (FOREIGN KEY → users)
- name
- host
- port (DEFAULT: 22)
- username
- private_key (encrypted)
- created_at
```

### chat_messages
```sql
- id (PRIMARY KEY)
- user_id (FOREIGN KEY → users)
- content
- role ('user' | 'assistant')
- created_at
```

### subscriptions
```sql
- id (PRIMARY KEY)
- user_id (UNIQUE FOREIGN KEY → users)
- plan ('free'|'starter'|'pro'|'enterprise')
- status ('active'|'cancelled'|'past_due')
- stripe_id
- created_at
- expires_at
```

---

## Color Palette (Design System)

### Backgrounds
- Navy: `#0A0E1A` (page background)
- Section: `#1A2F4A` (card sections when needed)
- Card: `#FFFFFF` (white cards)
- Light: `#F5F5F5` (hover state)

### Texts
- White: `#FFFFFF` (on dark backgrounds)
- Light Gray: `#E0E0E0` (secondary text on dark)
- Dark: `#0A0E1A` (on white cards)
- Medium Gray: `#475569` (secondary text on white)

### Accents
- Blue: `#0066CC` (primary buttons)
- Cyan: `#00D4FF` (highlights, hover)
- Green: `#10B981` (success, checkmarks)
- Red: `#EF4444` (errors, danger)
- Orange: `#F59E0B` (warnings)

---

## Component Naming Convention

### Pages
- PascalCase (e.g., `Dashboard.tsx`, `Chat.tsx`)
- Exported as default
- Live in `src/pages/`

### Components
- PascalCase (e.g., `Navbar.tsx`, `ProfileDropdown.tsx`)
- Can be exported as named or default
- Live in `src/components/`
- Organized in subdirectories by feature

### Utilities/Hooks
- camelCase (e.g., `useAuth.ts`, `useForm.ts`)
- Live in `src/hooks/` or `src/utils/`

### Types
- PascalCase (e.g., `User.ts`, `ChatMessage.ts`)
- Live in `src/types/`

---

## Common Commands

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Backend
```bash
cd backend

# Install dependencies
npm install

# Development server with auto-reload
npm run dev

# Build TypeScript
npm run build

# Start production
npm start

# Run migrations
npm run migrate

# Seed database
npm run seed
```

### Git Workflow
```bash
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "feat: description of changes"

# Push to GitHub
git push origin main

# Pull latest
git pull origin main

# View logs
git log --oneline -10
```

---

## Authentication Flow

### Login Flow
1. User fills email + password
2. Frontend: `POST /api/auth/login`
3. Backend: Verify password with bcrypt
4. Backend: Generate JWT token
5. Frontend: Store token in localStorage
6. Frontend: Redirect to `/dashboard`
7. All subsequent requests include JWT in `Authorization: Bearer <token>`

### Logout Flow
1. User clicks "Déconnexion"
2. Frontend: Delete token from localStorage
3. Frontend: Redirect to `/login`

### Protected Routes
- Check if token exists in localStorage
- If not, redirect to `/login`
- Pass token in `Authorization` header for API calls
- Backend verifies token before processing request

---

## Stripe Integration Checklist

- [ ] Create Stripe account
- [ ] Get API keys
- [ ] Add to `.env`
- [ ] Install `stripe` npm package
- [ ] Create checkout session endpoint
- [ ] Setup webhook handler
- [ ] Test with test card: `4242 4242 4242 4242`
- [ ] Handle payment success/failure
- [ ] Update subscription in database
- [ ] Send confirmation email

---

## Testing Credentials

### Test Stripe Card
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- Name: Any text

### Test Email Addresses
For development, you can use test emails like:
- `test@example.com`
- `admin@example.com`
- `user@example.com`

---

## Troubleshooting

### "Cannot find module" errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port already in use
```bash
# Kill process on port 3001 (backend)
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Database connection failed
```bash
# Check PostgreSQL is running
psql -U postgres -d postgres -c "SELECT 1"

# Create database if needed
createdb chatops

# Run migrations
npm run migrate
```

### JWT Token expired
- Clear localStorage
- Login again to get new token
- Check JWT_EXPIRY in backend .env

---

## Performance Tips

### Frontend
- Use React.memo for expensive components
- Lazy load routes with React.lazy()
- Optimize images (use WebP)
- Minimize CSS/JS bundles
- Enable gzip compression

### Backend
- Use database connection pooling
- Cache frequent queries
- Implement rate limiting
- Use async/await properly
- Monitor API response times

### Database
- Add indexes to frequently queried columns
- Use EXPLAIN to optimize slow queries
- Regular backups
- Monitor disk usage

---

## Security Best Practices

✅ DO:
- Hash passwords with bcrypt
- Use JWT with expiry
- Validate all inputs
- Use HTTPS in production
- Set secure CORS headers
- Rate limit API endpoints
- Encrypt sensitive data
- Use environment variables for secrets

❌ DON'T:
- Commit `.env` files to Git
- Store passwords in plaintext
- Trust user input
- Expose API keys in frontend code
- Disable SSL/TLS
- Use default credentials
- Log sensitive data
- Keep old dependencies

---

## Useful Links

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Express.js](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Stripe API](https://stripe.com/docs/api)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)

---

## Support & Contact

- 📧 Email: (configure)
- 💬 Discord: (configure)
- 📝 Issues: https://github.com/Tom-rib/Chatops-commander/issues
- 📚 Wiki: https://github.com/Tom-rib/Chatops-commander/wiki

---

**Last Updated:** 2024-12-03
**Version:** 1.0
