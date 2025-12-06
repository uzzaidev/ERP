import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';
import { handleApiError } from '@/lib/api-errors';

interface VelocityDataPoint {
  sprintCode: string;
  sprintName: string;
  startDate: string;
  endDate: string;
  planned: number;
  completed: number;
  velocity: number;
}

export async function GET(request: NextRequest) {
  try {
    const { tenantId } = await getTenantContext();
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    
    // Get query parameters
    const projectId = searchParams.get('project_id');
    const limit = parseInt(searchParams.get('limit') || '6', 10); // Default to last 6 sprints

    // Build query for completed sprints
    let query = supabase
      .from('sprints')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', 'completed')
      .order('end_date', { ascending: false })
      .limit(limit);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data: sprints, error: sprintsError } = await query;

    if (sprintsError) {
      return NextResponse.json(
        { success: false, error: sprintsError.message },
        { status: 500 }
      );
    }

    if (!sprints || sprints.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          velocityData: [],
          metrics: {
            avgVelocity: 0,
            avgPlanned: 0,
            avgCompleted: 0,
            totalSprints: 0,
          },
        },
      });
    }

    // Get tasks for all sprints
    const sprintIds = sprints.map(s => s.id);
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, sprint_id, estimated_hours, status')
      .in('sprint_id', sprintIds)
      .eq('tenant_id', tenantId);

    if (tasksError) {
      return NextResponse.json(
        { success: false, error: tasksError.message },
        { status: 500 }
      );
    }

    // Calculate velocity for each sprint
    const velocityData: VelocityDataPoint[] = sprints.map(sprint => {
      const sprintTasks = tasks?.filter(t => t.sprint_id === sprint.id) || [];
      const planned = sprintTasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0);
      const completed = sprintTasks
        .filter(task => task.status === 'done')
        .reduce((sum, task) => sum + (task.estimated_hours || 0), 0);
      
      const velocity = planned > 0 ? Math.round((completed / planned) * 100) : 0;

      return {
        sprintCode: sprint.code,
        sprintName: sprint.name,
        startDate: sprint.start_date,
        endDate: sprint.end_date,
        planned: Math.round(planned * 100) / 100,
        completed: Math.round(completed * 100) / 100,
        velocity,
      };
    }).reverse(); // Reverse to show oldest first (chronological order)

    // Calculate average metrics
    const totalSprints = velocityData.length;
    const avgPlanned = totalSprints > 0
      ? Math.round((velocityData.reduce((sum, s) => sum + s.planned, 0) / totalSprints) * 100) / 100
      : 0;
    const avgCompleted = totalSprints > 0
      ? Math.round((velocityData.reduce((sum, s) => sum + s.completed, 0) / totalSprints) * 100) / 100
      : 0;
    const avgVelocity = totalSprints > 0
      ? Math.round(velocityData.reduce((sum, s) => sum + s.velocity, 0) / totalSprints)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        velocityData,
        metrics: {
          avgVelocity,
          avgPlanned,
          avgCompleted,
          totalSprints,
          trend: calculateTrend(velocityData),
        },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// Calculate trend (improving, stable, declining)
function calculateTrend(data: VelocityDataPoint[]): 'improving' | 'stable' | 'declining' {
  if (data.length < 2) return 'stable';
  
  const recentCount = Math.min(3, data.length);
  const recent = data.slice(-recentCount);
  const older = data.slice(0, -recentCount);
  
  if (older.length === 0) return 'stable';
  
  const recentAvg = recent.reduce((sum, s) => sum + s.velocity, 0) / recent.length;
  const olderAvg = older.reduce((sum, s) => sum + s.velocity, 0) / older.length;
  
  const diff = recentAvg - olderAvg;
  
  if (diff > 5) return 'improving';
  if (diff < -5) return 'declining';
  return 'stable';
}
