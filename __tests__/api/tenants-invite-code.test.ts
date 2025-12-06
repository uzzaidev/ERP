import { createClient } from '@/lib/supabase/server';
import { GET } from '@/app/api/tenants/invite-code/route';
import { isAdmin } from '@/lib/auth/permissions';

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

// Mock tenant context
jest.mock('@/lib/supabase/tenant', () => ({
  getTenantContext: jest.fn(),
}));

// Mock permissions
jest.mock('@/lib/auth/permissions', () => ({
  isAdmin: jest.fn(),
}));

// Mock Next.js
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: any) => ({
      json: async () => data,
      status: init?.status || 200,
    }),
  },
}));

describe('/api/tenants/invite-code', () => {
  let mockSupabase: any;

  beforeEach(() => {
    // Mock getTenantContext to return test tenant
    const { getTenantContext } = require('@/lib/supabase/tenant');
    (getTenantContext as jest.Mock).mockResolvedValue({
      tenantId: 'test-tenant-id',
      userId: 'test-user-id',
      user: {
        id: 'test-user-id',
        tenant_id: 'test-tenant-id',
        email: 'test@example.com',
        full_name: 'Test User',
      },
    });

    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return invite code for admin users', async () => {
      (isAdmin as jest.Mock).mockResolvedValue(true);

      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'test-tenant-id',
          name: 'Test Company',
          slug: 'test-company',
          plan: 'professional',
          status: 'active',
        },
        error: null,
      });

      const response = await GET();
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.tenant_id).toBe('test-tenant-id');
      expect(data.data.tenant_name).toBe('Test Company');
      expect(data.data.tenant_slug).toBe('test-company');
      expect(data.data.invite_url).toContain('test-company');
      expect(isAdmin).toHaveBeenCalledWith('test-user-id', 'test-tenant-id');
    });

    it('should deny access for non-admin users', async () => {
      (isAdmin as jest.Mock).mockResolvedValue(false);

      const response = await GET();
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toContain('Only administrators');
      expect(response.status).toBe(403);
    });

    it('should handle tenant not found', async () => {
      (isAdmin as jest.Mock).mockResolvedValue(true);

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const response = await GET();
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBe('Tenant not found');
      expect(response.status).toBe(404);
    });

    it('should enforce tenant isolation', async () => {
      (isAdmin as jest.Mock).mockResolvedValue(true);

      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'test-tenant-id',
          name: 'Test Company',
          slug: 'test-company',
          plan: 'professional',
          status: 'active',
        },
        error: null,
      });

      await GET();

      expect(mockSupabase.from).toHaveBeenCalledWith('tenants');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'test-tenant-id');
    });
  });
});
