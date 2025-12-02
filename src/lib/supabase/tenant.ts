import { createClient } from './server';

/**
 * Tenant context type
 */
export interface TenantContext {
  tenantId: string;
  userId: string;
  user: {
    id: string;
    tenant_id: string;
    email: string;
    full_name: string;
    tenant?: {
      id: string;
      name: string;
      slug: string;
      plan: string;
      status: string;
      max_users: number;
      max_projects: number;
    };
  };
}

/**
 * Get tenant context from authenticated session
 * Extracts tenant_id from the user's database record
 * 
 * @throws Error if user is not authenticated or tenant not found
 */
export async function getTenantContext(): Promise<TenantContext> {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error('Not authenticated');
  }

  // Fetch user's tenant_id from users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('tenant_id, tenant:tenants(*)')
    .eq('id', user.id)
    .single();

  if (userError || !userData || !userData.tenant_id) {
    throw new Error('Tenant not found for user');
  }

  return {
    tenantId: userData.tenant_id,
    userId: user.id,
    user: userData,
  };
}

/**
 * Validate that a resource belongs to the user's tenant
 * 
 * @param resourceTenantId The tenant_id of the resource
 * @param userTenantId The tenant_id of the current user
 * @throws Error if tenant_ids don't match
 */
export function validateTenantAccess(resourceTenantId: string, userTenantId: string) {
  if (resourceTenantId !== userTenantId) {
    throw new Error('Access denied: resource belongs to different tenant');
  }
}

/**
 * Check if user has reached tenant limits
 */
export async function checkTenantLimits(tenantId: string): Promise<{
  canAddUser: boolean;
  canAddProject: boolean;
  currentUsage: {
    users_count: number;
    projects_count: number;
    tasks_count: number;
    storage_used_mb: number;
  };
}> {
  const supabase = await createClient();

  // Get tenant limits
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('max_users, max_projects, status')
    .eq('id', tenantId)
    .single();

  if (tenantError || !tenant) {
    throw new Error('Tenant not found');
  }

  if (tenant.status !== 'active') {
    throw new Error('Tenant is not active');
  }

  // Get current usage
  const { data: usage, error: usageError } = await supabase
    .from('tenant_usage_stats')
    .select('*')
    .eq('tenant_id', tenantId)
    .single();

  if (usageError || !usage) {
    // Initialize usage stats if not exists
    return {
      canAddUser: true,
      canAddProject: true,
      currentUsage: { 
        users_count: 0, 
        projects_count: 0, 
        tasks_count: 0, 
        storage_used_mb: 0 
      },
    };
  }

  return {
    canAddUser: usage.users_count < tenant.max_users,
    canAddProject: usage.projects_count < tenant.max_projects,
    currentUsage: usage,
  };
}

/**
 * Update tenant usage statistics
 */
export async function updateTenantUsage(tenantId: string) {
  const supabase = await createClient();

  // Count current usage
  const [usersResult, projectsResult, tasksResult] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
  ]);

  const usersCount = usersResult.count || 0;
  const projectsCount = projectsResult.count || 0;
  const tasksCount = tasksResult.count || 0;

  // Upsert usage stats
  const { error } = await supabase
    .from('tenant_usage_stats')
    .upsert({
      tenant_id: tenantId,
      users_count: usersCount,
      projects_count: projectsCount,
      tasks_count: tasksCount,
      last_calculated_at: new Date().toISOString(),
    }, {
      onConflict: 'tenant_id',
    });

  if (error) {
    console.error('Error updating tenant usage:', error);
  }

  return { usersCount, projectsCount, tasksCount };
}
