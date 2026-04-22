# Security Policy

## Overview

AiSystant handles sensitive infrastructure operations. This document outlines our security practices and policies.

## Threat Model

### High-Risk Scenarios

1. **Unauthorized Command Execution** - Attacker executes dangerous commands
2. **Credential Theft** - API keys, SSH keys, passwords exposed
3. **Data Breach** - Audit logs or command history accessed
4. **Man-in-the-Middle** - Network traffic intercepted
5. **Privilege Escalation** - User gains admin access
6. **Malicious AI Output** - Claude injection attacks

## Security Measures

### 1. Authentication

- **JWT Tokens**: Signed with HS256, expiration in 24 hours
- **Password Hashing**: bcrypt with salt rounds 12
- **Multi-factor Authentication**: (Recommended for admin accounts)
- **Session Management**: Redis-backed sessions with automatic cleanup

### 2. Authorization

- **Role-Based Access Control (RBAC)**:
  - **Admin**: Full system access, user management, system configuration
  - **Operator**: Execute commands, view logs, access permitted servers only
  - **Viewer**: Read-only access to statistics and history

- **Server-Level Permissions**: Users can be restricted to specific servers or groups

- **Resource Ownership**: Users can only access their own resources

### 3. Input Validation

- All user inputs validated on backend
- Strict schema validation for all API requests
- Command validation against whitelist/blacklist
- Prevention of command injection attacks

```typescript
// Example validation
const schema = {
  command: { type: 'string', maxLength: 1000, pattern: /^[a-zA-Z0-9\s\-\.\/]+$/ },
  serverId: { type: 'string', required: true }
};
```

### 4. Output Encoding

- HTML entities escaped for all user content
- JSON payloads validated before sending
- SQL injection prevented via parameterized queries
- Command output sanitized before storing

### 5. Encryption

**At Rest:**
- Database: PostgreSQL with encrypted connections
- SSH Keys: Encrypted with AES-256 in filesystem
- Configuration: Secrets manager integration

**In Transit:**
- HTTPS/TLS 1.3 mandatory
- WSS (secure WebSocket) for real-time connections
- Certificate pinning (recommended in production)

### 6. Audit Logging

All actions logged with:
- User ID / IP address
- Timestamp
- Action type
- Resource accessed
- Result (success/failure)
- Changes made

```sql
-- Audit log schema
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  action VARCHAR(50),
  resource_type VARCHAR(50),
  resource_id VARCHAR(100),
  changes JSONB,
  ip_address INET,
  timestamp TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20)
);
```

### 7. Rate Limiting

- **API Endpoints**: 100 requests/minute per user
- **Login Attempts**: 5 attempts/15 minutes per IP
- **Command Execution**: 10 commands/minute per user
- **SSH Connections**: 5 concurrent connections per user

### 8. CSRF Protection

- CSRF tokens required for state-changing operations
- SameSite cookie attribute set
- Token validation on backend

### 9. Security Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
```

### 10. Command Execution Safety

**Pre-Execution Checks:**
- User confirmation required for dangerous commands (rm, dd, etc.)
- Risk assessment by AI engine
- Syntax validation
- Permission verification

**Dangerous Command Patterns:**
```
rm -rf /
dd if=/dev/zero
fork() { fork | fork }
:() { : | : & }
curl | sh
wget | sh
```

### 11. SSH Security

- **Key-Based Authentication Only** (no passwords)
- SSH keys with 4096-bit RSA minimum
- Connection timeouts: 30 seconds
- Command timeouts: configurable per command
- Failed connection logging
- SSH fingerprint verification

### 12. AI Safety

- **Prompt Injection Protection**:
  - User input sanitization before Claude API
  - System prompt isolation
  - Output validation

- **Jailbreak Prevention**:
  - Consistent system prompts
  - Output format enforcement
  - Command validation before execution

- **Token Limit**: Enforce max tokens to prevent DoS

## Incident Response

### Reporting Security Issues

**DO NOT** create public issues for security vulnerabilities.

Email: security@aisystant.dev

Include:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if applicable)

### Vulnerability Disclosure Timeline

1. **Day 1**: Acknowledgment of report
2. **Day 3-7**: Initial assessment and fix plan
3. **Day 14-30**: Patch development and testing
4. **Publication**: CVE request and public disclosure after patch

## Compliance

### Standards Implemented

- **OWASP Top 10**: Protection against all OWASP Top 10 vulnerabilities
- **NIST Cybersecurity Framework**: Risk management and response procedures
- **CIS Benchmarks**: System hardening recommendations

### Certifications

- [ ] SOC 2 Type II (In progress)
- [ ] GDPR Compliance (Personal data handling)
- [ ] HIPAA (If handling healthcare data)

## Security Checklist

### Development

- [ ] Input validation on all endpoints
- [ ] Output encoding for all user content
- [ ] HTTPS/WSS only
- [ ] SQL injection prevention (parameterized queries)
- [ ] CSRF tokens on state-changing operations
- [ ] Rate limiting implemented
- [ ] Error messages don't leak information
- [ ] Secrets not in code or logs
- [ ] Dependencies scanned for vulnerabilities
- [ ] Security headers configured

### Deployment

- [ ] TLS certificates valid and non-expired
- [ ] Strong JWT secret (256+ bits)
- [ ] Database credentials strong
- [ ] SSH keys encrypted
- [ ] Firewall rules configured
- [ ] Access logs enabled
- [ ] Backups encrypted
- [ ] Disaster recovery tested
- [ ] Security monitoring active
- [ ] Incident response plan in place

### Operational

- [ ] Security patches applied within 48 hours
- [ ] Dependencies updated regularly
- [ ] Access reviews quarterly
- [ ] Audit logs retained for 1+ year
- [ ] Penetration testing annually
- [ ] Security training for team
- [ ] Incident response drills quarterly
- [ ] Backup restoration tested monthly

## Password Policy

- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, special characters
- No common patterns or dictionary words
- No password reuse (last 5)
- Expiration every 90 days (admin accounts)

## API Security

### Token Security

- Tokens expire in 24 hours
- Refresh tokens expire in 30 days
- Tokens signed with strong secret
- Token blacklisting on logout
- Rate limiting on token generation

### API Request Signing (Optional)

For additional security, sign API requests:

```typescript
const crypto = require('crypto');

function signRequest(method, path, body, secret) {
  const message = `${method}|${path}|${body}`;
  return crypto.createHmac('sha256', secret)
    .update(message)
    .digest('hex');
}
```

## Third-Party Security

### Anthropic API

- API keys stored securely (not in logs)
- Requests over HTTPS
- Sensitive data not sent to API
- Usage monitored and rate limited

### SSH Servers

- SSH key verification
- Known hosts file validation
- Timeout on connections
- Audit logging of all SSH activity

## Dependency Security

### Vulnerability Scanning

```bash
# Check for vulnerabilities
npm audit
npm audit fix

# Use Snyk
snyk test

# Use OWASP dependency check
dependency-check --scan .
```

### Dependency Updates

- Critical: Update within 24 hours
- High: Update within 1 week
- Medium: Update within 2 weeks
- Low: Update within 1 month

## Security Testing

### Automated Testing

```bash
# Run security tests
npm run test:security

# Static analysis
npm run lint

# Type checking
tsc --noEmit

# SAST scanning
sonarqube-scanner
```

### Manual Testing

- [ ] SQL injection attempts
- [ ] XSS payload testing
- [ ] CSRF token validation
- [ ] Session hijacking attempts
- [ ] Privilege escalation attempts
- [ ] Rate limit enforcement
- [ ] Input validation bypass attempts

## Data Retention

- **Audit Logs**: 1 year minimum
- **Command History**: 90 days
- **Chat History**: Configurable (default 30 days)
- **Failed Logins**: 30 days
- **Backups**: 30 days (encrypted)

## Security Roadmap

- [ ] Hardware security key support (WebAuthn)
- [ ] OAuth2/OpenID Connect integration
- [ ] Advanced threat detection
- [ ] Machine learning for anomaly detection
- [ ] Zero-trust architecture
- [ ] Advanced encryption (end-to-end)

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Guidelines](https://csrc.nist.gov/)
- [CIS Benchmarks](https://www.cisecurity.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
