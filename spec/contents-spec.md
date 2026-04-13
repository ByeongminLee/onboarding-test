# Contents Specification

## Overview

This specification document outlines the comprehensive onboarding contents for new developers joining the team. It covers account setup, environment configuration, development processes, communication standards, code architecture, infrastructure, and operational procedures.

---

## Part 1. Account Check

### Purpose

Ensure all new team members have proper access to necessary tools and platforms required for development work.

### Required Accounts

The following accounts must be set up and invitations accepted:

| Account | Purpose |
|---------|---------|
| GitHub | Version control, code repository, code review |
| Notion | Documentation, project wiki, knowledge base |
| Discord | Team communication, real-time discussions |
| Google Calendar | Schedule management, meeting coordination |

### UI Requirements

- Implement a **Checkbox component** interface for account verification
- Each account should have a corresponding checkbox to confirm invitation acceptance
- Users mark each checkbox as they complete the account setup process
- Provides visual confirmation of onboarding progress

---

## Part 2. Environment Setup

### Scope

This section covers the complete development environment setup including Docker, Python backend, and frontend test environment. While primarily targeted at backend developers, frontend setup instructions are included for comprehensive understanding and cross-functional development capability.

### Development Environment

#### Backend Setup

The backend development environment requires the following components:

| Component | Purpose |
|-----------|---------|
| Docker | Containerization for local development |
| Python | Primary backend programming language |
| Redis | Caching and session management |
| PostgreSQL | Primary database |

**Configuration Details:**
- Environment variables (`.env`) setup required
- All services run locally via Docker Compose
- Detailed installation procedures for each component

#### Frontend Setup

The frontend development environment setup process:

| Component | Purpose |
|-----------|---------|
| Node.js | JavaScript runtime |
| pnpm | Package manager (faster, more efficient than npm) |

**Setup Steps:**
1. Configure environment variables (`.env`)
2. Run `pnpm bootstrap` - installs all dependencies and sets up the development environment
3. Execute `pnpm dev` to start the development server
4. Access application at `http://localhost:3000`

**Note:** The `pnpm bootstrap` command handles complete Node.js setup automatically.

### Deployment Environment

#### Backend Deployment Strategy

| Environment | Database Strategy | Rationale |
|-------------|-------------------|-----------|
| Development (dev) | Local Docker | Development and testing |
| Staging (stg) | Local installation | Cost optimization |
| Production (prod) | Cloud database | Scalability and reliability |

**Cost Considerations:**
- Cloud database service costs approximately 200,000 KRW monthly
- Staging environment uses local database to minimize operational costs
- Production environment prioritizes reliability and scalability

#### Frontend Deployment Strategy

| Environment | Deployment Characteristics |
|-------------|---------------------------|
| Staging (stg) | Nearly identical to production configuration |
| Production (prod) | Optimized for performance and reliability |

**Note:** Frontend deployment remains consistent across staging and production environments to ensure parity.

### Test Environment

#### Authentication Testing Patterns

For development and staging environments, special authentication patterns are supported:

| Authentication Type | Test Pattern | Verification Code |
|---------------------|--------------|-------------------|
| Email | `test+{N}@foodlogic.co.kr` | `01234` (fixed) |
| SMS | `01012341234` | `01234` (fixed) |

**Usage:**
- Any email address matching `test+*@foodlogic.co.kr` pattern receives a fixed verification code
- The specific phone number `01012341234` receives a fixed verification code via SMS
- Enables consistent testing without external dependencies

---

## Part 3. Development Process

### Full Development Lifecycle

The complete development process encompasses all stages from initial planning to final deployment:

```
Planning → Development → Code Review → QA Testing → Deployment
```

#### Process Stages

| Stage | Description |
|-------|-------------|
| Planning | Requirements gathering, feature specification, task breakdown |
| Development | Implementation, unit testing, self-review |
| Code Review | Peer review, feedback incorporation, approval |
| QA Testing | Quality assurance testing, bug reporting, verification |
| Deployment | Release to production, monitoring, rollback planning |

### Developer Collaboration Process

Internal developer-to-developer workflows and best practices for effective collaboration:

- Code review procedures and standards
- Task assignment and handoff protocols
- Knowledge sharing mechanisms
- Pair programming guidelines (if applicable)

---

## Part 4. Development Communication & Documentation

### API Documentation

#### Historical Documentation

- **Platform:** Notion
- **Format:** Traditional documentation pages
- **Status:** Legacy documentation system

#### Current Documentation System

- **Platform:** Markdown files
- **Access Endpoint:** `http://localhost:8000/llms.txt`
- **Generation Method:** AI-powered automatic documentation generation
- **Advantages:**
  - Version control integration
  - Machine-readable format for AI assistants
  - Easier maintenance and updates

### Branch Strategy

The team follows a strict branch management and deployment sequence:

```
dev → stg → prod
```

#### Branch Environments

| Branch | Environment | Purpose |
|--------|-------------|---------|
| `dev` | Development | Active development, feature integration |
| `stg` | Staging | Pre-production testing, quality assurance |
| `prod` | Production | Live production environment |

#### Deployment Flow

1. Features are developed in feature branches from `dev`
2. Completed features merge into `dev` branch
3. `dev` is promoted to `stg` for testing
4. After QA approval, `stg` promotes to `prod`
5. Each environment corresponds to a deployed instance

---

## Part 5. Code - Application Layer

### Core Business Logic

Essential business logic components that drive the application's primary functionality.

### Payment & Plans

Payment processing, subscription management, and plan-related features.

### Additional Features

Other application-level components and modules not covered in the core sections above.

---

## Part 6. Cloud Infrastructure

### Current Cloud Services

List of cloud services currently in use:

| Service | Purpose | Notes |
|---------|---------|-------|
| **AWS (Amazon Web Services)** | Primary cloud provider | us-east-1 region |
| **Amazon EC2** | Application servers | 3 instances (dev, stg, prod) |
| **Amazon RDS (PostgreSQL)** | Production database | Multi-AZ deployment |
| **Amazon ElastiCache (Redis)** | Caching and session | 1 node (stg), 2 nodes (prod) |
| **Amazon S3** | File storage and static assets | Lifecycle: 30 days to Glacier |
| **AWS CloudFront** | CDN for static assets | Edge locations: 10+ |
| **GitHub Actions** | CI/CD pipeline | Self-hosted runners on EC2 |
| **Sentry** | Error tracking and monitoring | Free tier (up to 5K errors/month) |
| **Datadog** (optional) | APM and infrastructure monitoring | Trial period |

### Future Learning Requirements

Cloud technologies and services that developers should familiarize themselves with:

| Technology/Area | Priority | Resources |
|-----------------|----------|-----------|
| **AWS ECS/EKS** | Medium | Container orchestration for future migration |
| **AWS Lambda** | Low | Serverless patterns for specific use cases |
| **Terraform** | High | Infrastructure as Code (currently manual Console) |
| **Docker/Kubernetes** | High | Container fundamentals and orchestration |
| **AWS IAM best practices** | High | Security and access control |

---

## Part 7. CI/CD

### Continuous Integration

Automated processes for code integration, testing, and quality checks.

### Continuous Deployment

Automated deployment pipelines for staging and production environments.

### Pipeline Stages

| Stage | Actions |
|-------|---------|
| **Lint & Type Check** | ESLint, TypeScript type checking (runs on every PR) |
| **Unit Tests** | Jest/Vitest for backend, component tests for frontend |
| **Build** | Production build verification |
| **Deploy to Staging** | Automatic merge to `stg` branch triggers deployment |
| **Manual Approval** | Production deployment requires team lead approval |
| **Deploy to Production** | Thursday regular deployments (hotfixes anytime) |

### Deployment Commands

```bash
# Backend deployment
./scripts/deploy.sh [stg|prod]

# Frontend deployment (Vercel CLI)
vercel --prod
```

### Rollback Procedure

1. Identify broken commit SHA
2. Revert commit or deploy previous stable version
3. Run database migrations if needed
4. Verify health checks

---

## Part 8. Monitoring & Data Analytics

### Customer Support Developer Responsibilities

Development support requirements for CS operations:

- Technical issue investigation for customer tickets
- Log analysis for troubleshooting
- Hotfix procedures for critical issues
- CS tool integration and data access

### Application Logging

Logging practices at the application layer:

| Log Type | Purpose | Storage/Retention |
|----------|---------|-------------------|
| Error Logs | Exception tracking | Sentry (30 days) + CloudWatch (7 days) |
| Access Logs | Request tracking | CloudWatch Logs (7 days) |
| Business Logs | Business event tracking | Custom S3 bucket (90 days) |

### Analytics Logging

Data collection for business intelligence and user behavior analysis:

**Primary Implementation:** Frontend

| Metric Type | Description | Use Case |
|-------------|-------------|----------|
| User Events | User interactions | Product optimization |
| Page Views | Traffic analysis | Content strategy |
| Conversion | Funnel tracking | Growth optimization |
| Performance | Load times, errors | UX improvement |

---

## Part 9. Outstanding Issues & Future Considerations

### Known Issues

Current problems requiring resolution:

| Issue | Priority | Owner | Status |
|-------|----------|-------|--------|
| Legacy API response time (>2s) | P1 | Backend Team | In Progress |
| Mobile Safari layout bug on checkout | P2 | Frontend Team | Open |
| Staging database auto-backup not configured | P1 | DevOps | Open |
| Frontend bundle size exceeds 500KB | P2 | Frontend Team | Open |

### Technical Debt

Areas requiring refactoring or improvement:

| Area | Description | Impact |
|------|-------------|--------|
| Monolithic user service | Single file handles auth, profile, preferences; needs splitting | High |
| No integration tests | API endpoints lack E2E test coverage | High |
| CSS-in-JS performance | Emotion CSS parsing causes initial render delay | Medium |
| Hardcoded configuration | Environment variables scattered across files | Medium |

### Strategic Considerations

Topics requiring team discussion and decision-making:

| Topic | Background | Options | Recommendation |
|-------|------------|---------|----------------|
| State management migration | Current zustand setup is simple but may not scale | A: Keep zustand, B: Migrate to Redux Toolkit, C: Try Jotai | A (keep simple) for now |
| Real-time features | Product team wants live collaboration | A: WebSocket, B: Server-Sent Events, C: Polling | A (WebSocket) for bidirectional |
| Microservices vs Monolith | Team growing to 10+ developers | A: Extract services gradually, B: Big bang rewrite | A (gradual extraction) |

---

## Appendix

### Additional Resources

- [Company Wiki/Notion]
- [Team Discord Channels]
- [Code Repository Links]
- [Internal Tools Dashboard]

### Document Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | [Current date] | [Author] | Initial specification |
