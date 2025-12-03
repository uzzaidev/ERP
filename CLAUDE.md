# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

ERP-UzzAI is a multi-tenant ERP system with AI capabilities built with Next.js 15, React 19, TypeScript, Supabase (PostgreSQL), and Zustand. The system integrates business management with AI-powered automation for meetings, entity extraction, project management, and financial operations.

## Development Commands

### Essential Commands

```bash
# Development
pnpm dev                    # Start Next.js dev server (http://localhost:3000)
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm lint                   # Run ESLint

# Testing
pnpm test                   # Run unit tests (excludes integration)
pnpm test:unit              # Run unit tests explicitly
pnpm test:watch             # Run tests in watch mode
pnpm test:api               # Run API route tests only
pnpm test:integration       # Run integration tests (requires INTEGRATION_TEST=true)
pnpm test:all               # Run all tests (unit + integration)
pnpm test:coverage          # Generate test coverage report

# Capacitor (Mobile)
pnpm cap:sync               # Sync web assets to native platforms
pnpm cap:android            # Open Android project in Android Studio
pnpm cap:ios                # Open iOS project in Xcode
```

### Running Single Tests

```bash
# Run a specific test file
pnpm test path/to/test.test.ts

# Run tests matching a pattern
pnpm test --testNamePattern="pattern"

# Run tests in a specific directory
pnpm test __tests__/api
```

## Architecture

### Multi-Tenancy

**Critical**: This is a **multi-tenant** system. All data is isolated by `tenant_id`:

- Every table (except `tenants`, `roles`, `permissions`) has a `tenant_id` column
- All API routes must filter by tenant using `getTenantContext()` from `@/lib/supabase/tenant`
- Row Level Security (RLS) policies enforce data isolation at the database level
- Never expose data across tenants or allow cross-tenant queries

**Tenant Context Pattern** (use in ALL API routes):
```typescript
import { getTenantContext } from '@/lib/supabase/tenant';

export async function GET() {
  const { tenantId, userId } = await getTenantContext();

  const { data } = await supabase
    .from('table_name')
    .select('*')
    .eq('tenant_id', tenantId); // Always filter by tenant
}
```

### Database Structure

Database uses PostgreSQL via Supabase with migration files in `db/`:
- `00_init.sql` - Initializes schema
- `00_tenants.sql` - Multi-tenancy tables (tenants, tenant_invitations, tenant_usage_stats)
- `01_users_and_auth.sql` - Users, roles, permissions, RBAC
- `02_projects_and_tasks.sql` - Projects, sprints, tasks, tags, Kanban system
- `03_finance.sql` - Bank accounts, transactions, invoices, budgets
- `04_auxiliary_tables.sql` - Notifications, settings, webhooks, email templates
- `05_rls_policies.sql` - Row Level Security policies for multi-tenant isolation

**To apply database changes**:
1. Add new migration file following naming convention
2. Apply in Supabase SQL Editor or via psql
3. Update TypeScript types in `src/types/entities.ts`
4. Run tests to verify changes

### Authentication & Authorization

- **Authentication**: Supabase Auth handles user sessions
- **Client-side**: Use `createClient()` from `@/lib/supabase/client`
- **Server-side**: Use `createClient()` from `@/lib/supabase/server` (async function)
- **Middleware**: `src/middleware.ts` protects all routes except `/`, `/login`, `/registro`
- **Authorization**: RBAC system with roles (admin, gestor, financeiro, dev, juridico) and permissions
- **Tenant Limits**: Check limits before creating users/projects using `checkTenantLimits()`

### App Router Structure

Next.js 15 App Router with route groups:
- `src/app/(auth)/` - Protected routes (dashboard, projetos, kanban, financeiro, etc.)
- `src/app/(public)/` - Public routes (login, registro, accept-invitation)
- `src/app/api/` - API routes (projects, tasks, sprints, users, tenants)

**Layouts**:
- `(auth)/layout.tsx` - Authenticated layout with Sidebar and Topbar
- `(public)/layout.tsx` - Public layout (minimal)

### State Management

**Zustand stores** in `src/lib/stores/`:
- `ui-store.ts` - Global UI state (sidebar collapse, theme)
- `kanban-store.ts` - Kanban board state (cards, filters, drag-drop)

**When to use Zustand vs React Query**:
- Use Zustand for UI state and client-side app state
- Use React Query (@tanstack/react-query) for server state (coming soon)
- Avoid prop drilling - use stores for deeply nested components

### API Routes Pattern

All API routes follow this structure:
```typescript
// src/app/api/resource/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';

export async function GET(request: NextRequest) {
  try {
    const { tenantId } = await getTenantContext();
    const supabase = await createClient();

    // Always filter by tenant_id
    const { data, error } = await supabase
      .from('table')
      .select('*')
      .eq('tenant_id', tenantId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
```

### Component Patterns

**UI Components**: Shadcn/ui in `src/components/ui/` (don't modify directly)
**Layout Components**: `src/components/layout/` (Sidebar, Topbar)
**Feature Components**: Co-located with routes or in `src/components/[feature]/`

**Example - Kanban components**:
```
src/components/kanban/
  ├── kanban-card.tsx         # Individual task card
  ├── kanban-column.tsx       # Column container (todo, in-progress, done)
  ├── kanban-card-modal.tsx   # Task detail modal
  └── kanban-filters.tsx      # Filter controls
```

### Type System

**Central types** in `src/types/`:
- `entities.ts` - Domain entities (User, Tenant, Project, Task, etc.)
- `api.ts` - API request/response types
- `kanban.ts` - Kanban-specific types

**Important**: All entities have `tenantId` field for multi-tenant isolation.

### Entity ID Formats

Standard ID formats used across the system:
- **Decisions**: `D-{YYYY}-{seq}` (e.g., `D-2025-042`)
- **Actions**: `A-{YYYY}-{seq}` (e.g., `A-2025-123`)
- **Kaizens**: `K-{tipo[0]}-{seq}` (e.g., `K-T-015`)
- **Risks**: `R-{project}-{seq}` (e.g., `R-CHATBOT-003`)
- **Meetings**: `MTG-{YYYY-MM-DD}-{project}` (e.g., `MTG-2025-11-24-CHATBOT`)
- **Sprints**: `Sprint-{YYYY}-W{nn}` (e.g., `Sprint-2025-W48`)
- **Sales**: `VND-{YYYY}-{seq}` (e.g., `VND-2025-00456`)
- **Products**: `SKU-{category}-{seq}` (e.g., `SKU-ELET-001`)

## Key Patterns & Conventions

### Multi-Tenant Data Access

**ALWAYS**:
1. Import `getTenantContext` in API routes
2. Call `const { tenantId } = await getTenantContext()` at the start
3. Filter ALL queries with `.eq('tenant_id', tenantId)`
4. Verify tenant ownership before UPDATE/DELETE operations

**Example** (PATCH endpoint):
```typescript
// First verify the resource belongs to user's tenant
const { data: existing, error } = await supabase
  .from('tasks')
  .select('tenant_id')
  .eq('id', resourceId)
  .single();

if (existing.tenant_id !== tenantId) {
  return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
}
```

### Supabase Client Usage

**Server Components & API Routes**:
```typescript
import { createClient } from '@/lib/supabase/server';

// IMPORTANT: createClient is async on server
const supabase = await createClient();
```

**Client Components**:
```typescript
import { createClient } from '@/lib/supabase/client';

// Synchronous on client
const supabase = createClient();
```

### Testing

**Test setup**: `__tests__/setup.ts` configures Jest environment
**Coverage thresholds**: 50% minimum (branches, functions, lines, statements)

**When writing tests**:
- Use `@/` imports (configured in jest.config.js)
- Mock Supabase client for API route tests
- Integration tests require `INTEGRATION_TEST=true` environment variable
- API tests should verify multi-tenant isolation

### Environment Variables

Required variables (see `.env.example`):
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=re_xxx  # Optional, for invitation emails
```

## Common Workflows

### Adding a New Feature Module

1. **Database**: Create migration SQL file in `db/` (e.g., `06_my_module.sql`)
2. **Types**: Add entity types to `src/types/entities.ts`
3. **API Routes**: Create route handler in `src/app/api/my-module/route.ts`
   - Follow multi-tenant pattern with `getTenantContext()`
4. **UI**: Create page in `src/app/(auth)/my-module/page.tsx`
5. **Components**: Add feature components to `src/components/my-module/`
6. **Store**: (Optional) Create Zustand store if needed
7. **Tests**: Add tests to `__tests__/api/my-module.test.ts`
8. **Sidebar**: Update `src/components/layout/sidebar.tsx` to add navigation

### Modifying an Entity

1. Update SQL schema in appropriate `db/*.sql` file
2. Apply migration to Supabase
3. Update TypeScript type in `src/types/entities.ts`
4. Update API route handlers that use the entity
5. Update UI components displaying the entity
6. Update tests
7. Run `pnpm test` to verify

### Adding New API Endpoint

```typescript
// 1. Create src/app/api/resource/route.ts
import { getTenantContext } from '@/lib/supabase/tenant';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const { tenantId } = await getTenantContext();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('resource')
    .select('*')
    .eq('tenant_id', tenantId);

  return NextResponse.json({ success: true, data });
}

// 2. Add test in __tests__/api/resource.test.ts
// 3. Test both success cases and multi-tenant isolation
```

## Important Notes

- **Package Manager**: Use `pnpm` (specified in package.json: `"packageManager": "pnpm@10.18.1"`)
- **React Version**: React 19 - ensure compatibility when adding dependencies
- **Next.js**: Version 15 with App Router - avoid Pages Router patterns
- **Tenant Isolation**: Never skip tenant_id filtering - security critical
- **RLS Policies**: Database has RLS enabled - API routes are defense-in-depth
- **Drag-and-Drop**: Uses @dnd-kit for Kanban board
- **Form Validation**: React Hook Form + Zod for type-safe forms
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Icons**: Lucide React for all icons

## Documentation Structure

All technical documentation is organized in the `docs/` directory following a numbered structure:

```
docs/
├── README.md                          # Documentation index
├── 0. Plans/                          # Planning and roadmap
├── 1. Arquitetura/                    # System architecture
├── 2. Branding/                       # Design system
├── 3. QA/                             # Quality assurance
├── 4. Kanban/                         # Project management
├── 5. Supabase/                       # Supabase configs
└── 6. Testing/                        # Test documentation
```

### Where to Create New Documentation

- **Architecture & Design**: `docs/1. Arquitetura/`
- **Plans & Roadmaps**: `docs/0. Plans/`
- **Testing Documentation**: `docs/6. Testing/`
- **Supabase Configurations**: `docs/5. Supabase/`
- **QA Processes**: `docs/3. QA/`
- **Project Management**: `docs/4. Kanban/`
- **Design & UI**: `docs/2. Branding/`

### Naming Conventions

- Use SCREAMING_SNAKE_CASE for main documents: `MULTI_TENANT_SETUP.md`
- Use kebab-case for auxiliary documents: `sprint-planning.md`
- Always use `.md` extension
- Include date in temporary documents: `retrospective-2025-12-02.md`
- **NEVER** create `.md` files in the root of `docs/` - always use the appropriate subfolder

## AI Multi-Agent System (Future)

The system is designed to integrate a 13-agent AI system organized in 3 tiers:
- **Tier 1** (Extraction): DecisionAgent, ActionAgent, KaizenAgent, RiskAgent, BlockerAgent
- **Tier 2** (Enrichment): ProjectAgent, DeadlineAgent, PriorityAgent, SprintAgent, FinancialAgent, TeamHealthAgent
- **Tier 3** (Validation): ValidatorAgent

These agents will process meeting transcripts and extract structured entities. The backend integration is not yet implemented.
