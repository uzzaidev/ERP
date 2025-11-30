import { createClient } from '@/lib/supabase/server';

/**
 * TESTES DE INTEGRAÇÃO - Usam Supabase REAL
 * 
 * Esses testes fazem requisições reais ao banco de dados.
 * Execute apenas quando quiser validar integração completa.
 * 
 * IMPORTANTE: Configure .env.test.local com credenciais de TESTE
 */

describe('Integration: Projects API', () => {
  // Skip por padrão - rode com: pnpm test:integration
  describe.skip('GET /api/projects - REAL DATABASE', () => {
    it('should fetch real projects from Supabase', async () => {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      console.log('✅ Conexão real com Supabase funcionando!');
      console.log('Projetos encontrados:', data?.length || 0);
    });

    it('should validate project schema', async () => {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from('projects')
        .select('id, code, name, status, budget')
        .limit(1)
        .single();

      if (data) {
        expect(data).toHaveProperty('id');
        expect(data).toHaveProperty('code');
        expect(data).toHaveProperty('name');
        expect(data).toHaveProperty('status');
        expect(data).toHaveProperty('budget');
        
        // Valida tipos
        expect(typeof data.id).toBe('string');
        expect(typeof data.code).toBe('string');
        expect(typeof data.name).toBe('string');
      }
    });
  });
});

describe('Integration: Tasks API', () => {
  describe.skip('GET /api/tasks - REAL DATABASE', () => {
    it('should fetch real tasks from Supabase', async () => {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          project:projects(id, code, name),
          assigned_to_user:users!tasks_assigned_to_fkey(id, name, email)
        `)
        .limit(5);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      
      console.log('✅ Tasks encontradas:', data?.length || 0);
      
      if (data && data.length > 0) {
        const task = data[0];
        expect(task).toHaveProperty('id');
        expect(task).toHaveProperty('title');
        expect(task).toHaveProperty('status');
        
        console.log('Exemplo de task:', {
          id: task.id,
          title: task.title,
          status: task.status,
          project: task.project?.name,
        });
      }
    });
  });
});

/**
 * COMO USAR:
 * 
 * 1. Testes Unitários (com mocks) - PADRÃO:
 *    pnpm test
 * 
 * 2. Testes de Integração (banco real):
 *    - Remova .skip dos describes acima
 *    - Configure .env.test.local
 *    - pnpm test:integration
 * 
 * 3. Rodar ambos:
 *    pnpm test:all
 */
