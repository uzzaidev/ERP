# 📐 Project Plan V2 - UzzAI ERP

**Data**: 2025-12-07  
**Versão**: 2.0  
**Status**: Guia Técnico para Sprints 11-17  
**Objetivo**: Documentar arquitetura, decisões técnicas e especificações para implementação das 6 features únicas restantes

---

## 📋 Índice

1. [Visão Geral Técnica](#visão-geral-técnica)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Sprint 11: Risk Management](#sprint-11-risk-management)
4. [Sprint 12: Financial Tracking](#sprint-12-financial-tracking)
5. [Sprints 13-14: Wiki System](#sprints-13-14-wiki-system)
6. [Sprint 15: OKRs](#sprint-15-okrs)
7. [Sprint 16: Offline-First](#sprint-16-offline-first)
8. [Sprint 17: Export System](#sprint-17-export-system)
9. [Considerações de Performance](#considerações-de-performance)
10. [Segurança](#segurança)
11. [Testing Strategy](#testing-strategy)
12. [Deployment](#deployment)

---

## 🎯 Visão Geral Técnica

### Estado Atual (Pós-Sprint 10)

**Stack Tecnológico**:
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Drag & Drop**: @dnd-kit
- **Mobile**: Capacitor (configurado, não publicado)

**Database**: PostgreSQL via Supabase
- 17 migrations aplicadas (00_init até 17_meetings_table)
- RLS policies ativas em todas tabelas
- Multi-tenancy com `tenant_id` em todas entidades

**APIs**: 15 endpoints implementados (CRUD completo para core entities)

**UI**: 23 páginas implementadas, 49 componentes criados

### Objetivos Fase 5 (Sprints 11-17)

Implementar as **6 features únicas restantes**:
1. Risk Severity Auto-calculado
2. Financial Tracking por Decisão
3. Knowledge Base/Wiki
4. OKRs com Brutal Honesty
5. Offline-First PWA
6. Zero Vendor Lock-in (Export)

**Princípios de Design**:
- Manter consistência com padrões existentes
- Multi-tenancy em todas features (RLS + getTenantContext)
- Mobile-first responsive design
- Otimizar para performance (lazy loading, pagination)
- Testes unitários para todas APIs
- Documentação inline (JSDoc para funções críticas)

---

## 🏗️ Arquitetura do Sistema

### Estrutura de Diretórios

```
src/
├── app/
│   ├── (auth)/              # Rotas autenticadas
│   │   ├── dashboard/
│   │   ├── kanban/
│   │   ├── projetos/
│   │   ├── riscos/          # ← Sprint 11
│   │   ├── decisoes/        # Existente + Sprint 12
│   │   ├── docs/            # ← Sprints 13-14
│   │   ├── okrs/            # ← Sprint 15
│   │   └── configuracoes/
│   │       └── export/      # ← Sprint 17
│   ├── (public)/            # Rotas públicas
│   └── api/                 # API Routes
│       ├── risks/           # ← Sprint 11
│       ├── decisions/
│       │   └── [id]/
│       │       └── financials/  # ← Sprint 12
│       ├── wiki/            # ← Sprints 13-14
│       ├── okrs/            # ← Sprint 15
│       └── export/          # ← Sprint 17
├── components/
│   ├── risks/               # ← Sprint 11
│   ├── decisions/           # Existente + Sprint 12
│   ├── wiki/                # ← Sprints 13-14
│   ├── okrs/                # ← Sprint 15
│   ├── offline/             # ← Sprint 16
│   └── export/              # ← Sprint 17
├── lib/
│   ├── offline/             # ← Sprint 16
│   │   ├── queue.ts
│   │   ├── sync.ts
│   │   └── storage.ts
│   ├── export/              # ← Sprint 17
│   │   ├── engine.ts
│   │   ├── markdown.ts
│   │   ├── json.ts
│   │   └── csv.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── tenant.ts        # Existente
│   └── stores/
│       └── offline-store.ts # ← Sprint 16
└── types/
    ├── entities.ts          # Atualizar com novos tipos
    ├── api.ts
    └── offline.ts           # ← Sprint 16

db/
├── 18_risks_table.sql       # ← Sprint 11
├── 19_decision_financials.sql # ← Sprint 12
├── 20_wiki_system.sql       # ← Sprints 13-14
└── 21_okrs_system.sql       # ← Sprint 15
```

### Padrões de Código

#### 1. API Route Pattern

```typescript
// src/app/api/[entity]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';

export async function GET(request: NextRequest) {
  try {
    const { tenantId, userId } = await getTenantContext();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('entity')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API] Error:', error);
    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 2. Component Pattern

```typescript
// src/components/[feature]/[Component].tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface Props {
  // Props type definition
}

export function Component({ }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!result.success) throw new Error(result.error);
      
      // Success handling
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

#### 3. Database Migration Pattern

```sql
-- db/XX_feature_name.sql

-- 1. Create tables
CREATE TABLE table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  -- outros campos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes
CREATE INDEX idx_table_tenant ON table_name(tenant_id);
CREATE INDEX idx_table_created ON table_name(created_at DESC);

-- 3. Create functions (se necessário)
CREATE OR REPLACE FUNCTION function_name()
RETURNS trigger AS $$
BEGIN
  -- função lógica
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create triggers
CREATE TRIGGER trigger_name
  BEFORE UPDATE ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION function_name();

-- 5. RLS Policies
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tenant data"
  ON table_name FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY "Users can insert own tenant data"
  ON table_name FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY "Users can update own tenant data"
  ON table_name FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY "Users can delete own tenant data"
  ON table_name FOR DELETE
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

---

## 🎯 Sprint 11: Risk Management

### Arquitetura Técnica

#### Database Schema

```sql
-- db/18_risks_table.sql

CREATE TABLE risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Risk Assessment
  probability INTEGER NOT NULL CHECK (probability BETWEEN 1 AND 5),
  impact INTEGER NOT NULL CHECK (impact BETWEEN 1 AND 5),
  severity INTEGER GENERATED ALWAYS AS (probability * impact) STORED,
  category TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN (probability * impact) >= 16 THEN 'critical'
      WHEN (probability * impact) >= 12 THEN 'high'
      WHEN (probability * impact) >= 6 THEN 'medium'
      ELSE 'low'
    END
  ) STORED,
  
  -- Mitigation
  mitigation_plan TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'mitigated', 'accepted')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, code)
);

CREATE INDEX idx_risks_tenant ON risks(tenant_id);
CREATE INDEX idx_risks_project ON risks(project_id);
CREATE INDEX idx_risks_status ON risks(status);
CREATE INDEX idx_risks_category ON risks(category);

-- Função para gerar código automático
CREATE OR REPLACE FUNCTION generate_risk_code(p_tenant_id UUID, p_project_id UUID)
RETURNS TEXT AS $$
DECLARE
  project_code TEXT;
  next_number INTEGER;
BEGIN
  -- Get project code
  SELECT code INTO project_code FROM projects WHERE id = p_project_id;
  
  -- Get next sequence number
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM risks
  WHERE tenant_id = p_tenant_id AND project_id = p_project_id;
  
  RETURN CONCAT('R-', project_code, '-', LPAD(next_number::TEXT, 3, '0'));
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view risks in their tenant"
  ON risks FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY "Users can insert risks in their tenant"
  ON risks FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY "Users can update risks in their tenant"
  ON risks FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY "Users can delete risks in their tenant"
  ON risks FOR DELETE
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

#### TypeScript Types

```typescript
// src/types/entities.ts

export interface Risk {
  id: string;
  tenantId: string;
  code: string;
  title: string;
  description: string | null;
  probability: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  severity: number; // Auto-calculated: probability × impact
  category: 'critical' | 'high' | 'medium' | 'low'; // Auto-assigned
  mitigationPlan: string | null;
  ownerId: string | null;
  projectId: string | null;
  status: 'active' | 'mitigated' | 'accepted';
  createdAt: string;
  updatedAt: string;
}

export interface CreateRiskDTO {
  title: string;
  description?: string;
  probability: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  mitigationPlan?: string;
  ownerId?: string;
  projectId?: string;
  status?: 'active' | 'mitigated' | 'accepted';
}

export interface UpdateRiskDTO extends Partial<CreateRiskDTO> {}
```

#### API Endpoints

```typescript
// src/app/api/risks/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/supabase/tenant';
import { CreateRiskDTO } from '@/types/entities';

export async function GET(request: NextRequest) {
  try {
    const { tenantId } = await getTenantContext();
    const supabase = await createClient();
    
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    let query = supabase
      .from('risks')
      .select('*, owner:users(id, full_name, avatar_url), project:projects(id, name, code)')
      .eq('tenant_id', tenantId)
      .order('severity', { ascending: false });

    if (projectId) query = query.eq('project_id', projectId);
    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[GET /api/risks] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch risks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tenantId, userId } = await getTenantContext();
    const supabase = await createClient();
    
    const body: CreateRiskDTO = await request.json();

    // Generate code
    const { data: codeData } = await supabase.rpc('generate_risk_code', {
      p_tenant_id: tenantId,
      p_project_id: body.projectId || null,
    });

    const risk = {
      tenant_id: tenantId,
      code: codeData,
      title: body.title,
      description: body.description,
      probability: body.probability,
      impact: body.impact,
      mitigation_plan: body.mitigationPlan,
      owner_id: body.ownerId || userId,
      project_id: body.projectId,
      status: body.status || 'active',
    };

    const { data, error } = await supabase
      .from('risks')
      .insert(risk)
      .select('*, owner:users(id, full_name, avatar_url), project:projects(id, name, code)')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/risks] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create risk' },
      { status: 500 }
    );
  }
}
```

#### UI Components

```typescript
// src/components/risks/RiskCard.tsx

'use client';

import { Risk } from '@/types/entities';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface RiskCardProps {
  risk: Risk;
  onClick?: () => void;
}

export function RiskCard({ risk, onClick }: RiskCardProps) {
  // Color coding baseado em severity
  const severityColor = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
  }[risk.category];

  const severityLabel = {
    critical: '🔴 Crítico',
    high: '🟠 Alto',
    medium: '🟡 Médio',
    low: '🟢 Baixo',
  }[risk.category];

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold">
              {risk.code}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {risk.title}
            </p>
          </div>
          <Badge className={severityColor}>
            {severityLabel}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          {/* Probability × Impact = Severity */}
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Severidade:</span>
            <span className="text-muted-foreground">
              {risk.probability} × {risk.impact} = {risk.severity}
            </span>
          </div>

          {/* Owner */}
          {risk.owner && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={risk.owner.avatar_url} />
                <AvatarFallback>
                  {risk.owner.full_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {risk.owner.full_name}
              </span>
            </div>
          )}

          {/* Status */}
          <Badge variant="outline" className="mt-2">
            {risk.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Testing

```typescript
// __tests__/api/risks.test.ts

import { describe, it, expect, beforeEach } from '@jest/globals';

describe('Risks API', () => {
  describe('GET /api/risks', () => {
    it('should list risks for tenant', async () => {
      // Test implementation
    });

    it('should filter by project_id', async () => {
      // Test implementation
    });

    it('should filter by status', async () => {
      // Test implementation
    });
  });

  describe('POST /api/risks', () => {
    it('should create risk with auto-calculated severity', async () => {
      // Test implementation
      // Verify: severity = probability × impact
    });

    it('should assign category automatically', async () => {
      // Test implementation
      // Verify: category based on severity thresholds
    });

    it('should generate unique code', async () => {
      // Test implementation
    });
  });

  describe('Severity Calculation', () => {
    it('should calculate critical (≥16)', async () => {
      // probability=5, impact=5 → severity=25, category='critical'
    });

    it('should calculate high (≥12)', async () => {
      // probability=4, impact=3 → severity=12, category='high'
    });

    it('should calculate medium (≥6)', async () => {
      // probability=3, impact=2 → severity=6, category='medium'
    });

    it('should calculate low (<6)', async () => {
      // probability=1, impact=2 → severity=2, category='low'
    });
  });
});
```

### Performance Considerations

1. **Indexes**: Criar indexes em `tenant_id`, `project_id`, `status`, `category`
2. **Pagination**: Implementar limit/offset para listas longas
3. **Caching**: Considerar cache de stats (total por categoria) via React Query
4. **Lazy Loading**: Carregar detalhes do risk apenas quando abrir modal

---

## 💰 Sprint 12: Financial Tracking

### Arquitetura Técnica

#### Database Schema

```sql
-- db/19_decision_financials.sql

CREATE TABLE decision_financials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  
  -- Initial Costs
  development_hours NUMERIC(10,2) NOT NULL DEFAULT 0,
  hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 100.00,
  tools_cost NUMERIC(10,2) DEFAULT 0,
  training_cost NUMERIC(10,2) DEFAULT 0,
  total_initial_cost NUMERIC(10,2) GENERATED ALWAYS AS (
    (development_hours * hourly_rate) + COALESCE(tools_cost, 0) + COALESCE(training_cost, 0)
  ) STORED,
  
  -- Ongoing Costs
  monthly_cost NUMERIC(10,2) DEFAULT 0,
  maintenance_hours_per_month NUMERIC(10,2) DEFAULT 0,
  
  -- Savings
  monthly_savings NUMERIC(10,2) DEFAULT 0,
  productivity_gain_percent NUMERIC(5,2) DEFAULT 0,
  
  -- ROI Calculations (auto-calculated)
  monthly_net_savings NUMERIC(10,2) GENERATED ALWAYS AS (
    COALESCE(monthly_savings, 0) - COALESCE(monthly_cost, 0) - (COALESCE(maintenance_hours_per_month, 0) * hourly_rate)
  ) STORED,
  break_even_months NUMERIC(10,2) GENERATED ALWAYS AS (
    CASE 
      WHEN (COALESCE(monthly_savings, 0) - COALESCE(monthly_cost, 0) - (COALESCE(maintenance_hours_per_month, 0) * hourly_rate)) > 0
      THEN ((development_hours * hourly_rate) + COALESCE(tools_cost, 0) + COALESCE(training_cost, 0)) / 
           (COALESCE(monthly_savings, 0) - COALESCE(monthly_cost, 0) - (COALESCE(maintenance_hours_per_month, 0) * hourly_rate))
      ELSE NULL
    END
  ) STORED,
  annual_roi_percent NUMERIC(10,2) GENERATED ALWAYS AS (
    CASE 
      WHEN ((development_hours * hourly_rate) + COALESCE(tools_cost, 0) + COALESCE(training_cost, 0)) > 0
      THEN (((COALESCE(monthly_savings, 0) - COALESCE(monthly_cost, 0) - (COALESCE(maintenance_hours_per_month, 0) * hourly_rate)) * 12) / 
            ((development_hours * hourly_rate) + COALESCE(tools_cost, 0) + COALESCE(training_cost, 0))) * 100
      ELSE NULL
    END
  ) STORED,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(decision_id)
);

CREATE INDEX idx_decision_financials_tenant ON decision_financials(tenant_id);
CREATE INDEX idx_decision_financials_decision ON decision_financials(decision_id);

-- RLS Policies
ALTER TABLE decision_financials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view financials in their tenant"
  ON decision_financials FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY "Users can insert financials in their tenant"
  ON decision_financials FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY "Users can update financials in their tenant"
  ON decision_financials FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY "Users can delete financials in their tenant"
  ON decision_financials FOR DELETE
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

#### Key Features

1. **Auto-calculations**: Todos os campos ROI são `GENERATED ALWAYS AS (...) STORED`
2. **Real-time updates**: UI recalcula ROI conforme usuário digita (preview)
3. **Validation**: Break-even pode ser NULL se monthly_net_savings ≤ 0
4. **Dashboard**: Agregações para visualizar ROI de todas decisões

### UI Design

```typescript
// src/components/decisions/DecisionFinancialForm.tsx

'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DecisionFinancialFormProps {
  decisionId: string;
  initialData?: any;
  onSave: (data: any) => Promise<void>;
}

export function DecisionFinancialForm({ decisionId, initialData, onSave }: DecisionFinancialFormProps) {
  const [formData, setFormData] = useState({
    developmentHours: initialData?.development_hours || 0,
    hourlyRate: initialData?.hourly_rate || 100,
    toolsCost: initialData?.tools_cost || 0,
    trainingCost: initialData?.training_cost || 0,
    monthlyCost: initialData?.monthly_cost || 0,
    maintenanceHoursPerMonth: initialData?.maintenance_hours_per_month || 0,
    monthlySavings: initialData?.monthly_savings || 0,
    productivityGainPercent: initialData?.productivity_gain_percent || 0,
  });

  // Real-time ROI calculations (client-side preview)
  const calculations = {
    totalInitialCost: (formData.developmentHours * formData.hourlyRate) + formData.toolsCost + formData.trainingCost,
    monthlyNetSavings: formData.monthlySavings - formData.monthlyCost - (formData.maintenanceHoursPerMonth * formData.hourlyRate),
    breakEvenMonths: 0,
    annualROI: 0,
  };

  calculations.breakEvenMonths = calculations.monthlyNetSavings > 0
    ? calculations.totalInitialCost / calculations.monthlyNetSavings
    : 0;

  calculations.annualROI = calculations.totalInitialCost > 0
    ? ((calculations.monthlyNetSavings * 12) / calculations.totalInitialCost) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Initial Costs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Custos Iniciais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Horas de Desenvolvimento</Label>
              <Input
                type="number"
                value={formData.developmentHours}
                onChange={(e) => setFormData({ ...formData, developmentHours: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Taxa Horária (R$/h)</Label>
              <Input
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Custo de Ferramentas (R$)</Label>
              <Input
                type="number"
                value={formData.toolsCost}
                onChange={(e) => setFormData({ ...formData, toolsCost: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Custo de Treinamento (R$)</Label>
              <Input
                type="number"
                value={formData.trainingCost}
                onChange={(e) => setFormData({ ...formData, trainingCost: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          
          {/* Total Initial Cost (read-only) */}
          <div className="pt-4 border-t">
            <Label className="text-lg font-semibold">Total Inicial</Label>
            <p className="text-2xl font-bold text-primary">
              R$ {calculations.totalInitialCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Ongoing Costs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Custos Recorrentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Similar structure... */}
        </CardContent>
      </Card>

      {/* Savings Section */}
      <Card>
        <CardHeader>
          <CardTitle>Economias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Similar structure... */}
        </CardContent>
      </Card>

      {/* ROI Metrics (read-only) */}
      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle>Métricas de ROI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Economia Líquida Mensal</Label>
              <p className="text-xl font-bold">
                R$ {calculations.monthlyNetSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <Label>Break-even (meses)</Label>
              <p className="text-xl font-bold">
                {calculations.breakEvenMonths > 0 
                  ? calculations.breakEvenMonths.toFixed(1)
                  : 'N/A'}
              </p>
            </div>
            <div>
              <Label>ROI Anual (%)</Label>
              <p className={`text-xl font-bold ${
                calculations.annualROI >= 20 ? 'text-green-600' :
                calculations.annualROI >= 10 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {calculations.annualROI.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 📚 Sprints 13-14: Wiki System

### Arquitetura Técnica

O sistema wiki é o mais complexo das features únicas, envolvendo:
1. Editor de markdown
2. Versionamento automático
3. Detecção de backlinks
4. Sistema de busca
5. Upload de imagens

#### Database Schema

Veja detalhes completos em `IMPLEMENTATION_PLAN_V2.md` Sprint 13 Task 13.1

#### Editor Choice

**Opção 1: react-md-editor** (Recomendado)
- Pros: Simples, leve, preview lado-a-lado
- Cons: Menos features avançadas

**Opção 2: @uiw/react-markdown-editor**
- Pros: Mais robusto, mais features
- Cons: Bundle maior

**Opção 3: TipTap** (Se quiser WYSIWYG)
- Pros: Editor WYSIWYG, extensível
- Cons: Mais complexo, não é markdown puro

**Recomendação**: Começar com `react-md-editor` para MVP, migrar para TipTap se necessário

#### Backlinks Detection

```typescript
// src/lib/wiki/backlinks.ts

/**
 * Extrai links wiki do conteúdo markdown
 * Formato: [[Page Title]] ou [[slug]]
 */
export function extractWikiLinks(content: string): string[] {
  const linkPattern = /\[\[([^\]]+)\]\]/g;
  const matches = content.matchAll(linkPattern);
  
  const links: string[] = [];
  for (const match of matches) {
    links.push(match[1].trim());
  }
  
  return Array.from(new Set(links)); // Remove duplicates
}

/**
 * Resolve wiki links para IDs de páginas
 */
export async function resolveWikiLinks(
  tenantId: string,
  linkTexts: string[]
): Promise<Map<string, string>> {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('wiki_pages')
    .select('id, title, slug')
    .eq('tenant_id', tenantId)
    .in('slug', linkTexts); // ou 'title'
  
  const linkMap = new Map<string, string>();
  data?.forEach(page => {
    linkMap.set(page.slug, page.id);
    linkMap.set(page.title, page.id);
  });
  
  return linkMap;
}

/**
 * Cria backlinks no banco de dados
 */
export async function createBacklinks(
  fromPageId: string,
  tenantId: string,
  content: string
): Promise<void> {
  const linkTexts = extractWikiLinks(content);
  const linkMap = await resolveWikiLinks(tenantId, linkTexts);
  
  const supabase = await createClient();
  
  // Delete old backlinks
  await supabase
    .from('wiki_backlinks')
    .delete()
    .eq('from_page_id', fromPageId);
  
  // Insert new backlinks
  const backlinks = Array.from(linkMap.entries()).map(([text, toPageId]) => ({
    tenant_id: tenantId,
    from_page_id: fromPageId,
    to_page_id: toPageId,
    link_text: text,
  }));
  
  if (backlinks.length > 0) {
    await supabase.from('wiki_backlinks').insert(backlinks);
  }
}
```

#### Markdown Rendering

```typescript
// src/components/wiki/WikiContent.tsx

'use client';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Link from 'next/link';

interface WikiContentProps {
  content: string;
}

export function WikiContent({ content }: WikiContentProps) {
  // Convert [[wiki links]] to Next.js links
  const processedContent = content.replace(
    /\[\[([^\]]+)\]\]/g,
    (match, linkText) => {
      const slug = linkText.toLowerCase().replace(/\s+/g, '-');
      return `[${linkText}](/docs/${slug})`;
    }
  );

  return (
    <ReactMarkdown
      className="prose prose-slate dark:prose-invert max-w-none"
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        a({ node, children, href, ...props }) {
          // Internal wiki links use Next.js Link
          if (href?.startsWith('/docs/')) {
            return (
              <Link href={href} {...props}>
                {children}
              </Link>
            );
          }
          // External links
          return (
            <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          );
        },
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
}
```

---

## 🎯 Sprint 15: OKRs

### Arquitetura Técnica

OKRs é uma feature relativamente simples comparada ao Wiki. O diferencial está no "Brutal Honesty" - ser transparente sobre realidade vs. projeções.

#### Key Features

1. **3 Cenários por Key Result**: Pessimista, Realista, Otimista
2. **Reality Check**: Campo para brutal truth sobre o que realmente aconteceu
3. **Course Corrections**: Lista de ações tomadas para corrigir rumo
4. **Lessons Learned**: O que aprendemos quando não batemos a meta

#### UI Design Considerations

- **Progress Visualization**: Use progress bars com color coding
- **Scenario Chart**: Line chart mostrando P/R/O vs Actual
- **Reality Check Section**: Destacar visualmente para encorajar honestidade

---

## 📴 Sprint 16: Offline-First

### Arquitetura Técnica

Esta é a feature mais complexa tecnicamente. Requer:
1. Service Worker configuração
2. IndexedDB para armazenamento local
3. Queue de sincronização
4. Conflict resolution

#### Service Worker

```typescript
// public/sw.js

const CACHE_NAME = 'erp-uzzai-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/kanban',
  '/projetos',
  // Static assets
  '/favicon.ico',
  '/_next/static/**/*',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests: Network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response for caching
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache if offline
          return caches.match(request);
        })
    );
    return;
  }

  // Pages & assets: Cache-first strategy
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request);
    })
  );
});
```

#### Offline Queue

```typescript
// src/lib/offline/queue.ts

import { openDB, DBSchema } from 'idb';

interface OfflineDB extends DBSchema {
  queue: {
    key: string;
    value: {
      id: string;
      timestamp: number;
      method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      url: string;
      body: any;
      synced: boolean;
      retries: number;
    };
  };
}

const DB_NAME = 'erp-offline';
const STORE_NAME = 'queue';

export async function getDB() {
  return openDB<OfflineDB>(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    },
  });
}

export async function queueChange(
  method: string,
  url: string,
  body: any
): Promise<void> {
  const db = await getDB();
  await db.add(STORE_NAME, {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    method: method as any,
    url,
    body,
    synced: false,
    retries: 0,
  });
}

export async function getPendingChanges() {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function markAsSynced(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}
```

#### Sync Manager

```typescript
// src/lib/offline/sync.ts

import { getPendingChanges, markAsSynced } from './queue';

export async function syncOfflineChanges(): Promise<{
  synced: number;
  failed: number;
}> {
  const changes = await getPendingChanges();
  let synced = 0;
  let failed = 0;

  for (const change of changes) {
    try {
      const response = await fetch(change.url, {
        method: change.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(change.body),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      await markAsSynced(change.id);
      synced++;
    } catch (error) {
      console.error(`Failed to sync change ${change.id}:`, error);
      failed++;
      
      // Exponential backoff
      change.retries++;
      if (change.retries > 5) {
        // Give up after 5 retries
        await markAsSynced(change.id);
      }
    }
  }

  return { synced, failed };
}

// Auto-sync when online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Back online, syncing changes...');
    syncOfflineChanges();
  });
}
```

### Conflict Resolution

Estratégia: **Last-Write-Wins** (mais simples)

Se quiser mais sofisticado:
- **Timestamp comparison**: Comparar `updated_at` do servidor vs local
- **User prompt**: Avisar usuário sobre conflito e deixar escolher
- **Merge**: Tentar fazer merge automático de campos diferentes

---

## 📦 Sprint 17: Export System

### Arquitetura Técnica

#### Markdown Exporter

Formato Obsidian-compatible:

```markdown
# TASK-123: Implementar feature X

**Status**: In Progress
**Assignee**: @john
**Priority**: P0
**Due Date**: 2025-12-31
**Project**: [[PROJ-001 - ERP UzzAI]]
**Sprint**: [[Sprint 2025-W50]]

## Description

Lorem ipsum dolor sit amet, consectetur adipiscing elit.

## Subtasks

- [x] [[TASK-124]]: Setup database
- [ ] [[TASK-125]]: Create API
- [ ] [[TASK-126]]: Build UI

## Comments

### 2025-12-01 10:30 - @jane

Great progress! Keep it up.

### 2025-12-02 15:45 - @john

Updated the PR with fixes.

## Time Logs

- 2h by @john on 2025-12-01: Setup work
- 3h by @john on 2025-12-02: Development
- 1h by @jane on 2025-12-02: Code review

---

**Created**: 2025-12-01 09:00
**Updated**: 2025-12-02 16:00
**Completed**: -
```

#### ZIP Generation

```typescript
// src/lib/export/zip.ts

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export async function createZipArchive(
  files: Map<string, string>, // filename → content
  zipName: string
): Promise<void> {
  const zip = new JSZip();

  // Add files to zip
  files.forEach((content, filename) => {
    zip.file(filename, content);
  });

  // Generate ZIP
  const blob = await zip.generateAsync({ type: 'blob' });
  
  // Download
  saveAs(blob, zipName);
}
```

---

## 🎯 Considerações de Performance

### Database Optimization

1. **Indexes**: Criar indexes em campos frequentemente filtrados
   - `tenant_id` (todas tabelas)
   - `status`, `category`, `priority`
   - `created_at`, `updated_at` (para ordering)

2. **Pagination**: Sempre paginar listas longas
   ```typescript
   const ITEMS_PER_PAGE = 50;
   const offset = page * ITEMS_PER_PAGE;
   
   const query = supabase
     .from('entity')
     .select('*', { count: 'exact' })
     .range(offset, offset + ITEMS_PER_PAGE - 1);
   ```

3. **Lazy Loading**: Carregar relacionamentos sob demanda
   ```typescript
   // Ruim: carregar tudo
   .select('*, comments(*), time_logs(*), attachments(*)')
   
   // Bom: carregar apenas o necessário
   .select('*')
   // Carregar relacionamentos separadamente quando usuário abrir modal
   ```

### Frontend Optimization

1. **Code Splitting**: Dynamic imports para páginas pesadas
   ```typescript
   const WikiEditor = dynamic(() => import('@/components/wiki/WikiEditor'), {
     loading: () => <p>Loading editor...</p>,
     ssr: false,
   });
   ```

2. **React Query**: Cache de dados
   ```typescript
   const { data: risks } = useQuery({
     queryKey: ['risks', projectId],
     queryFn: () => fetchRisks(projectId),
     staleTime: 5 * 60 * 1000, // 5 min
   });
   ```

3. **Debouncing**: Para busca/autocomplete
   ```typescript
   const debouncedSearch = useMemo(
     () => debounce((value: string) => {
       // Search logic
     }, 300),
     []
   );
   ```

---

## 🔒 Segurança

### RLS Policies

TODAS as tabelas devem ter RLS policies. Padrão:

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "policy_name"
  ON table_name FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

### Input Validation

1. **Zod schemas** para todos forms
2. **Server-side validation** em todas APIs
3. **SQL injection protection**: Usar prepared statements (Supabase já faz)
4. **XSS protection**: Sanitizar inputs (React já faz)

### File Uploads

Para wiki images:

```typescript
// src/lib/wiki/upload.ts

export async function uploadWikiImage(
  file: File,
  tenantId: string
): Promise<string> {
  const supabase = await createClient();
  
  // Validations
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE) {
    throw new Error('File too large (max 5MB)');
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  
  // Generate unique filename
  const ext = file.name.split('.').pop();
  const filename = `${tenantId}/${crypto.randomUUID()}.${ext}`;
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('wiki-images')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
    });
  
  if (error) throw error;
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('wiki-images')
    .getPublicUrl(filename);
  
  return publicUrl;
}
```

---

## 🧪 Testing Strategy

### Unit Tests

1. **API Routes**: Testar todos endpoints
   - Success cases
   - Error cases
   - Multi-tenancy isolation
   - Validation

2. **Utils/Helpers**: Testar funções puras
   - Cálculos (ROI, severity, etc.)
   - Conversões (Markdown, JSON, CSV)
   - Validações

### Integration Tests

1. **Database**: Testar migrations
2. **RLS Policies**: Testar isolamento de dados
3. **Workflows**: Testar fluxos completos (criar → editar → deletar)

### E2E Tests (Opcional)

Usar Playwright para testar user journeys críticos:
- Login → Create Project → Create Task → Drag to Done
- Create Risk → Auto-calculate severity → Update status
- Create Wiki Page → Add backlinks → View linked pages

---

## 🚀 Deployment

### Database Migrations

1. **Desenvolvimento**: Aplicar via Supabase SQL Editor
2. **Produção**: Aplicar via script automatizado ou manualmente com cuidado

**Checklist**:
- [ ] Backup do banco antes de migração
- [ ] Testar migration em staging
- [ ] Verificar que RLS policies estão corretas
- [ ] Verificar indexes foram criados
- [ ] Rollback plan pronto

### Environment Variables

Verificar que estão configuradas:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY` (para emails)

### Performance Monitoring

Considerar adicionar:
- **Sentry**: Error tracking
- **Vercel Analytics**: Performance metrics
- **PostHog**: Product analytics

---

## 📝 Conclusão

Este guia técnico cobre os aspectos críticos da implementação das Sprints 11-17. Para cada sprint:

1. Seguir o padrão de código estabelecido
2. Criar testes unitários
3. Validar multi-tenancy
4. Otimizar performance
5. Documentar código complexo

**Próximo passo**: Iniciar Sprint 11 - Risk Management!

---

**Última Atualização**: 2025-12-07  
**Versão**: 2.0  
**Mantido por**: Equipe de Desenvolvimento ERP UzzAI
