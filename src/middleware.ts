import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Middleware para proteger rotas autenticadas
 *
 * Rotas públicas: /, /login, /registro, /setup-tenant, /accept-invitation
 * Rotas protegidas: todas em (auth)
 *
 * Também verifica se usuário tem tenant_id e redireciona para /setup-tenant se não tiver
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas que não precisam de auth
  const publicRoutes = ['/', '/login', '/registro', '/setup-tenant', '/accept-invitation'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Verificar autenticação
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    // Se não está autenticado, redireciona para login
    if (!session) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Verificar se usuário tem tenant_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, tenant_id, is_active')
      .eq('id', session.user.id)
      .maybeSingle();

    // Se usuário não existe na tabela users OU não tem tenant_id OU não está ativo
    // Redireciona para setup-tenant
    if (!user || !user.tenant_id || !user.is_active) {
      // Não redireciona se já está na página de setup-tenant
      if (!pathname.startsWith('/setup-tenant')) {
        const redirectUrl = new URL('/setup-tenant', request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }

    // Se está autenticado e tem tenant, permite acesso
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);

    // Em caso de erro, redireciona para login por segurança
    const redirectUrl = new URL('/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};
