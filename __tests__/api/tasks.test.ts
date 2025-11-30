import { createClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: any) => ({
      json: async () => data,
      status: init?.status || 200,
    }),
  },
}));

describe('/api/tasks', () => {
  let mockSupabase: any;
  let mockQuery: any;

  beforeEach(() => {
    // Create a chainable query mock that returns itself for all methods
    mockQuery = {
      select: jest.fn(),
      eq: jest.fn(),
      update: jest.fn(),
      single: jest.fn(),
    };
    
    // Make all methods chainable (return mockQuery)
    mockQuery.select.mockReturnValue(mockQuery);
    mockQuery.eq.mockReturnValue(mockQuery);
    mockQuery.update.mockReturnValue(mockQuery);
    mockQuery.single.mockReturnValue(mockQuery);

    mockSupabase = {
      from: jest.fn().mockReturnValue(mockQuery),
    };
    
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tasks', () => {
    it('should return all tasks without filters', async () => {
      const mockTasks = [
        {
          id: '44444444-0001-0001-0001-000000000001',
          code: 'TASK-001',
          title: 'Test Task',
          status: 'todo',
        },
      ];

      mockQuery.select.mockResolvedValue({
        data: mockTasks,
        error: null,
      });

      const { GET } = await import('@/app/api/tasks/route');
      const request = {
        nextUrl: {
          searchParams: new URLSearchParams(),
        },
      } as any;
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockTasks);
    });

    it('should filter tasks by project_id', async () => {
      const projectId = '22222222-0001-0001-0001-000000000001';
      const mockTasks = [
        {
          id: '44444444-0001-0001-0001-000000000001',
          project_id: projectId,
          title: 'Project Task',
        },
      ];

      // Mock the final result when eq is called
      const finalQuery = {
        ...mockQuery,
        then: (resolve: any) => resolve({ data: mockTasks, error: null }),
      };
      
      mockQuery.eq.mockReturnValue(finalQuery);

      const { GET } = await import('@/app/api/tasks/route');
      const request = {
        nextUrl: {
          searchParams: new URLSearchParams(`project_id=${projectId}`),
        },
      } as any;
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockTasks);
      expect(mockQuery.eq).toHaveBeenCalledWith('project_id', projectId);
    });

    it('should filter tasks by status', async () => {
      const status = 'in-progress';
      
      // Mock the final result
      const finalQuery = {
        ...mockQuery,
        then: (resolve: any) => resolve({ data: [], error: null }),
      };
      
      mockQuery.eq.mockReturnValue(finalQuery);

      const { GET } = await import('@/app/api/tasks/route');
      const request = {
        nextUrl: {
          searchParams: new URLSearchParams(`status=${status}`),
        },
      } as any;
      
      await GET(request);

      expect(mockQuery.eq).toHaveBeenCalledWith('status', status);
    });
  });

  describe('PATCH /api/tasks', () => {
    it('should update task status successfully', async () => {
      const taskId = '44444444-0001-0001-0001-000000000001';
      const newStatus = 'done';
      const updatedTask = {
        id: taskId,
        status: newStatus,
        title: 'Updated Task',
      };

      mockQuery.single.mockResolvedValue({
        data: updatedTask,
        error: null,
      });

      const { PATCH } = await import('@/app/api/tasks/route');
      const request = {
        json: async () => ({ id: taskId, status: newStatus }),
      } as any;

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe(newStatus);
    });

    it('should update task assignee', async () => {
      const taskId = '44444444-0001-0001-0001-000000000001';
      const userId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
      const updatedTask = {
        id: taskId,
        assigned_to: userId,
      };

      mockQuery.single.mockResolvedValue({
        data: updatedTask,
        error: null,
      });

      const { PATCH } = await import('@/app/api/tasks/route');
      const request = {
        json: async () => ({ id: taskId, assigned_to: userId }),
      } as any;

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.assigned_to).toBe(userId);
    });

    it('should handle update errors', async () => {
      const mockError = { message: 'Update failed' };
      mockQuery.single.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const { PATCH } = await import('@/app/api/tasks/route');
      const request = {
        json: async () => ({ id: 'invalid-id', status: 'done' }),
      } as any;

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });
});
