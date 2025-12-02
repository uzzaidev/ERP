-- ========================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- Multi-Tenant Architecture
-- ========================================
-- 
-- This file contains all Row Level Security policies for the multi-tenant ERP system.
-- RLS ensures that users can only access data belonging to their tenant.
--
-- IMPORTANT: Run this file AFTER all other migration files (00-04).
--
-- To apply these policies in Supabase:
-- 1. Enable RLS on all tables
-- 2. Create policies for each table
-- 3. Test with different users/tenants
--
-- ========================================

-- ========================================
-- 1. ENABLE RLS ON ALL TABLES
-- ========================================

-- Tenant tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_usage_stats ENABLE ROW LEVEL SECURITY;

-- User and auth tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Project tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;

-- Finance tables
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

-- Auxiliary tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 2. HELPER FUNCTIONS
-- ========================================

-- Function to get current user's tenant_id
CREATE OR REPLACE FUNCTION auth.get_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.users WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION auth.user_has_role(role_name TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND users.role_name = role_name
  )
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
  SELECT auth.user_has_role('admin')
$$ LANGUAGE SQL;

-- ========================================
-- 3. TENANT POLICIES
-- ========================================

-- Tenants: Users can only see their own tenant
CREATE POLICY "Users can view own tenant"
  ON tenants FOR SELECT
  USING (id = auth.get_user_tenant_id());

-- Tenants: Only admins can update their tenant
CREATE POLICY "Admins can update own tenant"
  ON tenants FOR UPDATE
  USING (id = auth.get_user_tenant_id() AND auth.is_admin());

-- Tenant invitations: Users can only see invitations for their tenant
CREATE POLICY "View tenant invitations"
  ON tenant_invitations FOR SELECT
  USING (tenant_id = auth.get_user_tenant_id());

-- Tenant invitations: Only admins can create invitations
CREATE POLICY "Admins can create invitations"
  ON tenant_invitations FOR INSERT
  WITH CHECK (tenant_id = auth.get_user_tenant_id() AND auth.is_admin());

-- Tenant usage stats: Users can view their tenant's usage
CREATE POLICY "View tenant usage stats"
  ON tenant_usage_stats FOR SELECT
  USING (tenant_id = auth.get_user_tenant_id());

-- ========================================
-- 4. USER POLICIES
-- ========================================

-- Users: Can view users in same tenant
CREATE POLICY "View users in same tenant"
  ON users FOR SELECT
  USING (tenant_id = auth.get_user_tenant_id());

-- Users: Admins can create users in their tenant
CREATE POLICY "Admins can create users"
  ON users FOR INSERT
  WITH CHECK (tenant_id = auth.get_user_tenant_id() AND auth.is_admin());

-- Users: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Audit logs: View logs in same tenant
CREATE POLICY "View audit logs in same tenant"
  ON audit_logs FOR SELECT
  USING (tenant_id = auth.get_user_tenant_id());

-- ========================================
-- 5. PROJECT POLICIES
-- ========================================

-- Projects: View projects in same tenant
CREATE POLICY "View projects in same tenant"
  ON projects FOR SELECT
  USING (tenant_id = auth.get_user_tenant_id());

-- Projects: Create projects in own tenant
CREATE POLICY "Create projects in own tenant"
  ON projects FOR INSERT
  WITH CHECK (tenant_id = auth.get_user_tenant_id());

-- Projects: Update own projects
CREATE POLICY "Update projects in same tenant"
  ON projects FOR UPDATE
  USING (tenant_id = auth.get_user_tenant_id());

-- Projects: Delete own projects (admin only)
CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  USING (tenant_id = auth.get_user_tenant_id() AND auth.is_admin());

-- Sprints: Tenant isolation
CREATE POLICY "Sprints tenant isolation"
  ON sprints FOR ALL
  USING (tenant_id = auth.get_user_tenant_id())
  WITH CHECK (tenant_id = auth.get_user_tenant_id());

-- Tasks: Tenant isolation
CREATE POLICY "Tasks tenant isolation"
  ON tasks FOR ALL
  USING (tenant_id = auth.get_user_tenant_id())
  WITH CHECK (tenant_id = auth.get_user_tenant_id());

-- Tags: Tenant isolation
CREATE POLICY "Tags tenant isolation"
  ON tags FOR ALL
  USING (tenant_id = auth.get_user_tenant_id())
  WITH CHECK (tenant_id = auth.get_user_tenant_id());

-- Task tags: Tenant isolation
CREATE POLICY "Task tags tenant isolation"
  ON task_tags FOR ALL
  USING (tenant_id = auth.get_user_tenant_id())
  WITH CHECK (tenant_id = auth.get_user_tenant_id());

-- Task comments: Tenant isolation
CREATE POLICY "Task comments tenant isolation"
  ON task_comments FOR ALL
  USING (tenant_id = auth.get_user_tenant_id())
  WITH CHECK (tenant_id = auth.get_user_tenant_id());

-- Task time logs: Tenant isolation
CREATE POLICY "Task time logs tenant isolation"
  ON task_time_logs FOR ALL
  USING (tenant_id = auth.get_user_tenant_id())
  WITH CHECK (tenant_id = auth.get_user_tenant_id());

-- Task attachments: Tenant isolation
CREATE POLICY "Task attachments tenant isolation"
  ON task_attachments FOR ALL
  USING (tenant_id = auth.get_user_tenant_id())
  WITH CHECK (tenant_id = auth.get_user_tenant_id());

-- ========================================
-- 6. FINANCE POLICIES
-- ========================================

-- Bank accounts: Tenant isolation
CREATE POLICY "Bank accounts tenant isolation"
  ON bank_accounts FOR ALL
  USING (tenant_id = auth.get_user_tenant_id())
  WITH CHECK (tenant_id = auth.get_user_tenant_id());

-- Transactions: Tenant isolation
CREATE POLICY "Transactions tenant isolation"
  ON transactions FOR ALL
  USING (tenant_id = auth.get_user_tenant_id())
  WITH CHECK (tenant_id = auth.get_user_tenant_id());

-- Invoices: Tenant isolation
CREATE POLICY "Invoices tenant isolation"
  ON invoices FOR ALL
  USING (tenant_id = auth.get_user_tenant_id())
  WITH CHECK (tenant_id = auth.get_user_tenant_id());

-- Invoice items: Tenant isolation
CREATE POLICY "Invoice items tenant isolation"
  ON invoice_items FOR ALL
  USING (tenant_id = auth.get_user_tenant_id())
  WITH CHECK (tenant_id = auth.get_user_tenant_id());

-- Documents: Tenant isolation
CREATE POLICY "Documents tenant isolation"
  ON documents FOR ALL
  USING (tenant_id = auth.get_user_tenant_id())
  WITH CHECK (tenant_id = auth.get_user_tenant_id());

-- Budgets: Tenant isolation
CREATE POLICY "Budgets tenant isolation"
  ON budgets FOR ALL
  USING (tenant_id = auth.get_user_tenant_id())
  WITH CHECK (tenant_id = auth.get_user_tenant_id());

-- Budget items: Tenant isolation
CREATE POLICY "Budget items tenant isolation"
  ON budget_items FOR ALL
  USING (tenant_id = auth.get_user_tenant_id())
  WITH CHECK (tenant_id = auth.get_user_tenant_id());

-- ========================================
-- 7. AUXILIARY TABLE POLICIES
-- ========================================

-- Notifications: Tenant isolation
CREATE POLICY "Notifications tenant isolation"
  ON notifications FOR ALL
  USING (tenant_id = auth.get_user_tenant_id())
  WITH CHECK (tenant_id = auth.get_user_tenant_id());

-- User notifications: Only own notifications
CREATE POLICY "User notifications for current user"
  ON user_notifications FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- User settings: Only own settings
CREATE POLICY "User settings for current user"
  ON user_settings FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Webhooks: Tenant isolation (admin only)
CREATE POLICY "Webhooks for admins"
  ON webhooks FOR ALL
  USING (tenant_id = auth.get_user_tenant_id() AND auth.is_admin())
  WITH CHECK (tenant_id = auth.get_user_tenant_id() AND auth.is_admin());

-- Webhook events: Tenant isolation
CREATE POLICY "Webhook events tenant isolation"
  ON webhook_events FOR SELECT
  USING (tenant_id = auth.get_user_tenant_id());

-- API keys: Tenant isolation (admin only)
CREATE POLICY "API keys for admins"
  ON api_keys FOR ALL
  USING (tenant_id = auth.get_user_tenant_id() AND auth.is_admin())
  WITH CHECK (tenant_id = auth.get_user_tenant_id() AND auth.is_admin());

-- Email templates: Tenant isolation
CREATE POLICY "Email templates tenant isolation"
  ON email_templates FOR ALL
  USING (tenant_id = auth.get_user_tenant_id())
  WITH CHECK (tenant_id = auth.get_user_tenant_id());

-- Recurring transactions: Tenant isolation
CREATE POLICY "Recurring transactions tenant isolation"
  ON recurring_transactions FOR ALL
  USING (tenant_id = auth.get_user_tenant_id())
  WITH CHECK (tenant_id = auth.get_user_tenant_id());

-- ========================================
-- 8. ROLES AND PERMISSIONS (GLOBAL)
-- ========================================

-- Roles: Everyone can view (needed for dropdowns)
CREATE POLICY "Everyone can view roles"
  ON roles FOR SELECT
  USING (true);

-- Permissions: Everyone can view
CREATE POLICY "Everyone can view permissions"
  ON permissions FOR SELECT
  USING (true);

-- User roles: View own tenant's user roles
CREATE POLICY "View user roles in tenant"
  ON user_roles FOR SELECT
  USING (tenant_id = auth.get_user_tenant_id());

-- User roles: Admins can manage
CREATE POLICY "Admins can manage user roles"
  ON user_roles FOR ALL
  USING (tenant_id = auth.get_user_tenant_id() AND auth.is_admin())
  WITH CHECK (tenant_id = auth.get_user_tenant_id() AND auth.is_admin());

-- Role permissions: Everyone can view
CREATE POLICY "Everyone can view role permissions"
  ON role_permissions FOR SELECT
  USING (true);

-- ========================================
-- NOTES
-- ========================================
--
-- 1. These policies ensure complete tenant isolation
-- 2. Users can only see/modify data in their tenant
-- 3. Admin users have additional privileges within their tenant
-- 4. Roles and permissions are global (not tenant-specific)
-- 5. Some tables like user_notifications are user-specific, not tenant-specific
--
-- TESTING:
-- - Create users in different tenants
-- - Verify users cannot see each other's data
-- - Verify admins can manage their tenant but not others
-- - Test with different roles (admin, gestor, dev, etc.)
--
-- ========================================
