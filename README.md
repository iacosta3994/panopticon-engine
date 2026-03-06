# Panopticon Engine

> A vigilance system that combines monitoring with meaning extraction - the foundation for intelligent surveillance and analysis.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.17-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)

## 🚀 Overview

Panopticon Engine is a production-ready, intelligent surveillance and analysis platform that combines real-time monitoring with advanced pattern recognition and meaning extraction. Built with Next.js 14, TypeScript, and PostgreSQL, it provides comprehensive observability and actionable insights from multiple data sources.

## ✨ Key Features

### Vigilance Layer
- **Multi-Source Monitoring**: Continuous surveillance across APIs, databases, streams, files, and sensors
- **Anomaly Detection**: Statistical anomaly detection using Z-score, IQR, and moving average methods
- **Smart Thresholds**: Dynamic threshold management with auto-adjustment
- **Intelligent Intervention**: Automated decision logic for when and how to intervene
- **Real-Time Alerts**: Configurable alerting with multiple notification channels

### Meaning Extraction
- **Temporal Analysis**: Time-series pattern analysis and forecasting
- **Relationship Mapping**: Automatic entity relationship discovery and graph construction
- **Sentiment Analysis**: Text sentiment and emotional context extraction
- **Pattern Synthesis**: Cross-pattern correlation and sequential pattern detection
- **Predictive Insights**: Trend analysis with confidence intervals

### Integration & APIs
- **RESTful API**: Comprehensive API for ingestion, analysis, and administration
- **Webhook Support**: GitHub, Slack, and generic webhook receivers
- **Background Jobs**: Scheduled scanning, pattern analysis, notifications, and maintenance
- **Real-Time Processing**: Sub-second observation processing
- **Scalable Architecture**: Horizontal scaling with load balancing support

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript 5.4](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **UI**: Dark-themed, responsive interface

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 4.18
- **Database**: PostgreSQL 14+ (or Supabase)
- **Job Scheduling**: node-cron
- **Logging**: Winston

### Analysis & Intelligence
- **Statistics**: simple-statistics
- **Sentiment**: Sentiment.js
- **Pattern Detection**: Custom algorithms
- **Time-Series**: Linear regression, forecasting

## 📦 Installation

### Prerequisites

```bash
# Required
- Node.js 18.17 or later
- PostgreSQL 14+ (or Supabase account)
- npm/yarn/pnpm

# Optional
- Docker & Docker Compose
- Redis (for caching)
```

### Quick Start

1. **Clone the repository**:
```bash
git clone https://github.com/iacosta3994/panopticon-engine.git
cd panopticon-engine
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up database**:
```bash
# Create database
createdb panopticon_engine

# Run migration
psql panopticon_engine -f migrations/20260305_add_panopticon_engine_tables.sql
```

5. **Build the application**:
```bash
# Build frontend
npm run build

# Build backend
npm run server:build
```

6. **Start services**:
```bash
# Development mode
npm run dev          # Frontend (port 3000)
npm run server:dev   # API server (port 3001)

# Production mode
npm start            # Frontend
npm run server:start # API server
npm run jobs:start   # Background jobs
```

7. **Verify installation**:
```bash
curl http://localhost:3001/health
# Should return: {"status":"healthy","timestamp":"...","version":"0.1.0"}
```

### Docker Deployment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🏗️ Project Structure

```
panopticon-engine/
├── app/                    # Next.js frontend
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── src/
│   ├── api/               # Express API server
│   │   ├── server.ts      # Main server
│   │   ├── routes/        # API routes
│   │   │   ├── ingestion.ts
│   │   │   ├── analysis.ts
│   │   │   ├── webhooks.ts
│   │   │   └── admin.ts
│   │   └── middleware/    # Auth, validation, rate limiting
│   ├── vigilance/         # Monitoring & detection
│   │   ├── MonitoringService.ts
│   │   ├── AnomalyDetector.ts
│   │   ├── ThresholdManager.ts
│   │   ├── InterventionEngine.ts
│   │   └── DataSourceConnector.ts
│   ├── meaning/           # Analysis & extraction
│   │   ├── TemporalAnalyzer.ts
│   │   ├── RelationshipMapper.ts
│   │   ├── EmotionalContext.ts
│   │   └── PatternSynthesizer.ts
│   ├── jobs/              # Background processing
│   │   ├── JobScheduler.ts
│   │   ├── ScanningJob.ts
│   │   ├── PatternAnalysisJob.ts
│   │   ├── NotificationProcessor.ts
│   │   └── MaintenanceJob.ts
│   ├── lib/               # Core utilities
│   │   ├── config.ts
│   │   ├── logger.ts
│   │   ├── supabase.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   └── __tests__/         # Test suites
├── migrations/            # Database migrations
│   ├── README.md
│   └── 20260305_add_panopticon_engine_tables.sql
├── database/              # Schema documentation
│   ├── schema.md
│   └── queries.sql
├── docs/                  # Documentation
│   ├── API.md            # API reference
│   ├── ALGORITHMS.md     # Algorithm explanations
│   └── DEPLOYMENT.md     # Deployment guide
└── docker-compose.yml     # Docker configuration
```

## 📚 Documentation

- **[API Documentation](docs/API.md)** - Complete API reference with examples
- **[Algorithms](docs/ALGORITHMS.md)** - Detailed algorithm explanations
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Database Schema](database/schema.md)** - Comprehensive schema documentation
- **[Migration Guide](migrations/README.md)** - Database migration instructions

## 🔥 Usage Examples

### Ingest Observations

```typescript
import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Ingest single observation
await client.post('/ingest/observation', {
  observation_type: 'api_error',
  severity: 'high',
  payload: {
    error_code: 500,
    message: 'Database connection timeout',
    endpoint: '/api/users'
  },
  tags: ['error', 'database'],
});

// Ingest metrics
await client.post('/ingest/metric', {
  metric_name: 'api.response_time',
  value: 145.5,
  unit: 'ms',
  dimensions: {
    endpoint: '/api/users',
    method: 'GET'
  },
});
```

### Query Analysis

```typescript
// Get trend analysis
const trends = await client.get('/analysis/trends/api.response_time', {
  params: { timeRange: 'day' }
});

// Get active alerts
const alerts = await client.get('/analysis/alerts', {
  params: { status: 'open', severity: 'high' }
});

// Get patterns
const patterns = await client.get('/analysis/patterns');

// Get insights
const insights = await client.get('/analysis/insights', {
  params: { impact_level: 'critical' }
});
```

### Webhook Integration

```bash
# GitHub webhook
curl -X POST http://localhost:3001/api/webhooks/github \
  -H "X-GitHub-Event: push" \
  -d '{"repository": {"name": "my-repo"}}'

# Generic webhook
curl -X POST http://localhost:3001/api/webhooks/generic?source_name=monitoring \
  -H "Content-Type: application/json" \
  -d '{"event": "deployment", "status": "success"}'
```

## 📊 Database Schema

The Panopticon Engine uses a comprehensive PostgreSQL schema with:

- **Core Tables**: data_sources, observations, monitoring_rules, alerts
- **Analysis**: patterns, insights, analysis_jobs, entities
- **Metrics**: metrics, metric_aggregations
- **System**: audit_log, system_health

**Total**: 15+ tables, 50+ indexes, materialized views, triggers, and functions

See [database/schema.md](database/schema.md) for full documentation.

## 🎯 Core Capabilities

### 1. Real-Time Anomaly Detection

- Z-Score method (3σ threshold)
- Interquartile Range (IQR) outlier detection
- Moving average deviation detection
- Automatic baseline learning
- Confidence scoring

### 2. Pattern Recognition

- Sequential pattern detection
- Frequency-based patterns
- Correlation analysis
- Time-constrained patterns
- Pattern matching and scoring

### 3. Temporal Analysis

- Linear regression trending
- Forecasting with confidence intervals
- Seasonality detection (autocorrelation)
- Change point detection (T-test)
- Multi-period analysis

### 4. Entity Relationship Mapping

- Automatic entity extraction
- Relationship discovery
- Dependency graph construction
- Strength calculation
- Recursive traversal (configurable depth)

### 5. Sentiment & Context

- Text sentiment analysis
- Urgency detection
- Emotional tone classification
- Sentiment shift tracking
- Multi-text aggregation

## 🔒 Security Features

- JWT authentication
- Role-based access control (RBAC)
- Rate limiting (100 req/15min default)
- Helmet security headers
- CORS configuration
- Input validation (Zod)
- SQL injection prevention
- Audit logging

## 🚀 Performance

- **Observation Processing**: <100ms per observation
- **Pattern Matching**: <500ms for 1000 patterns
- **Trend Analysis**: <2s for 24h of data
- **Anomaly Detection**: <50ms per check
- **API Response**: <200ms average

## 📝 Available Scripts

```bash
# Development
npm run dev              # Next.js dev server
npm run server:dev       # API server (hot reload)

# Production
npm run build            # Build frontend
npm run server:build     # Build backend
npm start                # Start frontend
npm run server:start     # Start API
npm run jobs:start       # Start job scheduler

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Linting
npm run lint             # ESLint
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- AnomalyDetector
```

Coverage targets:
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## 🌐 Deployment Options

### Option 1: Docker Compose (Recommended)
```bash
docker-compose up -d
```

### Option 2: PM2 (Node.js Process Manager)
```bash
pm2 start ecosystem.config.js
```

### Option 3: Cloud Platforms
- **AWS**: EC2 + RDS + ALB
- **GCP**: Cloud Run + Cloud SQL
- **Azure**: Container Instances + Database for PostgreSQL
- **Vercel**: Frontend only

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## 🔧 Configuration

### Environment Variables

```bash
# Server
NODE_ENV=production
PORT=3001

# Database
SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=...
# OR
DATABASE_URL=postgresql://...

# Security
JWT_SECRET=your-secret

# Monitoring
SCAN_INTERVAL_MS=60000
ANOMALY_DETECTION_ENABLED=true
ANOMALY_THRESHOLD_SIGMA=3

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/...

# Features
ENABLE_SENTIMENT_ANALYSIS=true
ENABLE_RELATIONSHIP_MAPPING=true
ENABLE_TEMPORAL_FORECASTING=true
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [PostgreSQL](https://www.postgresql.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Statistical analysis using [simple-statistics](https://github.com/simple-statistics/simple-statistics)

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/iacosta3994/panopticon-engine/issues)
- **Documentation**: [docs/](docs/)
- **API Reference**: [docs/API.md](docs/API.md)

## 🗺️ Roadmap

- [ ] Machine learning integration for predictive analytics
- [ ] Real-time dashboard with WebSocket updates
- [ ] Custom visualization builder
- [ ] Multi-tenancy support
- [ ] Advanced correlation engine
- [ ] Distributed tracing integration
- [ ] Mobile application
- [ ] GraphQL API

---

**Panopticon Engine** - *Seeing everything, understanding everything.*

Built with ❤️ by [Ian Acosta](https://github.com/iacosta3994)
