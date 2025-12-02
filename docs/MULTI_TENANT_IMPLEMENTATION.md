# Multi-Tenant Architecture Implementation

## Overview
This document describes the multi-tenant architecture implemented for the ERP UzzAI system. The implementation allows multiple companies (tenants) to use the system independently with complete data isolation.

## Architecture

### Database Schema

#### Core Multi-Tenant Tables

**1. tenants (Companies/Organizations)**
- Stores company information, branding, settings, and subscription details
- Each tenant represents an independent organization using the system
- Includes subscription management (plan, status, limits)
- Sample data includes 3 tenants: UzzAI Technologies, Empresa Demo A, and Startup Beta

```sql
Key fields:
- id: Unique tenant identifier
- name: Company name
- slug: URL-friendly identifier
- plan: trial, basic, professional, enterprise
- status: active, suspended, cancelled
- max_users, max_projects, storage_limit_mb: Plan limits
```

**2. tenant_invitations**
- Manages user invitation flow
- Token-based system for secure invitations
- Includes role assignment at invitation time
- Tracks invitation status and expiration

```sql
Key fields:
- tenant_id: Reference to tenant
- email: Invited user email
- role_name: Role to assign (admin, gestor, financeiro, dev, juridico)
- token: Unique invitation token
- status: pending, accepted, expired, cancelled
- expires_at: Invitation expiration timestamp
```

**3. tenant_usage_stats**
- Tracks current usage metrics per tenant
- Enables enforcement of subscription limits
- Updated periodically to reflect current state

```sql
Tracked metrics:
- users_count
- projects_count
- tasks_count
- storage_used_mb
```

#### Data Isolation Strategy

**All application tables include `tenant_id`:**
- users, user_roles, audit_logs
- projects, project_members, sprints, tasks, tags
- transactions, invoices, documents, budgets
- notifications, activity_feed, favorites, webhooks

**Unique Constraints:**
- Codes and identifiers are unique within a tenant
- Examples: `UNIQUE(tenant_id, code)` for projects, tasks, transactions
- Email is unique within a tenant: `UNIQUE(tenant_id, email)` for users

**Indexes:**
- All tenant_id columns are indexed
- Composite indexes on (tenant_id, commonly_filtered_column)
- Ensures optimal query performance with tenant filtering

### TypeScript Types

#### Multi-Tenant Interfaces

```typescript
// Tenant (Company)
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: TenantPlan; // trial | basic | professional | enterprise
  status: TenantStatus; // active | suspended | cancelled
  maxUsers: number;
  maxProjects: number;
  storageLimitMb: number;
  // ... branding, settings, metadata
}

// Tenant Invitation
export interface TenantInvitation {
  id: string;
  tenantId: string;
  email: string;
  roleName: string;
  token: string;
  status: InvitationStatus; // pending | accepted | expired | cancelled
  expiresAt: string;
  // ... metadata
}

// User (with tenant relationship)
export interface User {
  id: string;
  tenantId: string; // REQUIRED for data isolation
  email: string;
  fullName: string;
  // ... other fields
}
```

#### Updated Entity Interfaces

All existing entity interfaces now include:
- `tenantId: string` (REQUIRED, not optional)
- Ensures proper data isolation at type level
- Prevents accidental data leakage between tenants

## User Invitation Flow

### Process
1. **Admin invites user**
   - Admin specifies email and role
   - System generates unique invitation token
   - Invitation email sent with link containing token
   - Expiration set (e.g., 7 days)

2. **User accepts invitation**
   - User clicks link with token
   - System validates token and expiration
   - User creates account/sets password
   - User automatically assigned to tenant with specified role

3. **Limit enforcement**
   - System checks tenant usage before accepting invitation
   - Rejects if tenant has reached user limit
   - Admin must upgrade plan to add more users

### Security Considerations
- Tokens are cryptographically secure (generated with `gen_random_bytes`)
- One-time use (status changed to 'accepted' after use)
- Time-limited expiration
- Duplicate prevention: UNIQUE(tenant_id, email, status)

## Mock Data Structure

### Tenant 1: UzzAI Technologies
- Plan: enterprise (50 users, 100 projects)
- Users: Luis (admin), Maria (gestor), João (dev), Ana (financeiro), Pedro (juridico)
- Projects: 3 active projects
- Tasks: 10 tasks across projects

### Tenant 2: Empresa Demo A  
- Plan: professional (20 users, 50 projects)
- Users: Carlos (admin), Paula (gestor), Roberto (financeiro)
- Demonstrates separate data isolation

### Tenant 3: Startup Beta
- Plan: basic (10 users, 20 projects)
- Users: Felipe (admin), Julia (dev)
- Shows smallest plan configuration

## Next Steps (Implementation Priorities)

### 1. API Middleware (HIGH PRIORITY)
Create tenant context middleware to:
- Extract tenant_id from authenticated session
- Validate user belongs to tenant
- Inject tenant_id into all database queries
- Prevent cross-tenant data access

### 2. API Route Updates (HIGH PRIORITY)
Update all API routes to:
- Filter queries by tenant_id
- Validate tenant_id matches authenticated user
- Return 403 Forbidden for cross-tenant access attempts

Example:
```typescript
// Before
const projects = await supabase.from('projects').select('*');

// After (with tenant context)
const projects = await supabase
  .from('projects')
  .select('*')
  .eq('tenant_id', tenantId);
```

### 3. Authentication Enhancement (MEDIUM PRIORITY)
- Store tenant_id in JWT/session
- Create tenant selection UI (if user belongs to multiple tenants)
- Implement invitation acceptance flow
- Add tenant switching capability

### 4. React Context/Hooks (MEDIUM PRIORITY)
```typescript
// Tenant context hook
const { tenant, tenantId } = useTenant();

// Usage in components
const { data: projects } = useQuery({
  queryKey: ['projects', tenantId],
  queryFn: () => api.projects.list(tenantId)
});
```

### 5. Admin Dashboard (LOW PRIORITY)
- Tenant management UI
- User invitation interface
- Usage statistics display
- Subscription plan management

### 6. Testing (HIGH PRIORITY)
- Tenant isolation tests
- Invitation flow tests
- Cross-tenant access prevention tests
- Load tests with multiple tenants

## Security Checklist

✅ Database Level:
- [x] tenant_id on all tables
- [x] Proper foreign key constraints
- [x] Unique constraints per tenant
- [x] Indexes for performance

✅ Type Safety:
- [x] tenantId required (not optional)
- [x] Type definitions for all multi-tenant entities

⚠️ Application Level (TODO):
- [ ] Tenant context middleware
- [ ] API route tenant filtering
- [ ] Cross-tenant access prevention
- [ ] Audit logging of tenant access

⚠️ Testing (TODO):
- [ ] Integration tests for data isolation
- [ ] Security tests for cross-tenant access
- [ ] Load tests with multiple tenants

## Migration Path (For Existing Data)

If migrating from single-tenant to multi-tenant:

1. Create default tenant
2. Add tenant_id column to all tables (nullable initially)
3. Update existing data with default tenant_id
4. Make tenant_id NOT NULL
5. Add indexes and constraints
6. Update application code
7. Test thoroughly before production

## Performance Considerations

- **Indexes**: All tenant_id columns indexed
- **Query Patterns**: Always include tenant_id in WHERE clauses
- **Caching**: Cache tenant data to reduce lookups
- **Partitioning**: Consider table partitioning by tenant_id for very large datasets

## Monitoring and Observability

Key metrics to track:
- Tenant count and growth
- Users per tenant (distribution)
- Storage usage per tenant
- API request patterns by tenant
- Cross-tenant access attempts (security)

## Support and Maintenance

### Common Operations

**Adding a new tenant:**
```sql
INSERT INTO tenants (name, slug, plan, status, max_users, max_projects)
VALUES ('New Company', 'new-company', 'trial', 'active', 5, 10);
```

**Inviting a user:**
```sql
INSERT INTO tenant_invitations (tenant_id, email, role_name, token, expires_at)
VALUES (
  '...',
  'user@example.com',
  'admin',
  encode(gen_random_bytes(32), 'base64'),
  NOW() + INTERVAL '7 days'
);
```

**Checking tenant usage:**
```sql
SELECT t.name, tus.*
FROM tenants t
JOIN tenant_usage_stats tus ON t.id = tus.tenant_id
WHERE t.id = '...';
```

## Troubleshooting

### Issue: User can't see data
- Check user's tenant_id matches data's tenant_id
- Verify user session includes correct tenant_id
- Check API queries include tenant_id filter

### Issue: Invitation not working
- Verify token hasn't expired
- Check invitation status (must be 'pending')
- Ensure tenant hasn't reached user limit

### Issue: Performance degradation
- Check tenant_id indexes exist
- Verify queries include tenant_id in WHERE clause
- Consider caching tenant data

## Conclusion

The multi-tenant architecture is now fully implemented at the database and type level. The foundation is solid and secure, with proper data isolation mechanisms in place. The next phase focuses on implementing the application-level logic (APIs, authentication, UI) to make the system fully functional.

## References

- Database schemas: `/db/00_tenants.sql`, `/db/01_users_and_auth.sql`, etc.
- TypeScript types: `/src/types/entities.ts`
- Original issue: Multi-tenant requirements (Portuguese)
