# Quick Start Guide - ChatOps Commander

## 🚀 Getting Started in 5 Minutes

### 1. **Start the Application**
```bash
cd frontend && npm run dev      # Terminal 1: Frontend dev server
cd backend && npm run dev       # Terminal 2: Backend dev server
```

Frontend runs on: http://localhost:5173  
Backend runs on: http://localhost:3001

### 2. **Login/Register**
- Visit http://localhost:5173
- Create account or login with existing credentials
- You'll be redirected to the dashboard

### 3. **Configure SSH Server**
- Go to **Settings** (⚙️ icon)
- Click **"Add SSH Server"**
- Fill in:
  - Server Name (e.g., "web-01")
  - Host (e.g., "192.168.1.100")
  - Username (e.g., "ubuntu")
  - Password OR SSH Private Key
- Click **"Save"**

### 4. **Open SSH Terminal**
- Go to **SSH** tab
- Click **"+ New Terminal"**
- Select a server from the dropdown
- A new terminal tab will appear
- Type commands: `pwd`, `ls`, `whoami`, etc.

### 5. **Use ChatIA**
- Go to **Chat** tab
- Click **"Nouvelle conversation"** (New Conversation)
- Ask a question: *"List my servers"* or *"Check disk space"*
- The AI will respond with information

### 6. **Enable SSH Agent Mode** (Optional)
- In Chat tab, check **"🤖 Mode Agent SSH"**
- Now the AI can execute commands automatically
- Type: *"Update the system"*
- The AI will execute and show results

---

## 📋 Main Features

### 🤖 ChatIA (AI Assistant)
- Ask questions about your infrastructure
- Get real-time system information
- Execute commands automatically (with approval)
- Risk-based command filtering

### 🖥️ SSH Terminal
- Interactive shell access to multiple servers
- Multiple terminals open simultaneously
- Commands persist (cd works across commands)
- Real-time output display

### 🔒 Security
- SSH key or password authentication
- Risk-based command classification
- Audit trail of all actions
- Server access control

### 📊 Dashboard
- View all configured servers
- Monitor system health
- Quick status checks
- Activity history

---

## 🆘 Troubleshooting

### Terminal Won't Connect
1. Check SSH credentials in Settings
2. Verify server is reachable (ping it)
3. Check backend logs for SSH errors
4. Verify port (usually 22 for SSH)

### ChatIA Doesn't Respond
1. Ensure at least one SSH server is configured
2. Check browser console (F12) for errors
3. Verify backend is running on port 3001
4. Reload the page

### Terminal Commands Don't Execute
1. Check backend logs for socket errors
2. Open browser DevTools (F12 → Console)
3. Look for "terminal-input" events
4. See `SSH_TERMINAL_FIX_GUIDE.md` for detailed debugging

### Page Won't Load
1. Clear browser cache (Ctrl+Shift+Delete)
2. Check if ports 5173 and 3001 are available
3. Verify all npm packages are installed
4. Check for TypeScript errors in terminal

---

## 📚 Documentation

| Guide | Purpose | Audience |
|-------|---------|----------|
| `CHATIA_USER_GUIDE.md` | How to use ChatIA | End Users |
| `SSH_TERMINAL_FIX_GUIDE.md` | Terminal debugging | Developers |
| `FIXES_SUMMARY_2025.md` | What was fixed | Project Managers |
| `COMPLETION_REPORT.md` | Full status report | Stakeholders |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send chat message |
| `Shift+Enter` | New line in chat |
| `Ctrl+Shift+Delete` | Clear browser cache |
| `F12` | Open DevTools |
| `Ctrl+L` | Clear terminal (in SSH tab) |

---

## 🎯 Common Tasks

### Check Server Status
```
Chat: "Show me the system load and disk usage"
SSH: "df -h" and "top -bn1 | head -20"
```

### Restart a Service
```
Chat: "Restart nginx" (with Agent mode ON)
SSH: "sudo systemctl restart nginx"
```

### Update System
```
Chat: "Update all packages" (with Agent mode ON)
SSH: "sudo apt update && sudo apt upgrade -y"
```

### View Logs
```
Chat: "Show me recent errors in nginx logs"
SSH: "sudo tail -100 /var/log/nginx/error.log"
```

---

## 🔧 Configuration Files

### Frontend
- `frontend/.env` - Environment variables
- `frontend/vite.config.ts` - Vite configuration
- `frontend/tailwind.config.js` - Tailwind CSS

### Backend
- `backend/.env` - Environment variables (DB, JWT, etc.)
- `backend/src/config/` - Database, Redis config
- `backend/src/server.ts` - Main server setup

---

## 🚀 Development Tips

### Enable Debug Logs
1. Open DevTools (F12 → Console)
2. Look for `[MultiTerminal]`, `[TerminalEmulator]`, `[Socket]` logs
3. These show the flow of events

### Test SSH Connection
```bash
# From backend directory
ssh -i /path/to/key username@hostname "pwd"
```

### Check Database
```bash
# Login to PostgreSQL
psql -U postgres -d aisystant_db
```

### Monitor Backend
```bash
# Watch logs in real-time
npm run dev     # Shows all console logs
```

---

## 📞 Support

### For Errors
1. Check browser console (F12)
2. Check backend terminal
3. Read relevant guide above
4. Check GitHub issues

### For Feature Requests
1. Open issue on GitHub
2. Describe the feature
3. Explain the use case
4. Provide examples if possible

---

## ✅ Checklist for First Run

- [ ] Frontend running on localhost:5173
- [ ] Backend running on localhost:3001
- [ ] Can login/register
- [ ] SSH server configured in settings
- [ ] Can open SSH terminal
- [ ] Can type commands in SSH terminal
- [ ] Can create new chat conversation
- [ ] Can ask ChatIA questions
- [ ] ChatIA responds appropriately

---

## 🎓 Learn More

- **Frontend**: `frontend/README.md`
- **Backend**: `backend/README.md`
- **API Docs**: `backend/API.md`
- **Architecture**: `ARCHITECTURE.md`

---

**Version**: ChatOps Commander v5.4.21  
**Last Updated**: December 3, 2025
