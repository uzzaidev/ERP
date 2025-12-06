import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';
import { handleApiError } from '@/lib/api-errors';

interface BurndownDataPoint {
  date: string;
  ideal: number;
  actual: number;
  completed: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { tenantId } = await getTenantContext();
    const supabase = await createClient();
    const { id: sprintId } = await params;

    // Get sprint details
    const { data: sprint, error: sprintError } = await supabase
      .from('sprints')
      .select('*')
      .eq('id', sprintId)
      .eq('tenant_id', tenantId)
      .single();

    if (sprintError || !sprint) {
      return NextResponse.json(
        { success: false, error: 'Sprint não encontrada' },
        { status: 404 }
      );
    }

    // Get all tasks for this sprint
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, estimated_hours, completed_hours, status, completed_at')
      .eq('sprint_id', sprintId)
      .eq('tenant_id', tenantId);

    if (tasksError) {
      return NextResponse.json(
        { success: false, error: tasksError.message },
        { status: 500 }
      );
    }

    // Calculate burndown data
    const startDate = new Date(sprint.start_date);
    const endDate = new Date(sprint.end_date);
    const today = new Date();
    const currentDate = today < endDate ? today : endDate;

    // Total estimated hours for the sprint
    const totalHours = tasks?.reduce((sum, task) => sum + (task.estimated_hours || 0), 0) || 0;

    // Generate daily data points
    const burndownData: BurndownDataPoint[] = [];
    const currentDateObj = new Date(startDate);
    
    // Calculate total working days (excluding weekends)
    const totalDays = calculateWorkingDays(startDate, endDate);
    const dailyIdealBurn = totalHours / totalDays;

    let dayIndex = 0;
    while (currentDateObj <= currentDate) {
      const dateStr = currentDateObj.toISOString().split('T')[0];
      
      // Calculate ideal remaining hours
      const idealRemaining = Math.max(0, totalHours - (dayIndex * dailyIdealBurn));

      // Calculate actual completed hours by this date
      let completedHoursByDate = 0;
      const isLastPoint = currentDateObj.toISOString().split('T')[0] === currentDate.toISOString().split('T')[0];

      tasks?.forEach(task => {
        if (task.status === 'done' && task.completed_at) {
          // For done tasks, count completed_hours if completed by this date
          const completedDate = new Date(task.completed_at);
          completedDate.setHours(0, 0, 0, 0);
          const compareDate = new Date(currentDateObj);
          compareDate.setHours(23, 59, 59, 999);

          if (completedDate <= compareDate) {
            completedHoursByDate += task.completed_hours || task.estimated_hours || 0;
          }
        } else if (isLastPoint) {
          // For in-progress/todo tasks, count completed_hours only on the last point (today)
          completedHoursByDate += task.completed_hours || 0;
        }
      });

      const actualRemaining = Math.max(0, totalHours - completedHoursByDate);

      burndownData.push({
        date: dateStr,
        ideal: Math.round(idealRemaining * 100) / 100,
        actual: Math.round(actualRemaining * 100) / 100,
        completed: Math.round(completedHoursByDate * 100) / 100,
      });

      // Move to next day
      currentDateObj.setDate(currentDateObj.getDate() + 1);
      if (isWeekday(currentDateObj)) {
        dayIndex++;
      }
    }

    // Add projection to end date if sprint is active
    if (today < endDate && burndownData.length > 0) {
      const lastPoint = burndownData[burndownData.length - 1];
      const remainingDays = calculateWorkingDays(currentDateObj, endDate);
      
      // Simple linear projection
      if (remainingDays > 0 && burndownData.length > 1) {
        const recentDays = Math.min(3, burndownData.length - 1);
        const recentBurn = burndownData[burndownData.length - 1].actual - 
                          burndownData[burndownData.length - 1 - recentDays].actual;
        const avgDailyBurn = Math.abs(recentBurn) / recentDays;
        
        // Add projection point at end date
        burndownData.push({
          date: endDate.toISOString().split('T')[0],
          ideal: 0,
          actual: Math.max(0, lastPoint.actual - (avgDailyBurn * remainingDays)),
          completed: totalHours - Math.max(0, lastPoint.actual - (avgDailyBurn * remainingDays)),
        });
      }
    }

    // Calculate total completed hours (from all tasks, not just done)
    const totalCompletedHours = tasks?.reduce((sum, task) =>
      sum + (task.completed_hours || 0), 0) || 0;

    return NextResponse.json({
      success: true,
      data: {
        sprint: {
          id: sprint.id,
          code: sprint.code,
          name: sprint.name,
          start_date: sprint.start_date,
          end_date: sprint.end_date,
          status: sprint.status,
        },
        totalHours,
        completedHours: totalCompletedHours,
        burndownData,
        metrics: {
          totalTasks: tasks?.length || 0,
          completedTasks: tasks?.filter(t => t.status === 'done').length || 0,
          progressPercentage: totalHours > 0
            ? Math.round((totalCompletedHours / totalHours) * 100)
            : 0,
        },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// Helper function to check if date is a weekday
function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6; // 0 = Sunday, 6 = Saturday
}

// Helper function to calculate working days between two dates
function calculateWorkingDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    if (isWeekday(current)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}
