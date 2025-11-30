# Plano de Implementacao - ERP-UzzAI Frontend

> Documento de planejamento para implementacao do frontend do ERP-UzzAI
>
> **Versao:** 1.0.0
> **Data:** 2025-11-30
> **Status:** Planejamento

---

## 1. Visao Geral do Projeto

### 1.1 Objetivo

Desenvolver o frontend unificado do ERP-UzzAI utilizando tecnologias modernas, com suporte a Desktop (SSR) e Mobile (Capacitor), mantendo uma base de codigo unica e responsiva.

### 1.2 Principios

| Principio | Descricao |
|-----------|-----------|
| **SSR First** | Server-Side Rendering para melhor SEO e performance no Desktop |
| **Mobile Ready** | Capacitor para empacotamento nativo iOS/Android |
| **API Abstraction** | Helper para roteamento de APIs (local vs producao) |
| **Component-First** | Componentes customizaveis e reutilizaveis |
| **Responsive** | Design responsivo em todos os componentes |
| **Icon Consistency** | Sempre Lucide Icons, nunca emojis |

---

## 2. Stack Tecnologico

### 2.1 Core

| Tecnologia | Versao | Uso |
|------------|--------|-----|
| **Next.js** | 15.x | Framework React com SSR |
| **React** | 19.x | UI Library |
| **TypeScript** | 5.x | Type Safety |

### 2.2 UI/Styling

| Tecnologia | Versao | Uso |
|------------|--------|-----|
| **Tailwind CSS** | 3.4.x | Utility-first CSS |
| **Shadcn/ui** | latest | Componentes UI |
| **Lucide React** | latest | Icones (obrigatorio) |

### 2.3 Backend/Database

| Tecnologia | Uso |
|------------|-----|
| **Supabase** | Database (PostgreSQL) |
| **Supabase Auth** | Autenticacao com JWT |
| **Supabase Realtime** | Subscriptions (futuro) |

### 2.4 Mobile

| Tecnologia | Uso |
|------------|-----|
| **Capacitor** | Empacotamento nativo iOS/Android |
| **Capacitor Plugins** | Acesso a APIs nativas |

### 2.5 DevOps/Config

| Tecnologia | Uso |
|------------|-----|
| **Doppler** | Gerenciamento de variaveis de ambiente |
| **Vercel** | Deploy (Desktop/SSR) |
| **App Stores** | Deploy Mobile |

### 2.6 Validacao/Forms

| Tecnologia | Uso |
|------------|-----|
| **Zod** | Validacao de schemas |
| **React Hook Form** | Gerenciamento de formularios |

### 2.7 State Management

| Tecnologia | Uso |
|------------|-----|
| **Zustand** | Estado global |
| **TanStack Query** | Cache e fetching |

---

## 3. Arquitetura de Pastas

```
frontend/
├── src/
│   ├── app/                          # App Router (Next.js 15)
│   │   ├── (auth)/                   # Grupo de rotas autenticadas
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── projetos/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── reunioes/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── acoes/
│   │   │   │   └── page.tsx
│   │   │   ├── bullet-journal/
│   │   │   │   └── page.tsx
│   │   │   ├── equipe/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── produtos/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── estoque/
│   │   │   │   └── page.tsx
│   │   │   ├── vendas/
│   │   │   │   └── page.tsx
│   │   │   ├── pdv/
│   │   │   │   └── page.tsx
│   │   │   ├── clientes/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── financeiro/
│   │   │   │   └── page.tsx
│   │   │   ├── notas-fiscais/
│   │   │   │   └── page.tsx
│   │   │   └── configuracoes/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (public)/                 # Rotas publicas
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── registro/
│   │   │       └── page.tsx
│   │   │
│   │   ├── api/                      # API Routes (Next.js)
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── logout/
│   │   │   │   │   └── route.ts
│   │   │   │   └── refresh/
│   │   │   │       └── route.ts
│   │   │   ├── projects/
│   │   │   │   └── route.ts
│   │   │   ├── meetings/
│   │   │   │   └── route.ts
│   │   │   ├── actions/
│   │   │   │   └── route.ts
│   │   │   └── [...proxy]/           # Proxy para API externa (producao)
│   │   │       └── route.ts
│   │   │
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home (redirect)
│   │   ├── globals.css               # Estilos globais
│   │   └── not-found.tsx             # 404
│   │
│   ├── components/
│   │   ├── ui/                       # Shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/                   # Componentes de layout
│   │   │   ├── sidebar.tsx
│   │   │   ├── topbar.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   └── breadcrumb.tsx
│   │   │
│   │   ├── dashboard/                # Componentes do dashboard
│   │   │   ├── kpi-card.tsx
│   │   │   ├── activity-feed.tsx
│   │   │   ├── charts/
│   │   │   │   ├── bar-chart.tsx
│   │   │   │   ├── line-chart.tsx
│   │   │   │   └── pie-chart.tsx
│   │   │   └── alerts-panel.tsx
│   │   │
│   │   ├── projects/                 # Componentes de projetos
│   │   │   ├── project-card.tsx
│   │   │   ├── project-form.tsx
│   │   │   ├── sprint-board.tsx
│   │   │   └── gantt-chart.tsx
│   │   │
│   │   ├── meetings/                 # Componentes de reunioes
│   │   │   ├── meeting-card.tsx
│   │   │   ├── meeting-form.tsx
│   │   │   ├── ata-viewer.tsx
│   │   │   └── entity-list.tsx
│   │   │
│   │   ├── actions/                  # Componentes de acoes
│   │   │   ├── kanban-board.tsx
│   │   │   ├── action-card.tsx
│   │   │   └── action-form.tsx
│   │   │
│   │   ├── products/                 # Componentes de produtos
│   │   │   ├── product-card.tsx
│   │   │   ├── product-form.tsx
│   │   │   └── stock-badge.tsx
│   │   │
│   │   ├── sales/                    # Componentes de vendas
│   │   │   ├── pdv-screen.tsx
│   │   │   ├── sale-form.tsx
│   │   │   └── sale-history.tsx
│   │   │
│   │   ├── financial/                # Componentes financeiros
│   │   │   ├── cashflow-chart.tsx
│   │   │   ├── dre-table.tsx
│   │   │   └── budget-chart.tsx
│   │   │
│   │   └── forms/                    # Formularios reutilizaveis
│   │       ├── pessoa-form.tsx
│   │       ├── transacao-form.tsx
│   │       └── estoque-operacao-form.tsx
│   │
│   ├── lib/                          # Utilitarios e helpers
│   │   ├── api/
│   │   │   ├── client.ts             # API client com routing helper
│   │   │   ├── endpoints.ts          # Definicao de endpoints
│   │   │   └── types.ts              # Tipos de API
│   │   │
│   │   ├── supabase/
│   │   │   ├── client.ts             # Cliente Supabase (browser)
│   │   │   ├── server.ts             # Cliente Supabase (server)
│   │   │   └── middleware.ts         # Middleware de auth
│   │   │
│   │   ├── utils/
│   │   │   ├── cn.ts                 # Class names helper
│   │   │   ├── format.ts             # Formatacao (moeda, data, etc)
│   │   │   └── validation.ts         # Validacoes comuns
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-auth.ts           # Hook de autenticacao
│   │   │   ├── use-toast.ts          # Hook de notificacoes
│   │   │   ├── use-media-query.ts    # Hook de responsividade
│   │   │   └── use-debounce.ts       # Hook de debounce
│   │   │
│   │   └── stores/
│   │       ├── auth-store.ts         # Estado de autenticacao
│   │       ├── ui-store.ts           # Estado de UI (sidebar, theme)
│   │       └── cart-store.ts         # Estado do carrinho (PDV)
│   │
│   ├── types/                        # TypeScript types
│   │   ├── database.ts               # Tipos do Supabase
│   │   ├── entities.ts               # Entidades do dominio
│   │   ├── api.ts                    # Tipos de API
│   │   └── index.ts                  # Re-exports
│   │
│   └── config/                       # Configuracoes
│       ├── site.ts                   # Metadata do site
│       ├── navigation.ts             # Itens de navegacao
│       └── constants.ts              # Constantes globais
│
├── public/
│   ├── icons/                        # Icones do app
│   ├── images/                       # Imagens estaticas
│   └── fonts/                        # Fontes customizadas
│
├── capacitor/                        # Configuracoes Capacitor
│   ├── android/                      # Projeto Android
│   ├── ios/                          # Projeto iOS
│   └── capacitor.config.ts           # Config Capacitor
│
├── tailwind.config.ts                # Config Tailwind
├── components.json                   # Config Shadcn
├── next.config.ts                    # Config Next.js
├── tsconfig.json                     # Config TypeScript
├── package.json
└── .env.local                        # Variaveis locais (git ignored)
```

---

## 4. API Helper - Roteamento Desktop vs Mobile

### 4.1 Conceito

O helper de API deve:
- Em Desktop (SSR): Usar API Routes do Next.js
- Em Mobile (Capacitor): Direcionar para URL de producao

### 4.2 Implementacao Planejada

```typescript
// lib/api/client.ts

import { Capacitor } from '@capacitor/core';

const getBaseUrl = (): string => {
  // Se estiver rodando no Capacitor (mobile)
  if (Capacitor.isNativePlatform()) {
    return process.env.NEXT_PUBLIC_API_URL || 'https://api.uzzai.dev';
  }
  
  // Se estiver no servidor (SSR)
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  }
  
  // Se estiver no browser (CSR)
  return '/api';
};

export const apiClient = {
  baseUrl: getBaseUrl(),
  
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) throw new Error('API Error');
    return response.json();
  },
  
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('API Error');
    return response.json();
  },
  
  // ... outros metodos
};
```

---

## 5. Supabase Integration

### 5.1 Autenticacao

```typescript
// lib/supabase/client.ts

import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
```

### 5.2 Server Client

```typescript
// lib/supabase/server.ts

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = async () => {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
};
```

### 5.3 Middleware

```typescript
// middleware.ts

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  
  // Protege rotas autenticadas
  if (!user && request.nextUrl.pathname.startsWith('/(auth)')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  
  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 6. Variaveis de Ambiente (Doppler)

### 6.1 Estrutura

```
# .env.local (desenvolvimento)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# API
NEXT_PUBLIC_API_URL=http://localhost:8000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6.2 Doppler Setup

```bash
# Instalar Doppler CLI
brew install dopplerhq/cli/doppler

# Login
doppler login

# Setup projeto
doppler setup

# Rodar com variaveis
doppler run -- npm run dev
```

---

## 7. Responsividade

### 7.1 Breakpoints Tailwind

```typescript
// tailwind.config.ts

export default {
  theme: {
    screens: {
      'sm': '640px',   // Mobile landscape
      'md': '768px',   // Tablet
      'lg': '1024px',  // Desktop
      'xl': '1280px',  // Large desktop
      '2xl': '1536px', // Extra large
    },
  },
};
```

### 7.2 Hook de Media Query

```typescript
// lib/hooks/use-media-query.ts

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  
  return matches;
}

// Uso:
// const isMobile = useMediaQuery('(max-width: 768px)');
```

---

## 8. Componentes - Padroes

### 8.1 Estrutura de Componente

```typescript
// components/ui/example.tsx

import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { LucideIcon } from 'lucide-react';

export interface ExampleProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  variant?: 'default' | 'outline' | 'ghost';
}

const Example = React.forwardRef<HTMLDivElement, ExampleProps>(
  ({ className, icon: Icon, variant = 'default', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-2 rounded-md p-4',
          {
            'bg-primary text-primary-foreground': variant === 'default',
            'border border-input': variant === 'outline',
            'hover:bg-accent': variant === 'ghost',
          },
          className
        )}
        {...props}
      >
        {Icon && <Icon className="h-4 w-4" />}
        {children}
      </div>
    );
  }
);
Example.displayName = 'Example';

export { Example };
```

### 8.2 Icones - Sempre Lucide

```typescript
// CORRETO
import { Home, Settings, User, ChevronRight } from 'lucide-react';

// INCORRETO - NUNCA USAR
// <span>🏠</span>
// <span>⚙️</span>
```

---

## 9. Capacitor Setup

### 9.1 Instalacao

```bash
# Instalar Capacitor
npm install @capacitor/core @capacitor/cli

# Inicializar
npx cap init

# Adicionar plataformas
npx cap add android
npx cap add ios
```

### 9.2 Configuracao

```typescript
// capacitor.config.ts

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.uzzai.erp',
  appName: 'ERP UzzAI',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // URL da API em producao
    url: process.env.NEXT_PUBLIC_API_URL,
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
    },
  },
};

export default config;
```

### 9.3 Build Mobile

```bash
# Build Next.js (static export)
npm run build

# Sincronizar com Capacitor
npx cap sync

# Abrir Android Studio
npx cap open android

# Abrir Xcode
npx cap open ios
```

---

## 10. Checklist de Implementacao

### Fase 0: Setup Inicial

- [ ] Criar projeto Next.js 15
- [ ] Configurar TypeScript
- [ ] Configurar Tailwind CSS
- [ ] Configurar Shadcn/ui
- [ ] Criar estrutura de pastas
- [ ] Configurar ESLint e Prettier
- [ ] Configurar Doppler
- [ ] Setup Supabase (projeto)

### Fase 1: Core

- [ ] Implementar layout base (sidebar, topbar)
- [ ] Configurar autenticacao Supabase
- [ ] Criar API helper
- [ ] Implementar middleware de auth
- [ ] Criar paginas de login/registro

### Fase 2: Modulos Principais

- [ ] Dashboard
- [ ] Projetos
- [ ] Reunioes
- [ ] Acoes (Kanban)
- [ ] Equipe

### Fase 3: ERP Comercial

- [ ] Produtos
- [ ] Estoque
- [ ] Vendas/PDV
- [ ] Clientes

### Fase 4: Financeiro

- [ ] Fluxo de Caixa
- [ ] Contas a Pagar/Receber
- [ ] Notas Fiscais

### Fase 5: Mobile

- [ ] Configurar Capacitor
- [ ] Build Android
- [ ] Build iOS
- [ ] Testar API routing

---

## 11. Referencias

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Shadcn/ui Docs](https://ui.shadcn.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Capacitor Docs](https://capacitorjs.com/docs)
- [Doppler Docs](https://docs.doppler.com)
- [Lucide Icons](https://lucide.dev)

---

**Data de Criacao:** 2025-11-30
**Autor:** ERP-UzzAI Team
**Versao:** 1.0.0
