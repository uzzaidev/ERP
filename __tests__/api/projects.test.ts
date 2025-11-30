import { createClient } from '@/lib/supabase/server';

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
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

describe('/api/projects', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
    };
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/projects', () => {
    it('should return projects successfully', async () => {
      const mockProjects = [
        {
          id: '22222222-0001-0001-0001-000000000001',
          code: 'PROJ-001',
          name: 'Test Project',
          status: 'active',
          project_members: [],
        },
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockProjects,
        error: null,
      });

      const { GET } = await import('@/app/api/projects/route');
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockProjects);
      expect(mockSupabase.from).toHaveBeenCalledWith('projects');
    });

    it('should handle database errors', async () => {
      const mockError = { message: 'Database connection failed' };
      mockSupabase.order.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const { GET } = await import('@/app/api/projects/route');
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Database connection failed');
    });

    it('should return empty array when no projects exist', async () => {
      mockSupabase.order.mockResolvedValue({
        data: [],
        error: null,
      });

      const { GET } = await import('@/app/api/projects/route');
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });
  });
});
