import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Middleware para proteger rotas autenticadas
 * 
 * Rotas públicas: /, /login, /registro
 * Rotas protegidas: todas em (auth)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas que não precisam de auth
  const publicRoutes = ['/', '/login', '/registro'];
  const isPublicRoute = publicRoutes.some(route => pathname === route);

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

    // Se está autenticado, permite acesso
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
