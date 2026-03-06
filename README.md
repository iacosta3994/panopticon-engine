# Panopticon Engine

> A vigilance system that combines monitoring with meaning extraction - the foundation for intelligent surveillance and analysis.

## 🚀 Overview

Panopticon Engine is a modern, intelligent surveillance and analysis platform built with Next.js 14, TypeScript, and Tailwind CSS. It provides real-time monitoring, deep analysis, and proactive vigilance capabilities for comprehensive data awareness.

## ✨ Features

- **Real-Time Monitoring**: Continuous surveillance across multiple data streams with millisecond precision
- **Deep Analysis**: Advanced algorithms that extract meaningful insights from raw data
- **Proactive Vigilance**: Smart alerting system that learns your priorities and filters critical events
- **Modern UI**: Dark-themed, responsive interface built with Tailwind CSS
- **Type-Safe**: Full TypeScript support for robust development
- **Performance Optimized**: Built on Next.js 14 App Router for optimal performance
- **Knowledge Graph Integration**: Track entities and relationships discovered through surveillance
- **Pattern Detection**: Automatically identify recurring patterns and anomalies

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Font**: [Inter](https://fonts.google.com/specimen/Inter) from Google Fonts

### Database
- **Database**: PostgreSQL 14+
- **Schema**: Comprehensive surveillance and analysis schema
- **Features**: JSONB for flexibility, GIN indexes for performance, time-series optimization

## 📦 Installation

### Prerequisites

- Node.js 18.17 or later
- PostgreSQL 14 or later
- npm, yarn, or pnpm package manager

### Frontend Setup

1. Clone the repository:

```bash
git clone https://github.com/iacosta3994/panopticon-engine.git
cd panopticon-engine
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Database Setup

1. Create a PostgreSQL database:

```bash
createdb panopticon_engine
```

2. Run the migration:

```bash
psql -h localhost -U your_user -d panopticon_engine -f migrations/20260305_add_panopticon_engine_tables.sql
```

3. Verify the installation:

```sql
-- Connect to the database
psql panopticon_engine

-- Check tables were created
\dt

-- Check views
\dv

-- Verify example data
SELECT name, source_type FROM data_sources;
```

For detailed migration instructions, see [`migrations/README.md`](migrations/README.md).

## 🏗️ Project Structure

```
panopticon-engine/
├── app/
│   ├── layout.tsx      # Root layout component
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles with Tailwind imports
├── database/
│   ├── schema.md       # Comprehensive database schema documentation
│   └── queries.sql     # Example queries and query patterns
├── migrations/
│   ├── README.md       # Migration guide and documentation
│   └── 20260305_add_panopticon_engine_tables.sql  # Initial schema
├── public/             # Static assets
├── .gitignore          # Git ignore rules
├── next.config.js      # Next.js configuration
├── package.json        # Dependencies and scripts
├── postcss.config.js   # PostCSS configuration
├── tailwind.config.ts  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```

## 📊 Database Schema

The Panopticon Engine uses a sophisticated PostgreSQL schema designed for:

### Core Surveillance
- **Data Sources**: Registry of monitored sources (APIs, databases, streams, files, sensors)
- **Observations**: Raw events and data points captured from sources
- **Monitoring Rules**: Define surveillance rules, thresholds, and patterns
- **Alerts**: Triggered events when rules detect issues

### Analysis & Intelligence
- **Patterns**: Detected patterns in observation data
- **Insights**: High-level intelligence extracted from observations
- **Analysis Jobs**: Track pattern detection, anomaly detection, and correlation tasks

### Knowledge Graph
- **Entities**: Track discovered entities (users, services, hosts, resources)
- **Entity Relationships**: Map dependencies and connections between entities
- **Entity Observations**: Link entities to observations for context

### Metrics & Monitoring
- **Metrics**: Time-series metrics storage (counters, gauges, histograms)
- **Metric Aggregations**: Pre-computed statistical aggregations

### System Management
- **Audit Log**: Complete audit trail of all system actions
- **System Health**: Track Panopticon Engine's own health and performance

For detailed schema documentation, see [`database/schema.md`](database/schema.md).

## 🔍 Key Features

### 1. Real-Time Observation Capture

```sql
-- Insert a new observation
INSERT INTO observations (source_id, observation_type, severity, payload, tags)
VALUES (
    'source-uuid',
    'api_error',
    'high',
    '{"error_code": "500", "endpoint": "/api/users"}',
    ARRAY['error', 'api', 'database']
);
```

### 2. Pattern Detection

The system automatically detects patterns in observations:
- **Sequential patterns**: Time-ordered event sequences
- **Frequency patterns**: Recurring events at specific intervals
- **Correlation patterns**: Related events across sources
- **Anomaly patterns**: Deviations from normal behavior

### 3. Knowledge Graph Building

Entities and relationships are automatically extracted:

```sql
-- Find service dependencies
SELECT 
    source.identifier as service,
    target.identifier as depends_on,
    er.properties->>'protocol' as protocol
FROM entity_relationships er
JOIN entities source ON er.source_entity_id = source.id
JOIN entities target ON er.target_entity_id = target.id
WHERE er.relationship_type = 'depends_on';
```

### 4. Intelligent Insights

The system generates actionable insights:
- **Trends**: Pattern changes over time
- **Anomalies**: Unusual behavior detection
- **Predictions**: Future state forecasting
- **Recommendations**: Actionable advice

## 🚀 Deployment

### Vercel (Frontend)

The easiest way to deploy the Next.js frontend:

1. Push your code to GitHub
2. Import your repository to [Vercel](https://vercel.com)
3. Vercel will automatically detect Next.js and deploy
4. Configure environment variables for database connection

### Database Deployment

#### Managed PostgreSQL
- **AWS RDS**: PostgreSQL 14+ with appropriate instance size
- **Google Cloud SQL**: PostgreSQL with automatic backups
- **Azure Database**: PostgreSQL flexible server
- **Supabase**: Managed PostgreSQL with additional features

#### Performance Recommendations
- Enable connection pooling (PgBouncer)
- Configure appropriate shared_buffers (25% of RAM)
- Set effective_cache_size (50-75% of RAM)
- Enable query plan caching
- Consider read replicas for high-volume queries

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

## 🎨 Customization

### Styling

The project uses Tailwind CSS. Customize the theme in `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      // Add your custom colors
    },
    animation: {
      // Add custom animations
    },
  },
}
```

### Database Schema

Extend the schema by creating new migration files in `migrations/`:

```sql
-- migrations/20260306_add_custom_tables.sql
CREATE TABLE custom_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- your columns
);
```

## 📚 Documentation

- [Database Schema Documentation](database/schema.md) - Comprehensive schema guide
- [Example Queries](database/queries.sql) - Common query patterns
- [Migration Guide](migrations/README.md) - How to run and create migrations

## 🔐 Security

### Row-Level Security

The schema supports PostgreSQL row-level security:

```sql
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY team_isolation ON observations
FOR SELECT
USING (metadata->>'team' = current_setting('app.current_team'));
```

### Audit Trail

All significant operations are logged to the `audit_log` table for compliance and forensic analysis.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Panopticon Engine** - Seeing everything, understanding everything.
