# Panopticon Engine Deployment Guide

## Prerequisites

- Node.js 18.17 or later
- PostgreSQL 14 or later (or Supabase account)
- Docker and Docker Compose (for containerized deployment)
- Minimum 2GB RAM, 2 CPU cores
- 10GB disk space (for logs and database)

## Environment Configuration

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Configure Required Variables

Edit `.env` and set the following:

**Database** (choose one):
```bash
# Option 1: Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Option 2: PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/panopticon_engine
```

**Security**:
```bash
JWT_SECRET=generate-a-strong-random-secret-here
```

**Notifications** (optional):
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

## Deployment Options

### Option 1: Docker Compose (Recommended)

#### 1. Build and Start Services

```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

#### 2. Initialize Database

```bash
# Connect to PostgreSQL container
docker-compose exec postgres psql -U panopticon panopticon_engine

# Or run migration from host
docker-compose exec postgres psql -U panopticon -d panopticon_engine -f /docker-entrypoint-initdb.d/20260305_add_panopticon_engine_tables.sql
```

#### 3. Verify Deployment

```bash
# Check service health
curl http://localhost:3001/health

# Expected response:
# {"status":"healthy","timestamp":"2026-03-05T...","version":"0.1.0"}
```

#### 4. Manage Services

```bash
# Stop services
docker-compose stop

# Restart services
docker-compose restart

# View service status
docker-compose ps

# Scale background workers
docker-compose up -d --scale scheduler=2
```

### Option 2: Manual Deployment

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Set Up Database

```bash
# Create database
createdb panopticon_engine

# Run migration
psql panopticon_engine -f migrations/20260305_add_panopticon_engine_tables.sql
```

#### 3. Build Application

```bash
# Build Next.js frontend
npm run build

# Build backend server
npm run server:build
```

#### 4. Start Services

```bash
# Start API server
npm run server:start &

# Start background jobs
npm run jobs:start &

# Start Next.js frontend (optional)
npm start &
```

### Option 3: Production Deployment (PM2)

#### 1. Install PM2

```bash
npm install -g pm2
```

#### 2. Create PM2 Ecosystem File

`ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'panopticon-api',
      script: 'dist/api/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'panopticon-jobs',
      script: 'dist/jobs/JobScheduler.js',
      instances: 1,
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'panopticon-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
```

#### 3. Start with PM2

```bash
# Start all services
pm2 start ecosystem.config.js

# View status
pm2 status

# View logs
pm2 logs

# Monitor
pm2 monit

# Setup startup script
pm2 startup
pm2 save
```

## Cloud Deployment

### AWS

#### 1. EC2 Instance

```bash
# Launch Ubuntu 22.04 instance
# t3.medium or larger recommended

# Install dependencies
sudo apt update
sudo apt install -y nodejs npm postgresql-client docker.io docker-compose

# Clone repository
git clone https://github.com/iacosta3994/panopticon-engine.git
cd panopticon-engine

# Deploy using Docker Compose
docker-compose up -d
```

#### 2. RDS for Database

- Create PostgreSQL RDS instance
- Configure security groups
- Update `DATABASE_URL` in `.env`
- Run migrations

#### 3. Load Balancer

- Create Application Load Balancer
- Configure target groups for port 3001 (API) and 3000 (Frontend)
- Set up health checks: `/health`

### Google Cloud Platform

#### 1. Cloud Run (Serverless)

```bash
# Build container
gcloud builds submit --tag gcr.io/PROJECT_ID/panopticon-engine

# Deploy
gcloud run deploy panopticon-engine \
  --image gcr.io/PROJECT_ID/panopticon-engine \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="$(cat .env | xargs)"
```

#### 2. Cloud SQL

- Create PostgreSQL Cloud SQL instance
- Enable Cloud SQL Proxy
- Connect and run migrations

### Azure

#### 1. Container Instances

```bash
# Create resource group
az group create --name panopticon-rg --location eastus

# Create container
az container create \
  --resource-group panopticon-rg \
  --name panopticon-engine \
  --image iacosta3994/panopticon-engine \
  --dns-name-label panopticon \
  --ports 3000 3001
```

#### 2. Azure Database for PostgreSQL

- Create Flexible Server
- Configure firewall rules
- Update connection string

## Monitoring and Logging

### 1. Application Logs

```bash
# View API logs
tail -f logs/panopticon-error.log
tail -f logs/panopticon.log

# With Docker
docker-compose logs -f app
```

### 2. Health Checks

```bash
# API health
curl http://localhost:3001/health

# Database connectivity
curl http://localhost:3001/api/admin/stats
```

### 3. Metrics Collection

**Prometheus Integration**:

Add to `docker-compose.yml`:
```yaml
prometheus:
  image: prom/prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
```

**Grafana Dashboard**:
```yaml
grafana:
  image: grafana/grafana
  ports:
    - "3002:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
```

### 4. Error Tracking

Integrate Sentry:

```bash
npm install @sentry/node
```

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## Security Considerations

### 1. Environment Variables

- Never commit `.env` files
- Use secrets management:
  - AWS Secrets Manager
  - GCP Secret Manager
  - Azure Key Vault
  - HashiCorp Vault

### 2. Database Security

```sql
-- Create read-only user
CREATE USER panopticon_readonly WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE panopticon_engine TO panopticon_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO panopticon_readonly;

-- Enable SSL
ALTER SYSTEM SET ssl = on;
```

### 3. Network Security

- Use HTTPS/TLS in production
- Configure firewall rules
- Implement rate limiting (already included)
- Use VPC/private networks

### 4. Authentication

```bash
# Generate JWT secret
openssl rand -base64 64
```

Update JWT configuration in `.env`.

## Backup and Recovery

### 1. Database Backups

```bash
# Manual backup
pg_dump panopticon_engine > backup_$(date +%Y%m%d).sql

# Automated daily backups
crontab -e
# Add: 0 2 * * * pg_dump panopticon_engine > /backups/backup_$(date +\%Y\%m\%d).sql
```

### 2. Restore from Backup

```bash
psql panopticon_engine < backup_20260305.sql
```

### 3. Disaster Recovery

- Configure automated backups (RDS, Cloud SQL)
- Test restore procedures monthly
- Document recovery process
- Set up monitoring alerts

## Performance Tuning

### 1. Database Optimization

```sql
-- Vacuum and analyze
VACUUM ANALYZE;

-- Reindex
REINDEX DATABASE panopticon_engine;

-- Update statistics
ANALYZE;
```

### 2. Connection Pooling

Install PgBouncer:
```bash
sudo apt install pgbouncer
```

Configure `/etc/pgbouncer/pgbouncer.ini`:
```ini
[databases]
panopticon_engine = host=localhost dbname=panopticon_engine

[pgbouncer]
pool_mode = transaction
max_client_conn = 100
default_pool_size = 20
```

### 3. Caching

Add Redis:
```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
```

### 4. Horizontal Scaling

- Multiple API instances behind load balancer
- Read replicas for database
- Message queue for background jobs (RabbitMQ, Redis)

## Troubleshooting

### Common Issues

**1. Database Connection Failed**
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql panopticon_engine
```

**2. High Memory Usage**
```bash
# Check Node.js memory
node --max-old-space-size=4096 dist/api/server.js
```

**3. API Not Responding**
```bash
# Check process
ps aux | grep node

# Check ports
netstat -tulpn | grep :3001
```

**4. Jobs Not Running**
```bash
# Check scheduler logs
tail -f logs/panopticon.log | grep "Job"
```

## Maintenance

### Regular Tasks

**Daily**:
- Monitor error logs
- Check alert counts
- Verify backups completed

**Weekly**:
- Review system stats
- Cleanup old data
- Update dependencies

**Monthly**:
- Test disaster recovery
- Optimize database
- Review security patches

## Support

For issues and questions:
- GitHub Issues: https://github.com/iacosta3994/panopticon-engine/issues
- Documentation: https://github.com/iacosta3994/panopticon-engine/tree/main/docs
