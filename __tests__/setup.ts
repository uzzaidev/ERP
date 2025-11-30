// Test setup and global configurations
import '@testing-library/jest-dom';

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Mock Next.js server components
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

// Global test utilities
global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});
