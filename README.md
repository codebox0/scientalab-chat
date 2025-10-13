# 🔬 Scienta Lab Chat - Biomedical Research Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

> **Intelligent AI assistant for biomedical research** - Real-time access to scientific databases through natural conversation

## 🎯 Overview

Scienta Lab Chat is a revolutionary biomedical research assistant that enables researchers to query and analyze complex scientific data through natural language conversations. The application integrates advanced language models with real biomedical data sources to provide accurate and contextual responses.

### ✨ Key Features

- 🧠 **Advanced AI** - OpenAI GPT integration for intelligent analysis
- 🔬 **Real biomedical data** - Access to PubMed, ClinicalTrials.gov, MyVariant.info via BioMCP
- 💬 **Modern chat interface** - Intuitive and responsive user experience
- 🔄 **Real-time communication** - WebSockets for fluid interactions
- 📊 **Data visualization** - Dedicated modal to explore BioMCP metadata
- 📄 **PDF export** - Report generation with complete Markdown rendering
- 🔍 **Advanced search** - Search within conversations and messages
- 🎨 **Modern design** - Dark interface with Scienta Lab colors
- 🧪 **Comprehensive testing** - Unit tests with Jest for critical components
- 🔒 **Secure deployment** - GitHub Actions CI/CD with secrets management
- 🐳 **Docker-ready** - Multi-stage builds with Chrome for PDF generation
- 📱 **User session tracking** - Display user ID and session ID in header

## 🏗️ Technical Architecture

### Hexagonal Architecture (Clean Architecture)

The project follows hexagonal architecture principles with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                     │
├─────────────────────────────────────────────────────────────┤
│                    Backend (NestJS)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Domain    │  │ Application │  │   Infrastructure    │ │
│  │             │  │             │  │                     │ │
│  │ • Entities  │  │ • Use Cases │  │ • Adapters          │ │
│  │ • Ports     │  │ • DTOs      │  │ • Controllers       │ │
│  │ • Services  │  │ • Services  │  │ • Repositories      │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**

- **NestJS** - Node.js framework with TypeScript
- **Socket.IO** - Real-time WebSocket communication
- **OpenAI API** - Language models for analysis and generation
- **BioMCP** - MCP protocol for biomedical data access
- **Puppeteer** - PDF generation with Markdown rendering

**Frontend:**

- **Next.js 14** - React framework with App Router
- **TypeScript** - Complete static typing
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - WebSocket client
- **React Markdown** - Markdown rendering with syntax highlighting

**DevOps:**

- **Docker** - Service containerization with multi-stage builds
- **Docker Compose** - Local and production orchestration
- **GitHub Actions** - Automated CI/CD with parallel builds
- **GitHub Secrets** - Secure environment variable management
- **pnpm** - Fast package manager with workspace support

## 🚀 Installation and Setup

### Prerequisites

- **Node.js** 18+
- **pnpm** (recommended) or npm
- **Docker** and Docker Compose (optional)

### Quick Installation

```bash
# Clone the repository
git clone https://github.com/your-username/scientalab-chat.git
cd scientalab-chat

# Install all dependencies
pnpm install:all

# Start in development mode
pnpm dev
```

### Installation with Docker (recommended)

```bash
# Start with Docker Compose
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Environment Variables Configuration

1. **Copy the environment file:**

   ```bash
   cp env.development .env
   ```

2. **Configure API keys:**

   ```bash
   # OpenAI API Key (required)
   OPENAI_API_KEY=sk-proj-your-openai-key-here

   # BioMCP Server (already configured)
   BIOMCP_URL=https://biomcp-server-452652483423.europe-west4.run.app
   ```

3. **Start the application:**

   ```bash
   # Backend (port 4001)
   cd chat-app/backend && pnpm run start:dev

   # Frontend (port 3003) - in a new terminal
   cd chat-app/frontend && pnpm run dev
   ```

## 🔬 Biomedical Data Sources

The application accesses real scientific databases via BioMCP:

### 📚 PubMed/PubTator3

- **30M+ articles** of biomedical research
- **Automatic entity recognition** (genes, diseases, drugs)
- **Complete abstracts** with metadata

### 🏥 ClinicalTrials.gov

- **400K+ clinical trials** worldwide
- **Detailed eligibility criteria**
- **Real-time trial status**

### 🧬 MyVariant.info

- **Complete annotations** of genetic variants
- **Population frequencies**
- **Clinical and phenotypic annotations**

### 🎯 cBioPortal

- **Cancer genomic data**
- **Automatic dataset integration**
- **Advanced statistical analyses**

## 💡 Usage Examples

### Literature Search

```
User: "Find papers about TNF-alpha inhibitors in inflammatory bowel disease"
Assistant: [Searches PubMed via BioMCP and provides relevant articles with abstracts]
```

### Clinical Trials

```
User: "Are there any clinical trials for adalimumab in Crohn's disease?"
Assistant: [Queries ClinicalTrials.gov and lists active trials with criteria]
```

### Genetic Variants

```
User: "What do we know about the rs113488022 genetic variant?"
Assistant: [Consults MyVariant.info and provides complete clinical annotations]
```

### Drug Interactions

```
User: "Search for drug interactions between adalimumab and methotrexate"
Assistant: [Analyzes interactions via DrugBank and presents safety data]
```

## 🔧 API Endpoints

### Chat and Sessions

- `POST /chat/sessions` - Create a new session
- `GET /chat/sessions/:id` - Retrieve a session
- `POST /chat/sessions/:id/messages` - Send a message
- `GET /chat/sessions/:id/messages` - Retrieve messages
- `DELETE /chat/sessions/:id` - Delete a session
- `GET /chat/sessions/:id/validate` - Validate a session

### Search

- `POST /chat/search/messages` - Search within messages
- `POST /chat/search/conversations` - Search within conversations

### Export

- `GET /chat/sessions/:id/export/pdf` - Export to PDF

### WebSocket

- `ws://localhost:4001` - Real-time connection (development)
- `wss://api.scientalab.coulibalymamadou.com` - Production WebSocket

## 🎨 User Interface

### Design and Theme

- **Modern dark theme** with Scienta Lab colors
- **Primary colors**: White (#FFFFFF) and Blue (#3B82F6)
- **Accent colors**: Green/Teal (#34D399) and Black (#000000)
- **Responsive interface** optimized for desktop

### Main Components

- **Chatbox** - Main chat interface with history
- **MessageBubble** - Message bubbles with Markdown rendering
- **BioMCPModal** - Modal to explore biomedical data
- **Header** - Navigation bar with Scienta Lab logo
- **SearchBar** - Search bar within conversations

### UX Features

- **Loading indicators** for all asynchronous operations
- **Success notifications** for completed actions
- **Robust error handling** with user messages
- **User guidance** with example questions when no messages are present
- **Session tracking** with user ID and session ID display in header
- **PDF export loading** with disabled input during generation
- **BioMCP data visualization** with dedicated modal for metadata exploration

## 🔒 Security and Privacy

### API Key Management

- **Environment variables** for all sensitive keys
- **Strict validation** of keys at startup
- **Recommended rotation** of production keys
- **GitHub Actions secrets** for deployment
- **Secure deployment scripts** with encrypted environment creation
- **No hardcoded secrets** in source code

### Data Protection

- **In-memory sessions** (no permanent persistence)
- **Server-side session validation**
- **CORS configured** for authorized domains
- **Security headers** configured

## 🚀 Deployment

### Local Deployment with Docker

```bash
# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment

The project includes secure deployment scripts:

```bash
# Automated deployment with GitHub Actions
git push origin main

# Manual deployment
./deploy.sh
```

### Deployment Scripts

- **`deploy.sh`** - Main deployment script with environment validation
- **`scripts/deploy-server.sh`** - Secure server-side deployment script
- **`scripts/local.sh`** - Local development and management
- **`scripts/env.example`** - Environment variables template

### GitHub Secrets Required

For automated deployment, configure these GitHub secrets:

- `SSH_KEY` - Private SSH key for server access
- `SSH_HOST` - Server hostname/IP
- `SSH_USERNAME` - Server username
- `GHCR_PAT` - GitHub Container Registry token
- `GH_USERNAME` - GitHub username
- `OPENAI_API_KEY` - OpenAI API key
- `BIOMCP_URL` - BioMCP server URL
- `CORS_ORIGIN` - CORS origin URL
- `FRONTEND_URL` - Frontend URL
- `API_URL` - API URL
- `NEXT_PUBLIC_API_URL` - Public API URL
- `NEXT_PUBLIC_WS_URL` - Public WebSocket URL

### Domain Configuration

- **Frontend**: `scientalab.coulibalymamadou.com` (port 3003)
- **API**: `api.scientalab.coulibalymamadou.com` (port 4001)

## 🧪 Testing and Development

### Automated Testing

```bash
# Run backend tests
cd chat-app/backend && npm test

# Run tests with coverage
cd chat-app/backend && npm test -- --coverage

# Run E2E tests
cd chat-app/backend && npm run test:e2e
```

### Manual Tests

```bash
# Backend health check
curl http://localhost:4001/

# Test session creation
curl -X POST http://localhost:4001/chat/sessions \
  -H "Content-Type: application/json" \
  -d '{"username": "test-user"}'

# Test message sending
curl -X POST http://localhost:4001/chat/sessions/{sessionId}/messages \
  -H "Content-Type: application/json" \
  -d '{"content": "Find papers about cancer research"}'
```

### Development

```bash
# Development mode with hot reload
pnpm dev

# Production build
pnpm build

# Linting and formatting
pnpm lint
pnpm format
```

## 🧪 Testing and Quality Assurance

### Test Coverage

The project includes comprehensive testing for critical components:

- **Unit Tests** - Domain entities, value objects, and utilities
- **Integration Tests** - PDF adapter and core services
- **E2E Tests** - End-to-end application testing
- **Test Coverage** - Jest with coverage reporting

### Test Structure

```
chat-app/backend/
├── src/
│   ├── domain/entities/
│   │   └── message.entity.spec.ts
│   ├── domain/value-objects/
│   │   ├── session-id.vo.spec.ts
│   │   └── message-role.vo.spec.ts
│   ├── infrastructure/adapters/pdf/
│   │   └── puppeteer-pdf.adapter.spec.ts
│   └── shared/utils/
│       └── uuid.util.spec.ts
└── test/
    ├── app.e2e-spec.ts
    ├── jest-e2e.json
    └── setup.ts
```

### Running Tests

```bash
# Unit tests
npm test

# Tests with coverage
npm test -- --coverage

# E2E tests
npm run test:e2e

# Watch mode
npm run test:watch
```

## 📊 Monitoring and Logs

### Application Logs

- **Configurable log levels** (debug, info, warn, error)
- **Structured logs** with timestamps and contexts
- **Complete traceability** of BioMCP requests
- **LLM performance monitoring**

### Key Metrics

- **Response time** of BioMCP requests
- **Success rate** of SSE connections
- **OpenAI token usage**
- **PDF generation performance**

## 🤝 Contribution

### Project Structure

```
scientalab-chat/
├── .github/workflows/     # CI/CD pipelines
│   ├── deploy.yml        # Production deployment
│   └── test.yml          # Automated testing
├── chat-app/
│   ├── backend/          # NestJS API
│   │   ├── src/
│   │   │   ├── domain/   # Entities, value objects, services
│   │   │   ├── application/ # Use cases, DTOs, mappers
│   │   │   ├── infrastructure/ # Adapters, controllers, modules
│   │   │   ├── config/   # Configuration and validation
│   │   │   └── shared/   # Utilities and common code
│   │   ├── test/         # E2E tests
│   │   ├── Dockerfile    # Multi-stage Docker build
│   │   └── package.json
│   └── frontend/         # Next.js application
│       ├── src/
│       │   ├── components/ # React components
│       │   ├── services/   # API services
│       │   ├── hooks/     # Custom hooks
│       │   ├── config/    # Environment configuration
│       │   └── store/     # State management
│       ├── Dockerfile    # Multi-stage Docker build
│       └── package.json
├── scripts/              # Deployment and management scripts
│   ├── deploy-server.sh  # Secure server deployment
│   ├── local.sh         # Local development tools
│   ├── env.example      # Environment template
│   └── README.md        # Scripts documentation
├── docker-compose.yml   # Docker orchestration
├── deploy.sh           # Main deployment script
├── docker.env          # Docker environment variables
├── env.development     # Development environment
├── package.json        # Workspace configuration
├── pnpm-workspace.yaml # pnpm workspace config
├── .gitignore         # Git ignore rules
└── README.md          # Project documentation
```

### Development Guidelines

1. **Hexagonal architecture** - Respect layer separation
2. **Strict TypeScript** - Complete typing and validation
3. **Unit tests** - Coverage of critical use cases
4. **Documentation** - Updated comments and README
5. **Code review** - Team validation

## 📈 Roadmap

### Current Version (v1.0)

- ✅ Complete BioMCP integration
- ✅ Modern chat interface
- ✅ PDF export with Markdown rendering
- ✅ Search within conversations
- ✅ Real-time WebSockets
- ✅ Comprehensive unit testing with Jest
- ✅ Secure deployment with GitHub Actions
- ✅ Docker multi-stage builds
- ✅ User session tracking
- ✅ Enhanced UX with loading states
- ✅ BioMCP data visualization modal
- ✅ Environment variable security

### Future Versions (can be updated)

- 🔄 **User authentication** - Account system and permissions
- 🔄 **Persistent database** - Conversation backup
- 🔄 **Advanced analytics** - Dashboards and metrics
- 🔄 **Public API** - Documentation and SDK
- 🔄 **Mobile app** - Native iOS/Android application

## 📞 Support and Contact

### Documentation

- **Main README** - This file
- **API Documentation** - Detailed endpoints
- **Deployment Guide** - Production instructions

### Technical Support

- **GitHub Issues** - Bug reports
- **Discussions** - Questions and suggestions
- **Email** - coulibalyhamed@outlook.fr

### Team

- **Development** - Codebox
- **Architecture** - Hexagonal architecture and DDD
- **DevOps** - Docker and CI/CD

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

**Scienta Lab Chat** - _biomedical research through artificial intelligence_ 🔬✨
