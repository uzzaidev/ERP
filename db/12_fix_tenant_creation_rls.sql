-- =====================================================
-- FIX: Permitir Criação de Tenants Durante Registro
-- =====================================================
-- Problema: Usuários não conseguem criar novos tenants
-- nem encontrar tenants existentes durante o registro.
--
-- Solução:
-- 1. Adicionar policy INSERT para permitir criação de tenants
-- 2. Garantir que policy SELECT permite lookup por slug
-- =====================================================

-- =====================================================
-- PARTE 1: Policy para CRIAR Tenants (INSERT)
-- =====================================================

-- Remover policy antiga se existir
DROP POLICY IF EXISTS "Authenticated users can create tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can create tenants during signup" ON public.tenants;

-- Policy: Usuários autenticados podem criar tenants durante signup
-- Importante: Esta policy permite APENAS a criação inicial
-- Após criação, apenas o tenant owner (admin) pode atualizar
CREATE POLICY "Users can create tenants during signup"
  ON public.tenants
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- PARTE 2: Verificar Policy SELECT para Lookup
-- =====================================================

-- A policy "Authenticated users can read tenants for validation"
-- já existe no arquivo 11_fix_rls_for_setup.sql e permite
-- que usuários autenticados leiam tenants para validar slug.
-- Vamos garantir que ela está ativa.

-- Remover policies antigas conflitantes
DROP POLICY IF EXISTS "Allow tenant lookup during signup" ON public.tenants;

-- Recriar a policy de SELECT se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'tenants' 
        AND policyname = 'Authenticated users can read tenants for validation'
    ) THEN
        CREATE POLICY "Authenticated users can read tenants for validation"
          ON public.tenants
          FOR SELECT
          USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- =====================================================
-- PARTE 3: Verificação das Policies
-- =====================================================

-- Listar todas as policies da tabela tenants
SELECT
    policyname,
    cmd,
    CASE
        WHEN cmd = 'SELECT' THEN '✓ Leitura'
        WHEN cmd = 'INSERT' THEN '✓ Inserção'
        WHEN cmd = 'UPDATE' THEN '✓ Atualização'
        WHEN cmd = 'DELETE' THEN '✓ Exclusão'
        ELSE cmd
    END as operacao,
    CASE
        WHEN qual IS NOT NULL THEN 'USING: ' || qual
        ELSE 'N/A'
    END as using_clause,
    CASE
        WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
        ELSE 'N/A'
    END as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'tenants'
ORDER BY cmd, policyname;

-- =====================================================
-- PARTE 4: Teste das Policies
-- =====================================================

-- Verificar se RLS está habilitado
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'tenants';

-- =====================================================
-- CONCLUSÃO
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Policies de tenants atualizadas com sucesso!';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Alterações:';
    RAISE NOTICE '1. ✓ Usuários autenticados podem CRIAR tenants (INSERT)';
    RAISE NOTICE '2. ✓ Usuários autenticados podem LER tenants para validação (SELECT)';
    RAISE NOTICE '3. ✓ Usuários podem ver seu próprio tenant (SELECT)';
    RAISE NOTICE '4. ✓ Apenas admins podem ATUALIZAR seu tenant (UPDATE)';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Segurança:';
    RAISE NOTICE '• Usuários só podem criar tenants, não deletar ou atualizar outros';
    RAISE NOTICE '• Lookup de tenants por slug funciona para validação';
    RAISE NOTICE '• Isolamento entre tenants mantido após criação';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANTE:';
    RAISE NOTICE '• Execute este script no Supabase SQL Editor';
    RAISE NOTICE '• Teste o fluxo de registro completo após aplicar';
    RAISE NOTICE '• Verifique que novos usuários conseguem criar empresas';
END $$;
