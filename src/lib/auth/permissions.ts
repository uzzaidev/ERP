import { createClient } from '@/lib/supabase/server';

/**
 * Check if a user has a specific role
 */
export async function hasRole(userId: string, tenantId: string, roleName: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_roles')
    .select('role:roles(name)')
    .eq('user_id', userId)
    .eq('tenant_id', tenantId)
    .single();

  if (error || !data) {
    return false;
  }

  // Supabase may return role as array or object
  const role = Array.isArray(data.role) ? data.role[0] : data.role;
  return role?.name === roleName;
}

/**
 * Check if a user is an admin
 */
export async function isAdmin(userId: string, tenantId: string): Promise<boolean> {
  return hasRole(userId, tenantId, 'admin');
}

/**
 * Check if a user has a specific permission
 */
export async function hasPermission(
  userId: string,
  tenantId: string,
  permissionCode: string
): Promise<boolean> {
  const supabase = await createClient();

  // Get user's roles
  const { data: userRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', userId)
    .eq('tenant_id', tenantId);

  if (rolesError || !userRoles || userRoles.length === 0) {
    return false;
  }

  const roleIds = userRoles.map(ur => ur.role_id);

  // Check if any of the user's roles have the permission
  const { data: rolePermissions, error: permError } = await supabase
    .from('role_permissions')
    .select('permission:permissions(code)')
    .in('role_id', roleIds);

  if (permError || !rolePermissions) {
    return false;
  }

  // Check if the permission exists in any of the role permissions
  return rolePermissions.some(rp => {
    const permission = Array.isArray(rp.permission) ? rp.permission[0] : rp.permission;
    return permission?.code === permissionCode;
  });
}

/**
 * Get all roles for a user in a tenant
 */
export async function getUserRoles(userId: string, tenantId: string): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_roles')
    .select('role:roles(name)')
    .eq('user_id', userId)
    .eq('tenant_id', tenantId);

  if (error || !data) {
    return [];
  }

  return data.map(item => {
    const role = Array.isArray(item.role) ? item.role[0] : item.role;
    return role?.name || '';
  }).filter(Boolean);
}

/**
 * Get all permissions for a user in a tenant
 */
export async function getUserPermissions(userId: string, tenantId: string): Promise<string[]> {
  const supabase = await createClient();

  // Get user's roles
  const { data: userRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', userId)
    .eq('tenant_id', tenantId);

  if (rolesError || !userRoles || userRoles.length === 0) {
    return [];
  }

  const roleIds = userRoles.map(ur => ur.role_id);

  // Get all permissions for these roles
  const { data: rolePermissions, error: permError } = await supabase
    .from('role_permissions')
    .select('permission:permissions(code)')
    .in('role_id', roleIds);

  if (permError || !rolePermissions) {
    return [];
  }

  const permissions = rolePermissions.map(rp => {
    const permission = Array.isArray(rp.permission) ? rp.permission[0] : rp.permission;
    return permission?.code || '';
  }).filter(Boolean);

  // Return unique permissions
  return [...new Set(permissions)];
}
