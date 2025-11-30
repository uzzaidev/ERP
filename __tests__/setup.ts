// Test setup and global configurations
import '@testing-library/jest-dom';

// Mock environment variables APENAS se não estiverem definidas
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
}
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
}

// Mock Next.js server components
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

// Mock fetch APENAS para unit tests (não para integration)
// Testes de integração definem INTEGRATION_TEST=true
if (!process.env.INTEGRATION_TEST) {
  global.fetch = jest.fn();
}

beforeEach(() => {
  if (!process.env.INTEGRATION_TEST) {
    jest.clearAllMocks();
  }
});
