'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Tenant, User } from '@/types/entities';

interface TenantContextType {
  tenant: Tenant | null;
  tenantId: string | null;
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

/**
 * Provider for tenant context
 * Fetches and provides tenant information for the authenticated user
 */
export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTenantData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch current user with tenant data
      const response = await fetch('/api/auth/me');
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setUser(result.data);
        setTenantId(result.data.tenant_id);
        
        // Fetch tenant details if we have tenant_id
        if (result.data.tenant_id) {
          const tenantResponse = await fetch(`/api/tenants/${result.data.tenant_id}`);
          
          if (tenantResponse.ok) {
            const tenantResult = await tenantResponse.json();
            if (tenantResult.success && tenantResult.data) {
              setTenant(tenantResult.data);
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.error('Error fetching tenant context:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantData();
  }, []);

  return (
    <TenantContext.Provider
      value={{
        tenant,
        tenantId,
        user,
        isLoading,
        error,
        refetch: fetchTenantData,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

/**
 * Hook to access tenant context
 * 
 * @throws Error if used outside TenantProvider
 * 
 * @example
 * ```tsx
 * const { tenant, tenantId, user } = useTenant();
 * 
 * // Fetch data filtered by tenant
 * const { data } = useQuery({
 *   queryKey: ['projects', tenantId],
 *   queryFn: () => fetchProjects(tenantId)
 * });
 * ```
 */
export function useTenant() {
  const context = useContext(TenantContext);

  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }

  return context;
}

/**
 * Hook to get tenant ID directly
 * Throws error if tenant is not loaded
 */
export function useTenantId(): string {
  const { tenantId, isLoading } = useTenant();

  if (isLoading) {
    throw new Error('Tenant is still loading');
  }

  if (!tenantId) {
    throw new Error('No tenant ID available');
  }

  return tenantId;
}

/**
 * Hook to check if user has specific permissions based on tenant limits
 */
export function useTenantLimits() {
  const { tenant } = useTenant();
  const [limits, setLimits] = useState<{
    canAddUser: boolean;
    canAddProject: boolean;
    currentUsage: any;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkLimits = async () => {
    if (!tenant?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/tenants/${tenant.id}/limits`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setLimits(result.data);
        }
      }
    } catch (error) {
      console.error('Error checking tenant limits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkLimits();
  }, [tenant?.id]);

  return {
    ...limits,
    isLoading,
    refetch: checkLimits,
  };
}
