# Multi-Tenant API Implementation - Usage Guide

## Overview
This document explains how to use the newly implemented multi-tenant API layer and React hooks.

## React Hooks Usage

### 1. Setting Up TenantProvider

Wrap your application with the TenantProvider (usually in your root layout):

```tsx
// app/layout.tsx or app/(auth)/layout.tsx
import { TenantProvider } from '@/lib/hooks';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <TenantProvider>
          {children}
        </TenantProvider>
      </body>
    </html>
  );
}
```

### 2. Using useTenant Hook

Access tenant context in any component:

```tsx
'use client';

import { useTenant } from '@/lib/hooks';

function MyComponent() {
  const { tenant, tenantId, user, isLoading, error } = useTenant();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Welcome to {tenant?.name}</h1>
      <p>User: {user?.full_name}</p>
      <p>Plan: {tenant?.plan}</p>
    </div>
  );
}
```

### 3. Using useTenantId Hook

Get tenant ID directly (throws if not loaded):

```tsx
import { useTenantId } from '@/lib/hooks';
import { useQuery } from '@tanstack/react-query';

function ProjectsList() {
  const tenantId = useTenantId();

  const { data: projects } = useQuery({
    queryKey: ['projects', tenantId],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      const result = await response.json();
      return result.data;
    },
  });

  // Projects are automatically filtered by tenant_id on the server
  return <div>{/* render projects */}</div>;
}
```

### 4. Checking Tenant Limits

```tsx
import { useTenantLimits } from '@/lib/hooks';

function InviteUserButton() {
  const { canAddUser, currentUsage, isLoading } = useTenantLimits();

  return (
    <button disabled={!canAddUser || isLoading}>
      {canAddUser ? 'Invite User' : 'User limit reached'}
    </button>
  );
}
```

## API Endpoints

### Tenant Management

**Get Tenant Details**
```typescript
GET /api/tenants/[id]

// Response
{
  success: true,
  data: {
    id: string,
    name: string,
    slug: string,
    plan: 'trial' | 'basic' | 'professional' | 'enterprise',
    status: 'active' | 'suspended' | 'cancelled',
    max_users: number,
    max_projects: number,
    // ... other fields
  }
}
```

**Update Tenant Settings**
```typescript
PATCH /api/tenants/[id]
Content-Type: application/json

{
  name: "New Company Name",
  phone: "+55 11 99999-9999",
  primary_color: "#1ABC9C"
}

// Response
{
  success: true,
  data: { /* updated tenant */ }
}
```

**Check Tenant Limits**
```typescript
GET /api/tenants/[id]/limits

// Response
{
  success: true,
  data: {
    canAddUser: true,
    canAddProject: false,
    currentUsage: {
      users_count: 5,
      projects_count: 20,
      tasks_count: 150
    }
  }
}
```

### User Invitations

**Create Invitation**
```typescript
POST /api/tenants/invitations
Content-Type: application/json

{
  email: "newuser@example.com",
  role_name: "admin", // admin, gestor, financeiro, dev, juridico
  message: "Welcome to our team!" // optional
}

// Response
{
  success: true,
  data: {
    id: string,
    email: string,
    token: string,
    invitation_link: "http://app.com/accept-invitation?token=xxx",
    expires_at: string
  }
}
```

**List Invitations**
```typescript
GET /api/tenants/invitations

// Response
{
  success: true,
  data: [
    {
      id: string,
      email: string,
      role_name: string,
      status: 'pending' | 'accepted' | 'expired' | 'cancelled',
      created_at: string,
      expires_at: string,
      invited_by_user: {
        full_name: string,
        email: string
      }
    }
  ]
}
```

**Validate Invitation**
```typescript
GET /api/invitations/accept?token=xxx

// Response
{
  success: true,
  data: {
    email: string,
    role_name: string,
    tenant: {
      name: string,
      slug: string
    },
    expires_at: string
  }
}
```

**Accept Invitation**
```typescript
POST /api/invitations/accept
Content-Type: application/json

{
  token: "invitation-token-here",
  password: "secure-password",
  full_name: "John Doe"
}

// Response
{
  success: true,
  data: {
    user: { /* auth user */ },
    tenant_id: string
  }
}
```

### Data Access APIs

All data APIs automatically filter by tenant_id:

**Projects**
```typescript
GET /api/projects
// Returns only projects for authenticated user's tenant
```

**Tasks**
```typescript
GET /api/tasks?project_id=xxx&status=in-progress
// Returns only tasks for authenticated user's tenant

PATCH /api/tasks
{
  id: "task-id",
  status: "done"
}
// Can only update tasks belonging to user's tenant
```

**Sprints, Tags, Users**
```typescript
GET /api/sprints
GET /api/tags
GET /api/users
// All automatically filtered by tenant_id
```

## Frontend Implementation Examples

### Admin: Invite User Page

```tsx
'use client';

import { useState } from 'react';
import { useTenantLimits } from '@/lib/hooks';

export default function InviteUserPage() {
  const { canAddUser, currentUsage } = useTenantLimits();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('dev');
  const [invitationLink, setInvitationLink] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canAddUser) {
      alert('User limit reached. Please upgrade your plan.');
      return;
    }

    const response = await fetch('/api/tenants/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        role_name: role,
      }),
    });

    const result = await response.json();

    if (result.success) {
      setInvitationLink(result.data.invitation_link);
      alert('Invitation created successfully!');
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  return (
    <div>
      <h1>Invite User</h1>
      
      <p>
        Current usage: {currentUsage?.users_count} users
        {!canAddUser && ' (Limit reached)'}
      </p>

      <form onSubmit={handleInvite}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="admin">Admin</option>
          <option value="gestor">Gestor</option>
          <option value="financeiro">Financeiro</option>
          <option value="dev">Desenvolvedor</option>
          <option value="juridico">Jurídico</option>
        </select>

        <button type="submit" disabled={!canAddUser}>
          Send Invitation
        </button>
      </form>

      {invitationLink && (
        <div>
          <h2>Invitation Link</h2>
          <input type="text" value={invitationLink} readOnly />
          <button onClick={() => navigator.clipboard.writeText(invitationLink)}>
            Copy Link
          </button>
        </div>
      )}
    </div>
  );
}
```

### Accept Invitation Page

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [invitation, setInvitation] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    // Validate token
    fetch(`/api/invitations/accept?token=${token}`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setInvitation(result.data);
        } else {
          alert(result.error);
          router.push('/login');
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/invitations/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        full_name: fullName,
        password,
      }),
    });

    const result = await response.json();

    if (result.success) {
      alert('Account created successfully!');
      router.push('/dashboard');
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!invitation) return <div>Invalid invitation</div>;

  return (
    <div>
      <h1>Accept Invitation</h1>
      <p>You've been invited to join: <strong>{invitation.tenant.name}</strong></p>
      <p>Email: {invitation.email}</p>
      <p>Role: {invitation.role_name}</p>

      <form onSubmit={handleAccept}>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full Name"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />

        <button type="submit">Create Account</button>
      </form>
    </div>
  );
}
```

### Display Projects with Tenant Context

```tsx
'use client';

import { useTenant } from '@/lib/hooks';
import { useQuery } from '@tanstack/react-query';

export default function ProjectsPage() {
  const { tenant, isLoading: tenantLoading } = useTenant();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      const result = await response.json();
      return result.data;
    },
    enabled: !tenantLoading, // Wait for tenant to load
  });

  if (tenantLoading || isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{tenant?.name} - Projects</h1>
      
      <div>
        {projects?.map((project: any) => (
          <div key={project.id}>
            <h2>{project.name}</h2>
            <p>{project.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Security Notes

1. **All API routes automatically enforce tenant isolation**
   - No manual tenant_id filtering needed in queries
   - Cross-tenant access blocked (403 Forbidden)

2. **Authentication required**
   - All tenant APIs return 401 if not authenticated
   - Use Supabase session for auth

3. **Invitation tokens are secure**
   - Cryptographically generated (32 bytes)
   - One-time use (status changes to 'accepted')
   - 7-day expiration

4. **Tenant limits enforced**
   - Check limits before creating invitations
   - Automatic usage tracking

## Error Handling

All API endpoints return consistent error responses:

```typescript
// Error response format
{
  success: false,
  error: string
}

// HTTP status codes:
// 400 - Bad request (missing params, validation error)
// 401 - Not authenticated
// 403 - Access denied (wrong tenant)
// 404 - Resource not found
// 500 - Internal server error
```

## Next Steps

1. **Update existing pages** to use TenantProvider
2. **Create admin UI** for user invitations
3. **Create invitation acceptance page** at `/accept-invitation`
4. **Add tenant settings page** for admins
5. **Implement email sending** for invitations (currently returns link only)
6. **Add comprehensive tests** for tenant isolation

## Support

For issues or questions about the multi-tenant implementation, refer to:
- `/docs/MULTI_TENANT_IMPLEMENTATION.md` - Architecture documentation
- Database schemas in `/db/*.sql`
- TypeScript types in `/src/types/entities.ts`
