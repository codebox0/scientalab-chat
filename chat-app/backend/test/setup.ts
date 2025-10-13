// Setup file for E2E tests
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Mock console methods to reduce noise during tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress expected error logs during tests
  console.error = (...args: any[]) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      (message.includes('Validation failed') ||
        message.includes('Session not found') ||
        message.includes('Failed to process'))
    ) {
      return; // Suppress expected errors
    }
    originalConsoleError(...args);
  };

  console.warn = (...args: any[]) => {
    const message = args[0];
    if (typeof message === 'string' && message.includes('Puppeteer')) {
      return; // Suppress Puppeteer warnings
    }
    originalConsoleWarn(...args);
  };
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test timeout
jest.setTimeout(30000);
