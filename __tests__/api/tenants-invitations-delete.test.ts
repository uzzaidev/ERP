import { createClient } from '@/lib/supabase/server';
import { DELETE } from '@/app/api/tenants/invitations/[id]/route';

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

describe('/api/tenants/invitations/[id]', () => {
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
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('DELETE', () => {
    it('should cancel a pending invitation successfully', async () => {
      const mockRequest = {} as any;
      const mockParams = Promise.resolve({ id: 'invitation-id' });

      mockSupabase.single
        .mockResolvedValueOnce({
          // First call - fetch invitation
          data: {
            tenant_id: 'test-tenant-id',
            status: 'pending',
          },
          error: null,
        });

      mockSupabase.update.mockReturnValueOnce({
        eq: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValueOnce({
          error: null,
        }),
      });

      const response = await DELETE(mockRequest, { params: mockParams });
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.message).toContain('cancelled successfully');
      expect(mockSupabase.from).toHaveBeenCalledWith('tenant_invitations');
    });

    it('should deny access to invitations from other tenants', async () => {
      const mockRequest = {} as any;
      const mockParams = Promise.resolve({ id: 'invitation-id' });

      mockSupabase.single.mockResolvedValue({
        data: {
          tenant_id: 'other-tenant-id',
          status: 'pending',
        },
        error: null,
      });

      const response = await DELETE(mockRequest, { params: mockParams });
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBe('Access denied');
      expect(response.status).toBe(403);
    });

    it('should not cancel non-pending invitations', async () => {
      const mockRequest = {} as any;
      const mockParams = Promise.resolve({ id: 'invitation-id' });

      mockSupabase.single.mockResolvedValue({
        data: {
          tenant_id: 'test-tenant-id',
          status: 'accepted',
        },
        error: null,
      });

      const response = await DELETE(mockRequest, { params: mockParams });
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toContain('Cannot cancel invitation');
      expect(response.status).toBe(400);
    });

    it('should handle invitation not found', async () => {
      const mockRequest = {} as any;
      const mockParams = Promise.resolve({ id: 'invalid-id' });

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const response = await DELETE(mockRequest, { params: mockParams });
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBe('Invitation not found');
      expect(response.status).toBe(404);
    });

    it('should enforce tenant isolation in update', async () => {
      const mockRequest = {} as any;
      const mockParams = Promise.resolve({ id: 'invitation-id' });

      const mockEq = jest.fn().mockReturnThis();
      
      mockSupabase.single.mockResolvedValue({
        data: {
          tenant_id: 'test-tenant-id',
          status: 'pending',
        },
        error: null,
      });

      mockSupabase.update.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockResolvedValue({ error: null });

      await DELETE(mockRequest, { params: mockParams });

      expect(mockSupabase.update).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 'invitation-id');
      expect(mockEq).toHaveBeenCalledWith('tenant_id', 'test-tenant-id');
    });
  });
});
