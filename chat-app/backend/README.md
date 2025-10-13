# 🔬 Scienta Lab Chat - Backend API

[![NestJS](https://img.shields.io/badge/NestJS-11.0+-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

> **NestJS Backend API** - Biomedical research assistant with hexagonal architecture

## 🎯 Overview

This is the backend API for Scienta Lab Chat, built with NestJS and following hexagonal architecture principles. It provides intelligent biomedical research assistance through OpenAI GPT integration and real-time access to scientific databases via BioMCP.

## 🏗️ Architecture

### Hexagonal Architecture (Clean Architecture)

```
┌─────────────────────────────────────────────────────────────┐
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

### Project Structure

```
src/
├── domain/                           # 🧠 Domain Layer
│   ├── entities/
│   │   ├── message.entity.ts         # Message entity
│   │   ├── conversation.entity.ts    # Conversation entity
│   │   └── query.entity.ts           # Query entity
│   ├── value-objects/
│   │   ├── message-role.vo.ts        # Message role value object
│   │   ├── query-text.vo.ts          # Query text value object
│   │   └── session-id.vo.ts          # Session ID value object
│   ├── services/
│   │   └── biomedical-analyzer.service.ts # Biomedical analysis service
│   └── ports/                        # Port interfaces
│       ├── llm.port.ts               # LLM port
│       ├── biomcp.port.ts            # BioMCP port
│       └── chat-repository.port.ts   # Chat repository port
│
├── application/                      # 🚀 Application Layer
│   ├── use-cases/
│   │   ├── chat/
│   │   │   ├── process-query.use-case.ts    # Process query use case
│   │   │   ├── get-history.use-case.ts      # Get history use case
│   │   │   └── create-conversation.use-case.ts # Create conversation use case
│   │   └── biomcp/
│   │       └── fetch-papers.use-case.ts     # Fetch papers use case
│   ├── dto/
│   │   ├── chat-request.dto.ts       # Chat request DTO
│   │   └── chat-response.dto.ts      # Chat response DTO
│   └── mappers/
│       ├── message.mapper.ts         # Message mapper
│       └── conversation.mapper.ts    # Conversation mapper
│
├── infrastructure/                   # ⚙️ Infrastructure Layer
│   ├── adapters/
│   │   ├── controllers/
│   │   │   └── chat.controller.ts    # HTTP controller
│   │   ├── llm/
│   │   │   └── openai.adapter.ts     # OpenAI adapter
│   │   ├── biomcp/
│   │   │   └── biomcp.adapter.ts     # BioMCP adapter
│   │   ├── pdf/
│   │   │   └── puppeteer-pdf.adapter.ts # PDF export adapter
│   │   ├── websocket/
│   │   │   └── chat.gateway.ts       # WebSocket gateway
│   │   └── repositories/
│   │       └── in-memory-chat.repository.ts # In-memory repository
│   ├── modules/
│   │   ├── chat.module.ts            # Chat module
│   │   └── biomcp.module.ts          # BioMCP module
│   └── config/
│       ├── app.config.ts             # App configuration
│       └── env.validation.ts         # Environment validation
│
└── app.module.ts                     # Root module
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **pnpm** (recommended) or npm
- **OpenAI API Key** (required)
- **BioMCP Server** (already configured)

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp env.example .env

# Edit .env with your API keys
OPENAI_API_KEY=your-openai-api-key-here
BIOMCP_URL=https://biomcp-server-452652483423.europe-west4.run.app
```

### Development

```bash
# Start in development mode
pnpm run start:dev

# Start in debug mode
pnpm run start:debug

# Build the application
pnpm run build

# Start production mode
pnpm run start:prod
```

## 🧪 Testing

### Running Tests

```bash
# Unit tests
pnpm run test

# Tests with coverage
pnpm run test:cov

# E2E tests
pnpm run test:e2e

# Watch mode
pnpm run test:watch
```

### Test Coverage

The project includes comprehensive testing:

- **Unit Tests** - Domain entities, value objects, and utilities
- **Integration Tests** - PDF adapter and core services
- **E2E Tests** - End-to-end application testing

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

## 🔬 Biomedical Integration

### BioMCP Integration

The backend integrates with BioMCP for real-time access to:

- **PubMed/PubTator3** - 30M+ biomedical articles
- **ClinicalTrials.gov** - 400K+ clinical trials
- **MyVariant.info** - Genetic variant annotations
- **cBioPortal** - Cancer genomic data

### OpenAI Integration

- **GPT-4** for intelligent analysis
- **Context-aware responses** based on biomedical data
- **Token optimization** for cost efficiency

## 🐳 Docker

### Development with Docker

```bash
# Build the image
docker build -t scientalab-backend .

# Run the container
docker run -p 4001:4001 scientalab-backend
```

### Production Docker

The Dockerfile includes:

- **Multi-stage build** for optimization
- **Chrome installation** for PDF generation
- **Security hardening** for production
- **Health checks** for monitoring

## 🔒 Security

### Environment Variables

- **Strict validation** of required keys
- **No hardcoded secrets** in source code
- **Secure deployment** with GitHub Actions

### API Security

- **CORS configuration** for authorized domains
- **Request validation** with DTOs
- **Rate limiting** (configurable)
- **Security headers** configured

## 📊 Monitoring

### Logging

- **Configurable log levels** (debug, info, warn, error)
- **Structured logs** with timestamps
- **Complete traceability** of BioMCP requests
- **Performance monitoring**

### Health Checks

- **Docker health checks** configured
- **API health endpoint** at `/`
- **Dependency monitoring** (OpenAI, BioMCP)

## 🛠️ Development Guidelines

1. **Hexagonal Architecture** - Respect layer separation
2. **Strict TypeScript** - Complete typing and validation
3. **Unit Tests** - Coverage of critical use cases
4. **Documentation** - Updated comments and README
5. **Code Review** - Team validation

## 📞 Support

- **GitHub Issues** - Bug reports
- **Discussions** - Questions and suggestions
- **Email** - coulibalyhamed@outlook.fr

## 📄 License

This project is licensed under the MIT License.

---

**Scienta Lab Chat Backend** - _intelligent biomedical research API_ 🔬✨
