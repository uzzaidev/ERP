import { createClient } from '@/lib/supabase/server';
import { PATCH } from '@/app/api/users/profile/route';

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

// Mock tenant context
jest.mock('@/lib/supabase/tenant', () => ({
  getTenantContext: jest.fn(),
}));

// Mock Next.js
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: (data: any, init?: any) => ({
      json: async () => data,
      status: init?.status || 200,
    }),
  },
}));

describe('/api/users/profile', () => {
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
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('PATCH', () => {
    it('should update user profile successfully', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          full_name: 'Updated Name',
          phone: '1234567890',
        }),
      } as any;

      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'test-user-id',
          full_name: 'Updated Name',
          email: 'test@example.com',
          phone: '1234567890',
          tenant_id: 'test-tenant-id',
        },
        error: null,
      });

      const response = await PATCH(mockRequest);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.full_name).toBe('Updated Name');
      expect(data.data.phone).toBe('1234567890');
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
      expect(mockSupabase.update).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'test-user-id');
      expect(mockSupabase.eq).toHaveBeenCalledWith('tenant_id', 'test-tenant-id');
    });

    it('should fail when no fields provided', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({}),
      } as any;

      const response = await PATCH(mockRequest);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toContain('At least one field must be provided');
      expect(response.status).toBe(400);
    });

    it('should handle database errors', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          full_name: 'Updated Name',
        }),
      } as any;

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const response = await PATCH(mockRequest);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBe('Database error');
      expect(response.status).toBe(500);
    });

    it('should enforce tenant isolation', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          full_name: 'Updated Name',
        }),
      } as any;

      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'test-user-id',
          full_name: 'Updated Name',
          email: 'test@example.com',
          tenant_id: 'test-tenant-id',
        },
        error: null,
      });

      await PATCH(mockRequest);

      // Verify both user ID and tenant ID are used in query
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'test-user-id');
      expect(mockSupabase.eq).toHaveBeenCalledWith('tenant_id', 'test-tenant-id');
    });
  });
});
