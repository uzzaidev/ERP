import { createClient } from '@/lib/supabase/server';

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
  NextResponse: {
    json: (data: any, init?: any) => ({
      json: async () => data,
      status: init?.status || 200,
    }),
  },
}));

describe('/api/tasks/[id]/time-logs', () => {
  let mockSupabase: any;
  const testTaskId = '44444444-0001-0001-0001-000000000001';

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
      order: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      rpc: jest.fn().mockReturnThis(),
    };
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tasks/[id]/time-logs', () => {
    it('should return time logs for a task', async () => {
      const mockTimeLogs = [
        {
          id: 'time-log-1',
          task_id: testTaskId,
          user_id: 'test-user-id',
          hours: 4.5,
          description: 'Working on feature',
          logged_date: '2025-12-05',
          created_at: '2025-12-05T10:00:00Z',
          user: {
            id: 'test-user-id',
            full_name: 'Test User',
            email: 'test@example.com',
            avatar_url: null,
          },
        },
      ];

      // Mock task verification
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: testTaskId, tenant_id: 'test-tenant-id' },
        error: null,
      });

      // Mock time logs fetch
      mockSupabase.order.mockResolvedValue({
        data: mockTimeLogs,
        error: null,
      });

      const { GET } = await import('@/app/api/tasks/[id]/time-logs/route');
      const mockRequest = {} as any;
      const mockParams = Promise.resolve({ id: testTaskId });

      const response = await GET(mockRequest, { params: mockParams });
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockTimeLogs);
      expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
      expect(mockSupabase.from).toHaveBeenCalledWith('task_time_logs');
    });

    it('should return 404 if task not found', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Task not found' },
      });

      const { GET } = await import('@/app/api/tasks/[id]/time-logs/route');
      const mockRequest = {} as any;
      const mockParams = Promise.resolve({ id: 'non-existent-task' });

      const response = await GET(mockRequest, { params: mockParams });
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(response.status).toBe(404);
    });

    it('should enforce tenant isolation', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { id: testTaskId, tenant_id: 'different-tenant-id' },
        error: null,
      });

      const { GET } = await import('@/app/api/tasks/[id]/time-logs/route');
      const mockRequest = {} as any;
      const mockParams = Promise.resolve({ id: testTaskId });

      const response = await GET(mockRequest, { params: mockParams });

      // Should still call eq with test-tenant-id
      expect(mockSupabase.eq).toHaveBeenCalledWith('tenant_id', 'test-tenant-id');
    });
  });

  describe('POST /api/tasks/[id]/time-logs', () => {
    it('should create a new time log', async () => {
      const newTimeLog = {
        id: 'new-time-log-id',
        task_id: testTaskId,
        user_id: 'test-user-id',
        hours: 3.0,
        description: 'Bug fixing',
        logged_date: '2025-12-05',
        created_at: '2025-12-05T12:00:00Z',
        user: {
          id: 'test-user-id',
          full_name: 'Test User',
          email: 'test@example.com',
          avatar_url: null,
        },
      };

      // Mock task verification
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: testTaskId, tenant_id: 'test-tenant-id' },
        error: null,
      });

      // Mock time log creation
      mockSupabase.single.mockResolvedValueOnce({
        data: newTimeLog,
        error: null,
      });

      // Mock RPC call for updating completed hours
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: null,
      });

      const { POST } = await import('@/app/api/tasks/[id]/time-logs/route');
      const mockRequest = {
        json: async () => ({
          hours: 3.0,
          description: 'Bug fixing',
          logged_date: '2025-12-05',
        }),
      } as any;
      const mockParams = Promise.resolve({ id: testTaskId });

      const response = await POST(mockRequest, { params: mockParams });
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toEqual(newTimeLog);
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        tenant_id: 'test-tenant-id',
        task_id: testTaskId,
        user_id: 'test-user-id',
        hours: 3.0,
        description: 'Bug fixing',
        logged_date: '2025-12-05',
      });
    });

    it('should return 400 if hours is 0 or negative', async () => {
      const { POST } = await import('@/app/api/tasks/[id]/time-logs/route');
      const mockRequest = {
        json: async () => ({
          hours: 0,
        }),
      } as any;
      const mockParams = Promise.resolve({ id: testTaskId });

      const response = await POST(mockRequest, { params: mockParams });
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(response.status).toBe(400);
      expect(data.error).toContain('greater than 0');
    });

    it('should return 400 if hours exceeds 24', async () => {
      const { POST } = await import('@/app/api/tasks/[id]/time-logs/route');
      const mockRequest = {
        json: async () => ({
          hours: 25,
        }),
      } as any;
      const mockParams = Promise.resolve({ id: testTaskId });

      const response = await POST(mockRequest, { params: mockParams });
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(response.status).toBe(400);
      expect(data.error).toContain('cannot exceed 24');
    });

    it('should use current date if logged_date not provided', async () => {
      const newTimeLog = {
        id: 'new-time-log-id',
        task_id: testTaskId,
        user_id: 'test-user-id',
        hours: 2.0,
        description: null,
        logged_date: new Date().toISOString().split('T')[0],
        created_at: '2025-12-05T12:00:00Z',
        user: {
          id: 'test-user-id',
          full_name: 'Test User',
          email: 'test@example.com',
          avatar_url: null,
        },
      };

      // Mock task verification
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: testTaskId, tenant_id: 'test-tenant-id' },
        error: null,
      });

      // Mock time log creation
      mockSupabase.single.mockResolvedValueOnce({
        data: newTimeLog,
        error: null,
      });

      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: null,
      });

      const { POST } = await import('@/app/api/tasks/[id]/time-logs/route');
      const mockRequest = {
        json: async () => ({
          hours: 2.0,
        }),
      } as any;
      const mockParams = Promise.resolve({ id: testTaskId });

      const response = await POST(mockRequest, { params: mockParams });
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(mockSupabase.insert).toHaveBeenCalled();
      const insertCall = mockSupabase.insert.mock.calls[0][0];
      expect(insertCall.logged_date).toBeTruthy();
    });

    it('should return 404 if task not found', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Task not found' },
      });

      const { POST } = await import('@/app/api/tasks/[id]/time-logs/route');
      const mockRequest = {
        json: async () => ({
          hours: 2.0,
        }),
      } as any;
      const mockParams = Promise.resolve({ id: 'non-existent-task' });

      const response = await POST(mockRequest, { params: mockParams });
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(response.status).toBe(404);
    });
  });
});
