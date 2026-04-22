# Documentation Index

Welcome to AiSystant documentation! Find what you need below.

## 🚀 Getting Started

New to AiSystant? Start here:

1. **[QUICKSTART.md](../QUICKSTART.md)** - Get running in 5 minutes
   - Installation
   - Environment setup
   - First run & testing
   - Troubleshooting

2. **[README.md](../README.md)** - Project overview
   - What is AiSystant?
   - Features
   - Technology stack
   - Development scripts

## 📚 Core Documentation

### Understanding the System

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design & components
  - Architecture diagram
  - Core components explained
  - Data flow
  - Security architecture
  - Performance considerations
  - Scalability options

- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Directory layout
  - Complete file structure
  - File purposes
  - Development workflow
  - Naming conventions

### Development

- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute
  - Development workflow
  - Code style & conventions
  - Testing guidelines
  - Documentation standards
  - Pull request process

- **[API.md](API.md)** - API reference
  - Authentication endpoints
  - Chat endpoints
  - SSH endpoints
  - Admin endpoints
  - Error responses
  - Rate limiting
  - WebSocket events
  - SDK examples

### Deployment & Operations

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment
  - Environment setup
  - Docker deployment options
  - Reverse proxy configuration
  - SSL/TLS certificates
  - Health checks
  - Backup strategy
  - Monitoring & logging
  - Scaling
  - Disaster recovery

- **[SECURITY.md](SECURITY.md)** - Security practices
  - Threat model
  - Security measures
  - Authentication & authorization
  - Encryption strategies
  - Audit logging
  - Incident response
  - Compliance
  - Security checklist

## 📋 Quick Reference

### By Role

**For Developers:**
- Start: [QUICKSTART.md](../QUICKSTART.md)
- Code style: [CONTRIBUTING.md](CONTRIBUTING.md)
- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)
- API: [API.md](API.md)

**For DevOps/Operations:**
- Deployment: [DEPLOYMENT.md](DEPLOYMENT.md)
- Security: [SECURITY.md](SECURITY.md)
- Project structure: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

**For Project Managers:**
- Overview: [README.md](../README.md)
- Features: [README.md](../README.md#-funciontionalités-principales)
- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md) (high level)

### By Task

**I want to...**

- **Get started** → [QUICKSTART.md](../QUICKSTART.md)
- **Understand the system** → [ARCHITECTURE.md](ARCHITECTURE.md)
- **Build a feature** → [CONTRIBUTING.md](CONTRIBUTING.md)
- **Deploy to production** → [DEPLOYMENT.md](DEPLOYMENT.md)
- **Implement security** → [SECURITY.md](SECURITY.md)
- **Integrate via API** → [API.md](API.md)
- **Understand file layout** → [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- **Contribute code** → [CONTRIBUTING.md](CONTRIBUTING.md)

## 🏗️ Architecture Overview

```
User Interface (React)
         ↓
    API Server (Express)
         ↓
   AI Engine (Claude)
         ↓
SSH Terminal Service
         ↓
   Remote Servers
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed diagrams and explanations.

## 🔑 Key Concepts

### Users & Permissions

- **Admin**: Full system access
- **Operator**: Execute commands, view logs
- **Viewer**: Read-only access

See [SECURITY.md](SECURITY.md#authorization) for details.

### Data Flow

1. User types in chat
2. Frontend sends to backend API
3. Backend calls Claude API
4. Claude returns structured response
5. Backend executes SSH commands
6. Results stream via WebSocket
7. Frontend displays in real-time

See [ARCHITECTURE.md](ARCHITECTURE.md#data-flow) for more.

### Components

**Backend:**
- Express API server
- AI engine integration
- SSH connection management
- Database service

**Frontend:**
- React UI
- Chat interface
- Terminal emulator
- Real-time updates (WebSocket)

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for files.

## 📖 Reading Guide

### For First-Time Contributors

1. Read [README.md](../README.md) (10 min)
2. Follow [QUICKSTART.md](../QUICKSTART.md) (5 min)
3. Review [ARCHITECTURE.md](ARCHITECTURE.md) (20 min)
4. Check [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) (10 min)
5. Read [CONTRIBUTING.md](CONTRIBUTING.md) (15 min)
6. Start coding! 🚀

Total: ~1 hour to get oriented

### For New Operators/DevOps

1. Read [README.md](../README.md) (10 min)
2. Follow [QUICKSTART.md](../QUICKSTART.md) (5 min)
3. Review [DEPLOYMENT.md](DEPLOYMENT.md) (30 min)
4. Study [SECURITY.md](SECURITY.md) (30 min)
5. Set up monitoring & backups (30 min)

Total: ~2 hours

### For API Integration

1. Read [README.md](../README.md) - Features (5 min)
2. Review [API.md](API.md) - Endpoints (30 min)
3. Check SDK examples (10 min)
4. Test with cURL/Postman (15 min)

Total: ~1 hour

## 🆘 Common Questions

**Q: How do I get started?**
A: See [QUICKSTART.md](../QUICKSTART.md)

**Q: How does the system work?**
A: See [ARCHITECTURE.md](ARCHITECTURE.md)

**Q: Where do I put new code?**
A: See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

**Q: How do I contribute?**
A: See [CONTRIBUTING.md](CONTRIBUTING.md)

**Q: How do I deploy?**
A: See [DEPLOYMENT.md](DEPLOYMENT.md)

**Q: What are the APIs?**
A: See [API.md](API.md)

**Q: Is it secure?**
A: See [SECURITY.md](SECURITY.md)

## 📚 External Resources

- [Node.js Documentation](https://nodejs.org/)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Anthropic Claude API](https://docs.anthropic.com/)

## 📝 How to Update Documentation

1. Edit the relevant `.md` file
2. Ensure Markdown formatting is correct
3. Run `npm run lint` if applicable
4. Commit with descriptive message
5. Push to branch
6. Create pull request

## 🔍 Documentation Search

- Use Ctrl+F to search within a file
- Use GitHub's search for cross-repo search
- Check the table of contents at top of each file

## 📧 Need Help?

- **General questions**: Check [ARCHITECTURE.md](ARCHITECTURE.md)
- **Setup issues**: Check [QUICKSTART.md](../QUICKSTART.md) troubleshooting
- **Security concerns**: See [SECURITY.md](SECURITY.md)
- **API integration**: Check [API.md](API.md)
- **Deployment**: Follow [DEPLOYMENT.md](DEPLOYMENT.md)

## 🗺️ Document Map

```
README.md                          Main project documentation
├── QUICKSTART.md                 Quick start (5 minutes)
└── docs/
    ├── INDEX.md (this file)      Navigation hub
    ├── ARCHITECTURE.md           System design
    ├── PROJECT_STRUCTURE.md      File organization
    ├── API.md                    API endpoints
    ├── DEPLOYMENT.md             Production setup
    ├── SECURITY.md               Security practices
    └── CONTRIBUTING.md           Contribution guide
```

---

**Last Updated**: 2025-04-22  
**Version**: 1.0  
**Status**: Production Ready

