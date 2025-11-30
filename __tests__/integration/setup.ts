// Setup para testes de integração
// NÃO mocka nada - usa recursos reais

// Variáveis de ambiente devem vir do .env.local
// Se não existirem, avisar mas não quebrar
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('\n⚠️  NEXT_PUBLIC_SUPABASE_URL não configurada');
  console.warn('Configure .env.local para rodar testes de integração\n');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('\n⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada\n');
}

// Garantir que fetch existe (Node 18+ tem nativamente)
if (!global.fetch) {
  console.warn('⚠️  fetch não disponível, alguns testes podem falhar');
}
