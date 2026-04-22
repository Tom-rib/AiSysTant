# Deployment Guide

## Prerequisites

- Docker & Docker Compose
- PostgreSQL 14+
- Node.js 20+ (for development builds)
- SSH access to deployment server
- Anthropic API key

## Environment Setup

### 1. Production Environment File

Create `backend/.env.production`:

```bash
# API Configuration
NODE_ENV=production
BACKEND_PORT=3001
BACKEND_URL=https://api.yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@postgres-host:5432/aisystant_prod
DATABASE_POOL_SIZE=20

# Authentication
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRATION=86400

# AI Configuration
ANTHROPIC_API_KEY=sk-xxx...
ANTHROPIC_MODEL=claude-sonnet-4-20250514

# Security
ADMIN_PORT=3002
CORS_ORIGIN=https://yourdomain.com
HTTPS_ONLY=true

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/aisystant/app.log

# SSH
SSH_DEFAULT_PORT=22
SSH_TIMEOUT=30000
SSH_KEY_PATH=/etc/aisystant/ssh/id_rsa
```

Create `frontend/.env.production`:

```bash
VITE_API_URL=https://api.yourdomain.com
VITE_ENV=production
```

### 2. Database Migration

```bash
# From host machine with docker-compose running
docker-compose exec backend npm run migrate

# Or manually with psql
psql postgresql://user:password@localhost:5432/aisystant < migrations/001_initial.sql
```

## Docker Deployment

### Option 1: Docker Compose (Simple)

```bash
# 1. Build images
docker-compose build

# 2. Start services
docker-compose up -d

# 3. Verify
docker-compose ps
docker-compose logs -f backend

# 4. Stop
docker-compose down
```

### Option 2: Docker Swarm (Intermediate)

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml aisystant

# Check deployment
docker stack ps aisystant
docker service logs aisystant_backend

# Remove stack
docker stack rm aisystant
```

### Option 3: Kubernetes (Advanced)

See `k8s/` directory for Kubernetes manifests.

```bash
# Deploy
kubectl apply -f k8s/

# Check status
kubectl get pods -n aisystant
kubectl logs -f deployment/aisystant-backend -n aisystant

# Remove
kubectl delete namespace aisystant
```

## Reverse Proxy Configuration

### Nginx Configuration

```nginx
upstream backend {
    server backend:3001;
    keepalive 32;
}

upstream admin {
    server backend:3002;
    keepalive 32;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/ssl/certs/yourdomain.com.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.com.key;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    
    # API reverse proxy
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }
    
    # WebSocket reverse proxy
    location /socket.io/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # Admin panel (restricted to admin IPs)
    location /admin/ {
        allow 10.0.0.0/8;           # Internal network
        allow 203.0.113.0;           # Your office IP
        deny all;
        
        proxy_pass http://admin;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Frontend (React app)
    location / {
        proxy_pass http://backend;
        root /usr/share/nginx/html;
        try_files $uri /index.html;
    }
}
```

### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</VirtualHost>

<VirtualHost *:443>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/yourdomain.com.crt
    SSLCertificateKeyFile /etc/ssl/private/yourdomain.com.key
    
    # Security headers
    Header always set Strict-Transport-Security "max-age=31536000"
    Header always set X-Content-Type-Options "nosniff"
    
    # Enable modules
    a2enmod proxy
    a2enmod proxy_http
    a2enmod proxy_wstunnel
    
    # API proxy
    ProxyPass /api/ http://localhost:3001/
    ProxyPassReverse /api/ http://localhost:3001/
    
    # WebSocket
    ProxyPass /socket.io/ ws://localhost:3001/socket.io/
    
    # Frontend
    DocumentRoot /var/www/aisystant/frontend/dist
    <Directory /var/www/aisystant/frontend/dist>
        FallbackResource /index.html
    </Directory>
</VirtualHost>
```

## SSL/TLS Certificate

### Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run

# Restart nginx
sudo systemctl restart nginx
```

## Health Checks

### Application Health Endpoint

```bash
curl http://localhost:3001/health
# Response: { "status": "healthy", "uptime": 3600 }
```

### Database Health

```bash
# Test connection
docker-compose exec postgres psql -U aisystant -d aisystant_prod -c "SELECT 1;"
```

### API Monitoring

```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001/api/stats

# Monitor logs
docker-compose logs -f --tail=100 backend
```

## Backup Strategy

### Database Backups

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec postgres pg_dump -U aisystant aisystant_prod > \
    /backup/aisystant_$DATE.sql

# Keep last 30 days
find /backup -name "aisystant_*.sql" -mtime +30 -delete
```

### Automated Backup

```bash
# Add to crontab
0 2 * * * /usr/local/bin/backup-aisystant.sh >> /var/log/aisystant-backup.log 2>&1
```

### SSH Keys Backup

```bash
# Backup SSH keys
tar czf /backup/ssh-keys-$DATE.tar.gz /etc/aisystant/ssh/

# Keep encrypted
gpg --symmetric /backup/ssh-keys-$DATE.tar.gz
```

## Monitoring & Logging

### Prometheus Metrics

Add to `backend/src/config/prometheus.ts`:

```typescript
import { register, Counter, Gauge, Histogram } from 'prom-client';

const httpRequests = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const dbQueryTime = new Histogram({
  name: 'db_query_duration_ms',
  help: 'Database query duration',
  buckets: [10, 50, 100, 500, 1000]
});
```

### ELK Stack (Elasticsearch, Logstash, Kibana)

Send logs to Elasticsearch for analysis:

```yaml
# docker-compose.yml addition
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
  environment:
    - discovery.type=single-node

logstash:
  image: docker.elastic.co/logstash/logstash:8.0.0
  volumes:
    - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf

kibana:
  image: docker.elastic.co/kibana/kibana:8.0.0
```

## Scaling

### Horizontal Scaling

```bash
# Scale backend to 3 instances
docker-compose up -d --scale backend=3

# Or with docker stack
docker service scale aisystant_backend=3
```

### Load Balancing

Use nginx or HAProxy for load distribution:

```nginx
upstream backend_pool {
    least_conn;  # Load balancing algorithm
    server backend1:3001;
    server backend2:3001;
    server backend3:3001;
}
```

## Disaster Recovery

### RTO/RPO Goals
- RTO (Recovery Time Objective): 1 hour
- RPO (Recovery Point Objective): 15 minutes

### Recovery Procedures

1. **Database Recovery**: Restore from latest backup
2. **Configuration Recovery**: Restore from config backup
3. **SSH Keys Recovery**: Restore from encrypted backup
4. **Application Recovery**: Redeploy from git + docker

## Security Hardening

### System Level

```bash
# Update system
sudo apt-get update && apt-get upgrade -y

# Configure firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable

# Disable SSH root login
sudo sed -i 's/^PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Limit SSH access
echo "AllowUsers deploy" | sudo tee -a /etc/ssh/sshd_config
```

### Application Level

- Use strong JWT secrets (256+ bits)
- Enable HTTPS only
- Set secure cookie flags
- Use CSRF protection
- Implement rate limiting
- Enable audit logging

## Post-Deployment Checklist

- [ ] Verify database migrations ran
- [ ] Check API endpoints are responding
- [ ] Test WebSocket connections
- [ ] Verify authentication works
- [ ] Test SSH command execution
- [ ] Monitor error logs
- [ ] Set up backups
- [ ] Configure monitoring
- [ ] Test disaster recovery
- [ ] Document runbook
