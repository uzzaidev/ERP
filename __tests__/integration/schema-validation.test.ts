import { createClient } from '@/lib/supabase/server';

/**
 * TESTE DE INTEGRAÇÃO CRÍTICO
 * 
 * Este teste valida que as queries da API correspondem ao schema REAL do banco.
 * 
 * Por que é importante?
 * - Testes unitários usam MOCKS e não pegam erros de schema
 * - Foreign keys erradas só aparecem em produção
 * - Nomes de colunas errados passam nos mocks
 * 
 * Execute: pnpm test:integration
 */

describe('Integration: API Schema Validation', () => {
  describe('Tasks API - Schema Consistency', () => {
    it('should validate that tasks foreign keys exist', async () => {
      const supabase = await createClient();
      
      // Tenta fazer a mesma query que a API faz
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          project:projects (id, code, name),
          sprint:sprints (id, name, start_date, end_date),
          assignee:users!tasks_assignee_id_fkey (
            id,
            full_name,
            email,
            avatar_url
          ),
          task_tags (
            tag:tags (id, name, color)
          )
        `)
        .limit(1);

      // Se der erro de foreign key, o teste FALHA
      if (error && error.code === 'PGRST200') {
        console.error('❌ ERRO DE SCHEMA:', error);
        console.error('Detalhes:', error.details);
        console.error('Hint:', error.hint);
      }

      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      console.log('✅ Tasks API schema está correto!');
      console.log('Tasks encontradas:', data?.length || 0);
    });

    it('should validate assignee_id column exists', async () => {
      const supabase = await createClient();
      
      // Tenta filtrar por assignee_id (como a API faz)
      const { data, error } = await supabase
        .from('tasks')
        .select('id, assignee_id')
        .limit(1);

      if (error && error.code === '42703') {
        console.error('❌ COLUNA assignee_id NÃO EXISTE!');
        console.error('Erro:', error.message);
      }

      expect(error).toBeNull();
      console.log('✅ Coluna assignee_id existe!');
    });

    it('should validate update with assignee_id works', async () => {
      const supabase = await createClient();
      
      // Busca uma task para atualizar
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id')
        .limit(1);

      if (!tasks || tasks.length === 0) {
        console.warn('⚠️  Nenhuma task para testar update');
        return;
      }

      const taskId = tasks[0].id;

      // Tenta fazer update (mesmo que não mude nada)
      const { error } = await supabase
        .from('tasks')
        .update({ assignee_id: null })
        .eq('id', taskId);

      if (error && error.code === '42703') {
        console.error('❌ UPDATE com assignee_id falhou!');
        console.error('Erro:', error.message);
      }

      expect(error).toBeNull();
      console.log('✅ Update com assignee_id funciona!');
    });
  });

  describe('Projects API - Schema Consistency', () => {
    it('should validate projects foreign key hint', async () => {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_members (
            user_id,
            role,
            users:users!project_members_user_id_fkey (
              id,
              full_name,
              email,
              avatar_url
            )
          )
        `)
        .limit(1);

      if (error && error.code === 'PGRST201') {
        console.error('❌ FOREIGN KEY AMBÍGUA!');
        console.error('Detalhes:', error.details);
        console.error('Hint:', error.hint);
      }

      expect(error).toBeNull();
      console.log('✅ Projects API schema está correto!');
    });

    it('should validate full_name column exists', async () => {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email')
        .limit(1);

      if (error && error.code === '42703') {
        console.error('❌ COLUNA full_name NÃO EXISTE!');
        console.error('Erro:', error.message);
        console.error('⚠️  Schema SQL deve ter "full_name", não "name"');
      }

      expect(error).toBeNull();
      console.log('✅ Coluna full_name existe!');
    });
  });

  describe('Users API - Schema Consistency', () => {
    it('should validate users.full_name is used', async () => {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, avatar_url')
        .eq('is_active', true)
        .limit(1);

      expect(error).toBeNull();
      
      if (data && data.length > 0) {
        expect(data[0]).toHaveProperty('full_name');
        console.log('✅ Users API retorna full_name corretamente!');
      }
    });
  });
});

/**
 * COMO INTERPRETAR RESULTADOS:
 * 
 * ✅ Todos passam:
 *    - Schema do banco está sincronizado com as APIs
 *    - Foreign keys corretas
 *    - Nomes de colunas corretos
 * 
 * ❌ Algum falha:
 *    - ERRO CRÍTICO: API não funciona em produção
 *    - Verificar:
 *      1. db/*.sql executado no Supabase?
 *      2. Foreign key hints corretos?
 *      3. Nomes de colunas correspondem?
 * 
 * FREQUÊNCIA:
 * - Execute ANTES de cada deploy
 * - Execute APÓS mudanças no schema SQL
 * - Execute se APIs retornam erros PGRST*
 */
