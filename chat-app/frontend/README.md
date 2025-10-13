# 🔬 Scienta Lab Chat - Frontend

[![Next.js](https://img.shields.io/badge/Next.js-15.5+-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0+-38B2AC.svg)](https://tailwindcss.com/)

> **Next.js Frontend** - Modern chat interface for biomedical research assistant

## 🎯 Overview

This is the frontend application for Scienta Lab Chat, built with Next.js 15 and React 19. It provides an intuitive and responsive user interface for interacting with the biomedical research assistant through real-time chat, data visualization, and PDF export capabilities.

## 🏗️ Architecture

### Modern React Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Components  │  │ Services    │  │ Hooks & State       │ │
│  │             │  │             │  │                     │ │
│  │ • UI        │  │ • API       │  │ • WebSocket        │ │
│  │ • Layout    │  │ • Storage   │  │ • Session          │ │
│  │ • Modals    │  │ • Config    │  │ • Notifications    │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Project Structure

```
src/
├── app/                              # 🎨 App Router (Next.js 15)
│   ├── page.tsx                      # Main chat page
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Global styles
│   └── favicon.ico                   # Favicon
│
├── components/                       # 🧩 React Components
│   ├── Chatbox.tsx                   # Main chat interface
│   ├── MessageBubble.tsx             # Individual message component
│   ├── BioMCPModal.tsx               # Biomedical data modal
│   ├── Header.tsx                    # Navigation header
│   ├── ConnexionForm.tsx             # User connection form
│   ├── MarkdownRenderer.tsx          # Markdown rendering
│   ├── JsonRenderer.tsx              # JSON data display
│   └── index.ts                      # Component exports
│
├── services/                         # 🔌 API Services
│   ├── chat-api.service.ts           # Chat API client
│   └── session-storage.service.ts    # Session management
│
├── hooks/                           # 🎣 Custom Hooks
│   ├── useWebSocket.ts               # WebSocket connection
│   └── useSession.ts                 # Session management
│
├── store/                           # 📦 State Management
│   └── Message.tsx                   # Message types and enums
│
└── config/                          # ⚙️ Configuration
    └── environment.ts                # Environment variables
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **pnpm** (recommended) or npm
- **Backend API** running on port 4001

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm run start
```

### Environment Configuration

The frontend uses environment variables for API configuration:

```bash
# Development (default)
NEXT_PUBLIC_API_URL=http://localhost:4001
NEXT_PUBLIC_WS_URL=ws://localhost:4001

# Production (set via Docker build args)
NEXT_PUBLIC_API_URL=https://api.scientalab.coulibalymamadou.com
NEXT_PUBLIC_WS_URL=wss://api.scientalab.coulibalymamadou.com
```

## 🎨 User Interface

### Design System

- **Modern dark theme** with Scienta Lab branding
- **Primary colors**: White (#FFFFFF) and Blue (#3B82F6)
- **Accent colors**: Green/Teal (#34D399) and Black (#000000)
- **Responsive design** optimized for desktop

### Key Components

#### Chatbox

- **Main chat interface** with message history
- **Real-time messaging** via WebSocket
- **Loading states** and typing indicators
- **User guidance** with example questions

#### MessageBubble

- **Markdown rendering** with syntax highlighting
- **BioMCP data visualization** with dedicated buttons
- **Message metadata** display (confidence, sources)
- **Responsive design** for different screen sizes

#### BioMCPModal

- **Biomedical data exploration** in dedicated modal
- **Tabbed interface** for different data types
- **JSON data rendering** with syntax highlighting
- **Export capabilities** for research data

#### Header

- **Scienta Lab branding** with logo
- **User session tracking** with ID display
- **PDF export button** with loading states
- **Navigation elements** for future features

## 🔌 API Integration

### WebSocket Connection

Real-time communication with the backend:

```typescript
// WebSocket hook usage
const { sendMessage, messages, isConnected } = useWebSocket({
  onMessage: (message) => {
    // Handle incoming messages
  },
  onError: (error) => {
    // Handle connection errors
  },
});
```

### REST API Integration

HTTP requests for session management:

```typescript
// API service usage
const chatApi = new ChatApiService();

// Create session
const session = await chatApi.createSession({
  username: "researcher",
});

// Send message
const response = await chatApi.sendMessage(sessionId, {
  content: "Find papers about cancer research",
});
```

## 🧪 Development

### Available Scripts

```bash
# Development with Turbopack
pnpm run dev

# Production build
pnpm run build

# Start production server
pnpm run start

# Linting
pnpm run lint
```

### Code Quality

- **TypeScript** for type safety
- **ESLint** for code quality
- **Tailwind CSS** for styling
- **React 19** with latest features

## 🐳 Docker

### Development with Docker

```bash
# Build the image
docker build -t scientalab-frontend .

# Run the container
docker run -p 3003:3003 scientalab-frontend
```

### Production Docker

The Dockerfile includes:

- **Multi-stage build** for optimization
- **Standalone output** for minimal image size
- **Build arguments** for environment variables
- **Security hardening** for production

## 🔒 Security

### Environment Variables

- **Public variables** prefixed with `NEXT_PUBLIC_`
- **Build-time injection** via Docker build args
- **No sensitive data** in client-side code

### Security Headers

- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff
- **Referrer-Policy**: origin-when-cross-origin

## 📱 Features

### Real-time Chat

- **WebSocket connection** for instant messaging
- **Typing indicators** for better UX
- **Connection status** monitoring
- **Automatic reconnection** on network issues

### Biomedical Data Visualization

- **BioMCP modal** for data exploration
- **Tabbed interface** for different data types
- **JSON rendering** with syntax highlighting
- **Metadata display** (confidence, sources)

### PDF Export

- **Complete conversation** export
- **Markdown rendering** in PDFs
- **Loading states** during generation
- **Success notifications** for user feedback

### Session Management

- **User ID tracking** in header
- **Session ID display** for debugging
- **Persistent sessions** across page reloads
- **Session validation** with backend

## 🎯 User Experience

### Loading States

- **Message sending** indicators
- **PDF export** progress
- **WebSocket connection** status
- **API request** loading

### Error Handling

- **Connection errors** with retry options
- **API errors** with user-friendly messages
- **Validation errors** with field highlighting
- **Fallback UI** for critical failures

### Accessibility

- **Keyboard navigation** support
- **Screen reader** compatibility
- **High contrast** color scheme
- **Focus management** for modals

## 🛠️ Development Guidelines

1. **Component-based architecture** - Reusable and maintainable
2. **TypeScript strict mode** - Complete type safety
3. **Custom hooks** - Logic separation and reusability
4. **Service layer** - API abstraction
5. **Responsive design** - Mobile-first approach

## 📞 Support

- **GitHub Issues** - Bug reports
- **Discussions** - Questions and suggestions
- **Email** - coulibalyhamed@outlook.fr

## 📄 License

This project is licensed under the MIT License.

---

**Scienta Lab Chat Frontend** - _modern biomedical research interface_ 🔬✨
