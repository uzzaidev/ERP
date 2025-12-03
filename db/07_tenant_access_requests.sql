-- ========================================
-- TENANT ACCESS REQUESTS
-- Sistema de solicitações de acesso a tenants
-- ========================================

-- Tabela de solicitações de acesso
CREATE TABLE IF NOT EXISTS tenant_access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Solicitante
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,

    -- Tenant solicitado
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    tenant_slug VARCHAR(100) NOT NULL,

    -- Status da solicitação
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),

    -- Mensagem opcional do solicitante
    message TEXT,

    -- Aprovação/Rejeição
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(user_id, tenant_id, status) -- Previne múltiplas solicitações pendentes
);

-- Índices
CREATE INDEX idx_access_requests_tenant_id ON tenant_access_requests(tenant_id);
CREATE INDEX idx_access_requests_user_id ON tenant_access_requests(user_id);
CREATE INDEX idx_access_requests_status ON tenant_access_requests(status);
CREATE INDEX idx_access_requests_tenant_status ON tenant_access_requests(tenant_id, status);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_tenant_access_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tenant_access_requests_updated_at
    BEFORE UPDATE ON tenant_access_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_tenant_access_requests_updated_at();

-- Comentários
COMMENT ON TABLE tenant_access_requests IS 'Solicitações de acesso de usuários a tenants';
COMMENT ON COLUMN tenant_access_requests.status IS 'Status: pending, approved, rejected, cancelled';
COMMENT ON COLUMN tenant_access_requests.message IS 'Mensagem opcional do usuário explicando por que quer acesso';
COMMENT ON COLUMN tenant_access_requests.reviewed_by IS 'Admin que aprovou/rejeitou';
COMMENT ON COLUMN tenant_access_requests.rejection_reason IS 'Motivo da rejeição (se aplicável)';

\echo '✅ Tabela tenant_access_requests criada com sucesso!'
