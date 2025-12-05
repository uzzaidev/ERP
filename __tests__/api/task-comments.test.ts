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

describe('/api/tasks/[id]/comments', () => {
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
    };
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tasks/[id]/comments', () => {
    it('should return comments for a task', async () => {
      const mockComments = [
        {
          id: 'comment-1',
          task_id: testTaskId,
          author_id: 'test-user-id',
          content: 'This is a test comment',
          mentions: [],
          created_at: '2025-12-05T10:00:00Z',
          updated_at: '2025-12-05T10:00:00Z',
          author: {
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

      // Mock comments fetch
      mockSupabase.order.mockResolvedValue({
        data: mockComments,
        error: null,
      });

      const { GET } = await import('@/app/api/tasks/[id]/comments/route');
      const mockRequest = {} as any;
      const mockParams = Promise.resolve({ id: testTaskId });

      const response = await GET(mockRequest, { params: mockParams });
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockComments);
      expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
      expect(mockSupabase.from).toHaveBeenCalledWith('task_comments');
    });

    it('should return 404 if task not found', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Task not found' },
      });

      const { GET } = await import('@/app/api/tasks/[id]/comments/route');
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

      const { GET } = await import('@/app/api/tasks/[id]/comments/route');
      const mockRequest = {} as any;
      const mockParams = Promise.resolve({ id: testTaskId });

      const response = await GET(mockRequest, { params: mockParams });

      // Should still call eq with test-tenant-id
      expect(mockSupabase.eq).toHaveBeenCalledWith('tenant_id', 'test-tenant-id');
    });
  });

  describe('POST /api/tasks/[id]/comments', () => {
    it('should create a new comment', async () => {
      const newComment = {
        id: 'new-comment-id',
        task_id: testTaskId,
        author_id: 'test-user-id',
        content: 'New test comment',
        mentions: [],
        created_at: '2025-12-05T12:00:00Z',
        updated_at: '2025-12-05T12:00:00Z',
        author: {
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

      // Mock comment creation
      mockSupabase.single.mockResolvedValueOnce({
        data: newComment,
        error: null,
      });

      const { POST } = await import('@/app/api/tasks/[id]/comments/route');
      const mockRequest = {
        json: async () => ({
          content: 'New test comment',
          mentions: [],
        }),
      } as any;
      const mockParams = Promise.resolve({ id: testTaskId });

      const response = await POST(mockRequest, { params: mockParams });
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toEqual(newComment);
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        tenant_id: 'test-tenant-id',
        task_id: testTaskId,
        author_id: 'test-user-id',
        content: 'New test comment',
        mentions: [],
      });
    });

    it('should return 400 if content is empty', async () => {
      const { POST } = await import('@/app/api/tasks/[id]/comments/route');
      const mockRequest = {
        json: async () => ({
          content: '   ',
        }),
      } as any;
      const mockParams = Promise.resolve({ id: testTaskId });

      const response = await POST(mockRequest, { params: mockParams });
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(response.status).toBe(400);
    });

    it('should return 404 if task not found', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Task not found' },
      });

      const { POST } = await import('@/app/api/tasks/[id]/comments/route');
      const mockRequest = {
        json: async () => ({
          content: 'Test comment',
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
