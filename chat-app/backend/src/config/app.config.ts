import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },

  // BioMCP Configuration
  biomcp: {
    url: process.env.BIOMCP_URL,
    ssePath: process.env.BIO_MCP_SSE_PATH || '/sse',
  },

  // Server Configuration
  server: {
    port: parseInt(process.env.PORT || '4000', 10),
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  // Logs Configuration
  logs: {
    level: process.env.LOG_LEVEL || 'debug',
  },
}));
