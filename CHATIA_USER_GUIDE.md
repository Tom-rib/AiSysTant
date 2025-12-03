# ChatIA Guide - User Documentation

## 🤖 What is ChatIA?

ChatIA is an AI-powered assistant integrated into ChatOps Commander that can:
- Answer questions about your infrastructure
- Execute SSH commands automatically (with your approval)
- Provide security analysis before executing commands
- Learn from your server configurations

---

## 📖 Using ChatIA

### 1. Access the Guide
1. Click the **"📖 Guide"** tab in the left sidebar
2. Expand any section to learn more about features
3. Sections include:
   - **📖 Vue d'ensemble** - Overview of capabilities
   - **⚡ Fonctionnalités principales** - Risk levels and command classification
   - **🔐 Mode Agent SSH avancé** - How automatic execution works
   - **💡 Exemples d'utilisation** - Usage examples
   - **💬 Tips** - Best practices
   - **❓ FAQ** - Common questions

### 2. Start a Conversation
1. Click **"Nouvelle conversation"** (New Conversation)
2. A new chat will appear in the left sidebar
3. Start typing your question in the input box at the bottom

### 3. Types of Queries

#### Simple Questions (No SSH execution)
```
"How do I restart nginx?"
"What's the difference between apt and apt-get?"
"Explain Docker containers"
```
✅ The AI will provide information only, no commands executed

#### Information Requests (Read-only)
```
"Show my current system load"
"What services are running?"
"Check available disk space"
```
⚠️ With SSH Agent Mode OFF: You'll see suggested commands  
✅ With SSH Agent Mode ON: AI will execute and show results automatically

#### Configuration Changes (Modifying commands)
```
"Install nodejs and npm"
"Enable and start docker service"
"Create a new user named webserver"
```
⚠️ Requires your confirmation when SSH Agent Mode is ON

---

## 🤖 SSH Agent Mode

### What It Does
When enabled, the AI can execute commands directly on your SSH servers instead of just suggesting them.

### How to Enable
1. Check the box: **"🤖 Mode Agent SSH"** 
2. At the bottom of the chat input area
3. Once checked, the AI can auto-execute safe commands

### Risk Levels

**🟢 LOW RISK** (Auto-executed without asking)
```
ls, cat, grep, pwd, df, ps, apt list, git status
journalctl, systemctl status, netstat, ps aux
```

**🟡 MEDIUM RISK** (Requires your confirmation)
```
apt install, apt update, npm install, pip install
systemctl restart, systemctl stop, docker start, docker stop
git clone, git pull, mkdir, touch, cp, mv
```

**🔴 HIGH RISK** (Never executed automatically)
```
rm -rf, sudo reboot, systemctl disable
kill -9, iptables, sudo, dd, format, mkfs
```

### Example Workflow

#### Without Agent Mode
```
You:     "Update the system"
Claude:  "I recommend running: sudo apt update && sudo apt upgrade"
         "These are medium-risk commands requiring confirmation"
You:     "Execute them"
Claude:  "Commands executed successfully..."
```

#### With Agent Mode
```
You:     "Update the system"
Claude:  "I'll update your system now..."
         "✓ Updating package lists..."
         "✓ Installing updates..."
         "System is now up to date!"
```

---

## 💡 Best Practices

### DO ✅
- Ask specific questions: "Increase nginx max_clients from 1024 to 2048"
- Describe your problem clearly: "Nginx keeps crashing with out of memory errors"
- Ask for explanations: "Why should I use systemd instead of init.d?"
- Request verification: "Is port 443 open on web-01?"
- Enable Agent Mode for automation tasks

### DON'T ❌
- Use vague queries: "Fix the server" (too broad)
- Ask for multiple unrelated tasks: "Update packages AND restart AND check logs" (do one at a time)
- Assume the AI knows your infrastructure: Describe which servers/services you need modified
- Give unsafe permissions: The AI still respects command risk levels
- Disable security checks: Always review high-risk actions

---

## 🔒 Security & Permissions

### How ChatIA Stays Safe

1. **Command Risk Classification**
   - Every command is categorized automatically
   - High-risk commands are NEVER executed
   - Medium-risk commands need your approval
   - Low-risk commands execute immediately

2. **Audit Trail**
   - All executed commands are logged
   - Who executed it (AI or manual)
   - When it was executed
   - Results and errors
   - Viewable in conversation history

3. **Server Access Control**
   - ChatIA can only access servers you've configured
   - Uses your existing SSH credentials
   - Respects file permissions on each server
   - Cannot escalate privileges (no automatic sudo)

4. **Conversation Isolation**
   - Each conversation is independent
   - Commands from one chat don't affect another
   - Conversation history is kept separate
   - Can delete conversations (deletes command history too)

### What ChatIA CANNOT Do
- ❌ Execute commands without an SSH server configured
- ❌ Bypass your SSH authentication
- ❌ Run high-risk destructive commands
- ❌ Access servers you don't have credentials for
- ❌ Modify configurations without server access
- ❌ Create users or change permissions (requires sudo)

---

## 📋 Common Tasks

### Monitoring & Diagnostics
```
"Check system resource usage"
"Show which process is using the most memory"
"List all listening ports"
"Check nginx error logs"
"Display disk usage by directory"
```

### Package Management
```
"Install docker on all servers"
"Update nodejs to version 18"
"Remove old npm packages"
"List all installed services"
```

### File Management
```
"Read the nginx configuration"
"Show me the content of /etc/hosts"
"List files larger than 1GB"
"Find all Python files modified in the last week"
```

### Service Management
```
"Restart the nginx service"
"Check if PostgreSQL is running"
"Enable auto-start for docker"
"Stop the backup cron job"
```

### Troubleshooting
```
"Why isn't the web server responding?"
"Check for any errors in the system logs"
"Is the database connection working?"
"Verify the firewall rules for port 3306"
```

---

## 🎯 Example Conversations

### Example 1: Quick Status Check
```
You:     "Is the web server up?"

Claude:  I'll check the web server status...
         
         Status on web-01:
         ✓ nginx is running
         ✓ Port 80 is listening
         ✓ Port 443 is listening
         
         The web server is healthy and responding to requests.
```

### Example 2: Package Update with Confirmation
```
You:     "Update all packages on prod-db-01"

Claude:  I found 23 packages to update.
         
         This includes:
         - PostgreSQL (medium risk - needs restart)
         - OpenSSL (medium risk)
         - Various libraries (low risk)
         
         Agent Mode enabled, but PostgreSQL update requires your approval.
         
         Approve updates? [Approve] [Cancel]
         
You:     "Approve"

Claude:  ✓ Updating 23 packages...
         ✓ PostgreSQL restarted successfully
         ✓ All updates completed
         
         The server is now updated to the latest versions.
```

### Example 3: Configuration Review
```
You:     "Show me the nginx config and suggest improvements"

Claude:  Current nginx configuration:
         - Worker processes: 4
         - Max connections: 1024
         - Gzip: enabled
         - SSL: TLSv1.2 and above
         
         Suggestions:
         1. Enable http/2 for better performance
         2. Increase max_connections to 2048 for high traffic
         3. Add security headers (X-Frame-Options, etc.)
         4. Consider enabling brotli compression
         
         Would you like me to apply these changes?
```

---

## ⚠️ Troubleshooting

### "No servers configured"
**Problem**: ChatIA says no SSH servers are available  
**Solution**: Go to Settings → SSH Servers and add at least one server

### "Command failed with permission denied"
**Problem**: Command executed but failed due to permissions  
**Solution**: The AI needs to use sudo, but this requires elevated setup

### "Conversation not saving"
**Problem**: New conversations don't appear in the list  
**Solution**: 
1. Refresh the page
2. Check browser console for errors (F12)
3. Verify database connection is working

### "AI seems to forget context"
**Problem**: AI asks you to clarify or repeats information  
**Solution**: This is normal - describe your situation clearly in one message

---

## 🚀 Advanced Features

### Session History
- Conversations are saved automatically
- Revisit past conversations anytime
- Modify previous instructions
- Export conversations as text

### Multi-Server Operations
- Ask about multiple servers at once
- Compare configurations across servers
- Execute same command on multiple servers
- Get unified status reports

### Automation Patterns
- Create reusable conversation templates
- Schedule recurring tasks (coming soon)
- Chain multiple commands together
- Create runbooks for complex operations

---

## ❓ FAQ

**Q: Can ChatIA delete files?**  
A: No, high-risk commands like `rm -rf` are blocked for safety

**Q: Will ChatIA break my servers?**  
A: No, dangerous commands need your approval and are logged

**Q: Can I trust the AI recommendations?**  
A: Always review suggestions. The AI can make mistakes. Verify important decisions

**Q: What if Agent Mode is off?**  
A: Commands are suggested but not executed. You can copy-paste them manually

**Q: Can I use this in production?**  
A: Yes, with proper testing and careful use of Agent Mode. Test in development first

**Q: How do I export logs of what ChatIA did?**  
A: Click "Export" on any conversation to save as text file

---

## 📞 Getting Help

### In-app
- Read the **Guide** tab → **❓ FAQ** section
- Check **examples** for similar tasks
- Review **Tips** for best practices

### Common Issues  
- See `SSH_TERMINAL_FIX_GUIDE.md` for technical issues
- See `README.md` for setup instructions

---

**Version**: ChatOps Commander v5.4.21  
**Last Updated**: Dec 3, 2025  
**Status**: ✅ Ready for Use
